import { z } from 'zod';

export enum OrderStatus {
  PENDING_PRODUCT_PAYMENT = 'pending_product_payment',
  PRODUCT_PAYMENT_FAILED = 'product_payment_failed',
  PRODUCT_PAID_SOURCING = 'product_paid_sourcing',
  SOURCING_CONFIRMED = 'sourcing_confirmed',
  SHIPPED_FROM_CHINA = 'shipped_from_china',
  ARRIVED_BD_WAREHOUSE = 'arrived_bd_warehouse',
  AWAITING_WEIGHT = 'awaiting_weight',
  WEIGHED_AWAITING_SHIPPING_PAYMENT = 'weighed_awaiting_shipping_payment',
  SHIPPING_PAID = 'shipping_paid',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export const OrderStatusSchema = z.nativeEnum(OrderStatus);
