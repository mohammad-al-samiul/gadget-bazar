import { OrderStateContext } from '@gadgetbazar/shared';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ClientConfig {
  baseUrl: string;
  getAuthToken?: () => string | null | Promise<string | null>;
  timeoutMs?: number;
}

export interface TrackingPublicResult {
  trackingNumber: string;
  status: string;
  timeline: Array<{
    timestamp: string;
    status: string;
    description: string;
  }>;
  // NOTE: Strictly no customer PII (name, phone, address) or sourcing_price_cny
}

export interface OrderDetails extends OrderStateContext {
  id: string;
  createdAt: string;
  updatedAt: string;
}
