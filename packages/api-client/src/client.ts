import { ClientConfig, ApiResponse, TrackingPublicResult } from './types';

export class GadgetBazarApiClient {
  private baseUrl: string;
  private getAuthToken?: () => string | null | Promise<string | null>;
  private onRefreshToken?: () => Promise<string | null>;
  private onAuthFailure?: () => void;
  private timeoutMs: number;

  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getAuthToken = config.getAuthToken;
    this.onRefreshToken = config.onRefreshToken;
    this.onAuthFailure = config.onAuthFailure;
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  private subscribeTokenRefresh(cb: (token: string | null) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      // Intercept 401 Unauthorized for silent token refresh
      if (response.status === 401 && !isRetry && this.onRefreshToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const newToken = await this.onRefreshToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);

            if (newToken) {
              return this.request<T>(endpoint, options, true);
            } else {
              this.onAuthFailure?.();
            }
          } catch (refreshErr) {
            this.isRefreshing = false;
            this.onRefreshed(null);
            this.onAuthFailure?.();
            throw refreshErr;
          }
        } else {
          // If already refreshing, wait for active refresh to resolve
          return new Promise<T>((resolve, reject) => {
            this.subscribeTokenRefresh(async (token) => {
              if (token) {
                try {
                  const retryRes = await this.request<T>(endpoint, options, true);
                  resolve(retryRes);
                } catch (e) {
                  reject(e);
                }
              } else {
                reject(new Error('Session expired: silent refresh failed'));
              }
            });
          });
        }
      }

      if (!response.ok) {
        throw new Error(
          `API Request failed with status ${response.status}: ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Health
  async getHealthLive(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/live');
  }

  async getHealthReady(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/ready');
  }

  // Tracking
  async getPublicTracking(trackingNumber: string): Promise<ApiResponse<TrackingPublicResult>> {
    return this.request<ApiResponse<TrackingPublicResult>>(
      `/v1/tracking/${encodeURIComponent(trackingNumber)}`,
    );
  }

  // Catalog
  async getCategories(): Promise<any[]> {
    return this.request<any[]>('/v1/catalog/categories');
  }

  async getProducts(params?: Record<string, any>): Promise<any> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/v1/catalog/products${query}`);
  }

  async getProduct(idOrSku: string): Promise<any> {
    return this.request<any>(`/v1/catalog/products/${encodeURIComponent(idOrSku)}`);
  }

  async searchProducts(q: string, limit = 20): Promise<any[]> {
    return this.request<any[]>(`/v1/catalog/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  }

  async compareProducts(ids: string[]): Promise<any> {
    return this.request<any>(`/v1/catalog/compare?ids=${ids.join(',')}`);
  }

  async getBundleSuggestions(id: string): Promise<any[]> {
    return this.request<any[]>(`/v1/catalog/products/${id}/bundle-suggestions`);
  }

  // Media
  async getUploadUrl(dto: {
    fileName: string;
    contentType: string;
    fileSize: number;
    category: string;
  }): Promise<any> {
    return this.request<any>('/v1/media/upload-url', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async verifyUpload(dto: { key: string; category: string }): Promise<any> {
    return this.request<any>('/v1/media/verify', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getPrivateSignedUrl(key: string, expiresInSeconds = 300): Promise<any> {
    return this.request<any>(
      `/v1/media/signed-url?key=${encodeURIComponent(key)}&expiresInSeconds=${expiresInSeconds}`,
    );
  }
}
