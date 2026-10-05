import { OrderStatus } from '../enums/order-status.enum';
import { ProductPaymentStatus, ShippingPaymentStatus } from '../enums/payment-status.enum';

export class IllegalStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalStateTransitionError';
  }
}

export interface OrderStateContext {
  orderId: string;
  orderStatus: OrderStatus;
  productPaymentStatus: ProductPaymentStatus;
  shippingPaymentStatus: ShippingPaymentStatus;
  weightGrams?: number;
}

/** Allowed order status transitions. */
export const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.PENDING_PRODUCT_PAYMENT]: [OrderStatus.PRODUCT_PAID_SOURCING, OrderStatus.CANCELLED],
  [OrderStatus.PRODUCT_PAYMENT_FAILED]: [
    OrderStatus.PENDING_PRODUCT_PAYMENT,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PRODUCT_PAID_SOURCING]: [OrderStatus.SOURCING_CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.SOURCING_CONFIRMED]: [OrderStatus.SHIPPED_FROM_CHINA, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED_FROM_CHINA]: [OrderStatus.ARRIVED_BD_WAREHOUSE],
  [OrderStatus.ARRIVED_BD_WAREHOUSE]: [OrderStatus.AWAITING_WEIGHT],
  [OrderStatus.AWAITING_WEIGHT]: [OrderStatus.WEIGHED_AWAITING_SHIPPING_PAYMENT],
  [OrderStatus.WEIGHED_AWAITING_SHIPPING_PAYMENT]: [
    OrderStatus.SHIPPING_PAID,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPING_PAID]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
} as const;

/**
 * Returns true if transitioning from `from` to `to` is structurally allowed
 * (graph check only — does NOT enforce payment guards).
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (allowedTransitions[from] as readonly OrderStatus[]).includes(to);
}

/**
 * Validates and applies an order state transition.
 * NON-NEGOTIABLE RULE: An order can never reach OUT_FOR_DELIVERY unless shippingPaymentStatus = PAID.
 */
export function transitionOrderStatus(
  context: OrderStateContext,
  targetStatus: OrderStatus,
): OrderStateContext {
  const { orderStatus, productPaymentStatus, shippingPaymentStatus } = context;

  // Graph-level check
  if (!canTransition(orderStatus, targetStatus)) {
    throw new IllegalStateTransitionError(
      `Illegal transition from '${orderStatus}' to '${targetStatus}' for order ${context.orderId}.`,
    );
  }

  // Payment guards
  if (
    orderStatus === OrderStatus.PENDING_PRODUCT_PAYMENT &&
    targetStatus === OrderStatus.PRODUCT_PAID_SOURCING
  ) {
    if (productPaymentStatus !== ProductPaymentStatus.PAID) {
      throw new IllegalStateTransitionError(
        `Cannot transition to '${OrderStatus.PRODUCT_PAID_SOURCING}' while product_payment_status is '${productPaymentStatus}'.`,
      );
    }
  }

  if (targetStatus === OrderStatus.OUT_FOR_DELIVERY) {
    if (shippingPaymentStatus !== ShippingPaymentStatus.PAID) {
      throw new IllegalStateTransitionError(
        `Cannot transition order ${context.orderId} to '${OrderStatus.OUT_FOR_DELIVERY}': shipping_payment_status is '${shippingPaymentStatus}', must be 'paid'.`,
      );
    }
  }

  return {
    ...context,
    orderStatus: targetStatus,
  };
}
