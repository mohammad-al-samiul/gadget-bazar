export type ProductPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ShippingPaymentStatus =
  'pending_weighing' | 'weighed_awaiting_payment' | 'paid' | 'failed' | 'refunded';

export type OrderStatus =
  | 'pending_product_payment'
  | 'product_paid_sourcing'
  | 'shipped_from_china'
  | 'arrived_bd_warehouse'
  | 'weighed_awaiting_shipping_payment'
  | 'shipping_paid'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

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

/**
 * Validates transition of an order from current state to target state.
 * NON-NEGOTIABLE RULE: An order can never reach `out_for_delivery` unless `shippingPaymentStatus = 'paid'`.
 */
export function transitionOrderStatus(
  context: OrderStateContext,
  targetStatus: OrderStatus,
): OrderStateContext {
  const { orderStatus, productPaymentStatus, shippingPaymentStatus } = context;

  if (targetStatus === 'out_for_delivery') {
    if (shippingPaymentStatus !== 'paid') {
      throw new IllegalStateTransitionError(
        `Cannot transition order ${context.orderId} to 'out_for_delivery': shipping_payment_status is '${shippingPaymentStatus}', must be 'paid'.`,
      );
    }
  }

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending_product_payment: ['product_paid_sourcing', 'cancelled'],
    product_paid_sourcing: ['shipped_from_china', 'cancelled'],
    shipped_from_china: ['arrived_bd_warehouse'],
    arrived_bd_warehouse: ['weighed_awaiting_shipping_payment'],
    weighed_awaiting_shipping_payment: ['shipping_paid', 'cancelled'],
    shipping_paid: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  const allowed = allowedTransitions[orderStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new IllegalStateTransitionError(
      `Illegal transition from '${orderStatus}' to '${targetStatus}' for order ${context.orderId}.`,
    );
  }

  if (orderStatus === 'pending_product_payment' && targetStatus === 'product_paid_sourcing') {
    if (productPaymentStatus !== 'paid') {
      throw new IllegalStateTransitionError(
        `Cannot transition to 'product_paid_sourcing' while product_payment_status is '${productPaymentStatus}'.`,
      );
    }
  }

  return {
    ...context,
    orderStatus: targetStatus,
  };
}
