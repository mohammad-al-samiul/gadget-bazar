import { z } from 'zod';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

export const PaymentStatusSchema = z.nativeEnum(PaymentStatus);

/**
 * NON-NEGOTIABLE BUSINESS RULE:
 * Two-stage payment: product price at checkout; shipping/customs only AFTER goods arrive in Bangladesh and are weighed.
 * Two separate PAYMENT records and statuses (product_payment_status, shipping_payment_status). Never merge.
 */
export enum ProductPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const ProductPaymentStatusSchema = z.nativeEnum(ProductPaymentStatus);

export enum ShippingPaymentStatus {
  PENDING_WEIGHING = 'pending_weighing',
  WEIGHED_AWAITING_PAYMENT = 'weighed_awaiting_payment',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const ShippingPaymentStatusSchema = z.nativeEnum(ShippingPaymentStatus);
