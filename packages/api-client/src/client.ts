import { ClientConfig, ApiResponse, TrackingPublicResult } from './types';

export class GadgetBazarApiClient {
  private baseUrl: string;
  private getAuthToken?: () => string | null | Promise<string | null>;
  private timeoutMs: number;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getAuthToken = config.getAuthToken;
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  async getHealthLive(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/live');
  }

  async getHealthReady(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health/ready');
  }

  async getPublicTracking(trackingNumber: string): Promise<ApiResponse<TrackingPublicResult>> {
    return this.request<ApiResponse<TrackingPublicResult>>(
      `/v1/tracking/${encodeURIComponent(trackingNumber)}`,
    );
  }
}
