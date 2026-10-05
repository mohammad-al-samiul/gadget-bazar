import {
  transitionOrderStatus,
  canTransition,
  allowedTransitions,
  IllegalStateTransitionError,
  OrderStateContext,
} from './state-machine';
import { OrderStatus } from '../enums/order-status.enum';
import { ProductPaymentStatus, ShippingPaymentStatus } from '../enums/payment-status.enum';

describe('Order State Machine & Two-Stage Payment Enforcement', () => {
  const baseOrder: OrderStateContext = {
    orderId: 'test-order-uuid-1',
    orderStatus: OrderStatus.PENDING_PRODUCT_PAYMENT,
    productPaymentStatus: ProductPaymentStatus.PAID,
    shippingPaymentStatus: ShippingPaymentStatus.PENDING_WEIGHING,
    weightGrams: 500,
  };

  // ── Legal full lifecycle ─────────────────────────────────────────────────
  it('allows valid progressive transitions through the full lifecycle', () => {
    let order = transitionOrderStatus(baseOrder, OrderStatus.PRODUCT_PAID_SOURCING);
    expect(order.orderStatus).toBe(OrderStatus.PRODUCT_PAID_SOURCING);

    order = transitionOrderStatus(order, OrderStatus.SOURCING_CONFIRMED);
    expect(order.orderStatus).toBe(OrderStatus.SOURCING_CONFIRMED);

    order = transitionOrderStatus(order, OrderStatus.SHIPPED_FROM_CHINA);
    expect(order.orderStatus).toBe(OrderStatus.SHIPPED_FROM_CHINA);

    order = transitionOrderStatus(order, OrderStatus.ARRIVED_BD_WAREHOUSE);
    expect(order.orderStatus).toBe(OrderStatus.ARRIVED_BD_WAREHOUSE);

    order = transitionOrderStatus(order, OrderStatus.AWAITING_WEIGHT);
    expect(order.orderStatus).toBe(OrderStatus.AWAITING_WEIGHT);

    order = transitionOrderStatus(order, OrderStatus.WEIGHED_AWAITING_SHIPPING_PAYMENT);
    expect(order.orderStatus).toBe(OrderStatus.WEIGHED_AWAITING_SHIPPING_PAYMENT);

    // Simulate shipping payment received
    order = { ...order, shippingPaymentStatus: ShippingPaymentStatus.PAID };
    order = transitionOrderStatus(order, OrderStatus.SHIPPING_PAID);
    expect(order.orderStatus).toBe(OrderStatus.SHIPPING_PAID);

    order = transitionOrderStatus(order, OrderStatus.OUT_FOR_DELIVERY);
    expect(order.orderStatus).toBe(OrderStatus.OUT_FOR_DELIVERY);

    order = transitionOrderStatus(order, OrderStatus.DELIVERED);
    expect(order.orderStatus).toBe(OrderStatus.DELIVERED);
  });

  // ── NON-NEGOTIABLE: out_for_delivery requires shipping paid ───────────────
  it('NON-NEGOTIABLE RULE: throws when attempting out_for_delivery without shipping paid', () => {
    const order: OrderStateContext = {
      orderId: 'test-order-uuid-2',
      orderStatus: OrderStatus.SHIPPING_PAID,
      productPaymentStatus: ProductPaymentStatus.PAID,
      shippingPaymentStatus: ShippingPaymentStatus.WEIGHED_AWAITING_PAYMENT, // NOT paid
    };

    expect(() => transitionOrderStatus(order, OrderStatus.OUT_FOR_DELIVERY)).toThrow(
      IllegalStateTransitionError,
    );
  });

  // ── Illegal jump: awaiting_weight -> shipping_paid (the spec example) ────
  it('throws on illegal jump: AWAITING_WEIGHT -> SHIPPING_PAID (skips weighing step)', () => {
    const order: OrderStateContext = {
      orderId: 'test-order-uuid-3',
      orderStatus: OrderStatus.AWAITING_WEIGHT,
      productPaymentStatus: ProductPaymentStatus.PAID,
      shippingPaymentStatus: ShippingPaymentStatus.PAID,
    };

    expect(() => transitionOrderStatus(order, OrderStatus.SHIPPING_PAID)).toThrow(
      IllegalStateTransitionError,
    );
  });

  it('throws on illegal jump: WEIGHED_AWAITING_SHIPPING_PAYMENT -> OUT_FOR_DELIVERY (skips SHIPPING_PAID)', () => {
    const order: OrderStateContext = {
      orderId: 'test-order-uuid-4',
      orderStatus: OrderStatus.WEIGHED_AWAITING_SHIPPING_PAYMENT,
      productPaymentStatus: ProductPaymentStatus.PAID,
      shippingPaymentStatus: ShippingPaymentStatus.PAID, // even if paid, graph forbids this jump
    };

    expect(() => transitionOrderStatus(order, OrderStatus.OUT_FOR_DELIVERY)).toThrow(
      IllegalStateTransitionError,
    );
  });

  it('throws on large skip: PENDING_PRODUCT_PAYMENT -> DELIVERED', () => {
    expect(() => transitionOrderStatus(baseOrder, OrderStatus.DELIVERED)).toThrow(
      IllegalStateTransitionError,
    );
  });

  // ── Product payment guard ─────────────────────────────────────────────────
  it('throws when transitioning to PRODUCT_PAID_SOURCING but product not paid', () => {
    const unpaidOrder: OrderStateContext = {
      ...baseOrder,
      productPaymentStatus: ProductPaymentStatus.PENDING,
    };

    expect(() => transitionOrderStatus(unpaidOrder, OrderStatus.PRODUCT_PAID_SOURCING)).toThrow(
      IllegalStateTransitionError,
    );
  });

  // ── Terminal states ───────────────────────────────────────────────────────
  it('throws when transitioning out of terminal state DELIVERED', () => {
    const deliveredOrder: OrderStateContext = {
      ...baseOrder,
      orderStatus: OrderStatus.DELIVERED,
    };

    expect(() => transitionOrderStatus(deliveredOrder, OrderStatus.CANCELLED)).toThrow(
      IllegalStateTransitionError,
    );
  });

  it('throws when transitioning out of terminal state CANCELLED', () => {
    const cancelledOrder: OrderStateContext = {
      ...baseOrder,
      orderStatus: OrderStatus.CANCELLED,
    };

    expect(() => transitionOrderStatus(cancelledOrder, OrderStatus.PRODUCT_PAID_SOURCING)).toThrow(
      IllegalStateTransitionError,
    );
  });

  // ── canTransition() utility ───────────────────────────────────────────────
  describe('canTransition()', () => {
    it('returns true for allowed transitions', () => {
      expect(
        canTransition(OrderStatus.PENDING_PRODUCT_PAYMENT, OrderStatus.PRODUCT_PAID_SOURCING),
      ).toBe(true);
      expect(canTransition(OrderStatus.SHIPPING_PAID, OrderStatus.OUT_FOR_DELIVERY)).toBe(true);
      expect(canTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED)).toBe(true);
      expect(canTransition(OrderStatus.PRODUCT_PAID_SOURCING, OrderStatus.CANCELLED)).toBe(true);
    });

    it('returns false for disallowed transitions', () => {
      expect(canTransition(OrderStatus.PENDING_PRODUCT_PAYMENT, OrderStatus.DELIVERED)).toBe(false);
      expect(
        canTransition(OrderStatus.WEIGHED_AWAITING_SHIPPING_PAYMENT, OrderStatus.OUT_FOR_DELIVERY),
      ).toBe(false);
      expect(canTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
      expect(canTransition(OrderStatus.CANCELLED, OrderStatus.PENDING_PRODUCT_PAYMENT)).toBe(false);
      // The spec-specified illegal case
      expect(canTransition(OrderStatus.AWAITING_WEIGHT, OrderStatus.SHIPPING_PAID)).toBe(false);
    });

    it('covers every status in the graph (exhaustive node check)', () => {
      const allStatuses = Object.keys(allowedTransitions) as OrderStatus[];
      expect(allStatuses.length).toBeGreaterThan(0);
      for (const status of allStatuses) {
        expect(allowedTransitions[status]).toBeDefined();
      }
    });
  });

  // ── Error identity ────────────────────────────────────────────────────────
  it('throws an instance of IllegalStateTransitionError with correct name', () => {
    expect.assertions(2);
    try {
      transitionOrderStatus(baseOrder, OrderStatus.DELIVERED);
    } catch (err) {
      expect(err).toBeInstanceOf(IllegalStateTransitionError);
      expect((err as Error).name).toBe('IllegalStateTransitionError');
    }
  });
});
