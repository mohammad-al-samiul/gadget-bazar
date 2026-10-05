import {
  transitionOrderStatus,
  IllegalStateTransitionError,
  OrderStateContext,
} from './state-machine';

describe('Order State Machine & Two-Stage Payment Enforcement', () => {
  const baseOrder: OrderStateContext = {
    orderId: 'test-order-uuid-1',
    orderStatus: 'pending_product_payment',
    productPaymentStatus: 'paid',
    shippingPaymentStatus: 'pending_weighing',
    weightGrams: 500,
  };

  it('allows valid progressive transitions', () => {
    let order = transitionOrderStatus(baseOrder, 'product_paid_sourcing');
    expect(order.orderStatus).toBe('product_paid_sourcing');

    order = transitionOrderStatus(order, 'shipped_from_china');
    expect(order.orderStatus).toBe('shipped_from_china');

    order = transitionOrderStatus(order, 'arrived_bd_warehouse');
    expect(order.orderStatus).toBe('arrived_bd_warehouse');

    order = transitionOrderStatus(order, 'weighed_awaiting_shipping_payment');
    expect(order.orderStatus).toBe('weighed_awaiting_shipping_payment');

    // Simulate payment of shipping charge
    order.shippingPaymentStatus = 'paid';
    order = transitionOrderStatus(order, 'shipping_paid');
    expect(order.orderStatus).toBe('shipping_paid');

    order = transitionOrderStatus(order, 'out_for_delivery');
    expect(order.orderStatus).toBe('out_for_delivery');

    order = transitionOrderStatus(order, 'delivered');
    expect(order.orderStatus).toBe('delivered');
  });

  it('NON-NEGOTIABLE RULE: throws when attempting out_for_delivery without shipping paid', () => {
    const unpaidShippingOrder: OrderStateContext = {
      orderId: 'test-order-uuid-2',
      orderStatus: 'shipping_paid',
      productPaymentStatus: 'paid',
      shippingPaymentStatus: 'weighed_awaiting_payment', // NOT paid
    };

    expect(() => {
      transitionOrderStatus(unpaidShippingOrder, 'out_for_delivery');
    }).toThrow(IllegalStateTransitionError);
  });

  it('throws on illegal skip transitions', () => {
    expect(() => {
      transitionOrderStatus(baseOrder, 'delivered');
    }).toThrow(IllegalStateTransitionError);
  });
});
