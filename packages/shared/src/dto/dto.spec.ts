import { z } from 'zod';
import {
  UUIDSchema,
  MoneyDecimalSchema,
  WeightGramsSchema,
  BangladeshPhoneSchema,
} from './primitives.dto';
import { CheckoutStage1DtoSchema, CheckoutStage2DtoSchema } from './checkout.dto';
import { PublicTrackingDtoSchema } from './tracking.dto';
import { AdminProductDtoSchema, PublicProductDtoSchema } from './product.dto';

describe('DTO Validation & PII Boundary Schemas', () => {
  // ── Primitives ─────────────────────────────────────────────────────────
  describe('UUIDSchema', () => {
    it('accepts a valid UUID', () => {
      expect(() => UUIDSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
    });
    it('rejects a non-UUID string', () => {
      expect(() => UUIDSchema.parse('not-a-uuid')).toThrow(z.ZodError);
    });
  });

  describe('MoneyDecimalSchema', () => {
    it('accepts valid decimal strings', () => {
      expect(() => MoneyDecimalSchema.parse('1500')).not.toThrow();
      expect(() => MoneyDecimalSchema.parse('1500.50')).not.toThrow();
      expect(() => MoneyDecimalSchema.parse('0.99')).not.toThrow();
    });
    it('rejects invalid money formats', () => {
      expect(() => MoneyDecimalSchema.parse('-100')).toThrow(z.ZodError);
      expect(() => MoneyDecimalSchema.parse('abc')).toThrow(z.ZodError);
      expect(() => MoneyDecimalSchema.parse('1500.123')).toThrow(z.ZodError); // 3 decimal places
    });
  });

  describe('WeightGramsSchema', () => {
    it('accepts non-negative integers', () => {
      expect(() => WeightGramsSchema.parse(0)).not.toThrow();
      expect(() => WeightGramsSchema.parse(500)).not.toThrow();
    });
    it('rejects floats and negatives', () => {
      expect(() => WeightGramsSchema.parse(-1)).toThrow(z.ZodError);
      expect(() => WeightGramsSchema.parse(1.5)).toThrow(z.ZodError);
    });
  });

  describe('BangladeshPhoneSchema', () => {
    it('accepts valid BD phone numbers', () => {
      expect(() => BangladeshPhoneSchema.parse('01712345678')).not.toThrow();
      expect(() => BangladeshPhoneSchema.parse('+8801712345678')).not.toThrow();
    });
    it('rejects invalid phone formats', () => {
      expect(() => BangladeshPhoneSchema.parse('1234567890')).toThrow(z.ZodError);
      expect(() => BangladeshPhoneSchema.parse('00112345678')).toThrow(z.ZodError);
    });
  });

  // ── Checkout Stage 1 ───────────────────────────────────────────────────
  describe('CheckoutStage1DtoSchema', () => {
    const validPayload = {
      idempotencyKey: 'idem-key-16chars-ok',
      items: [
        {
          productId: '550e8400-e29b-41d4-a716-446655440000',
          quantity: 2,
          unitPriceBdt: '1200.00',
        },
      ],
      deliveryAddress: {
        recipientName: 'Rahim Uddin',
        phone: '01812345678',
        district: 'Dhaka',
        thana: 'Gulshan',
        streetAddress: '123 Main Road, Apt 4B',
      },
    };

    it('accepts a valid stage 1 checkout payload', () => {
      expect(() => CheckoutStage1DtoSchema.parse(validPayload)).not.toThrow();
    });

    it('rejects empty item list', () => {
      expect(() => CheckoutStage1DtoSchema.parse({ ...validPayload, items: [] })).toThrow(
        z.ZodError,
      );
    });

    it('rejects missing idempotency key', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { idempotencyKey: _key, ...rest } = validPayload;
      expect(() => CheckoutStage1DtoSchema.parse(rest)).toThrow(z.ZodError);
    });
  });

  // ── Checkout Stage 2 ───────────────────────────────────────────────────
  describe('CheckoutStage2DtoSchema', () => {
    it('accepts a valid stage 2 payload', () => {
      expect(() =>
        CheckoutStage2DtoSchema.parse({
          idempotencyKey: 'stage2-key-16chars',
          orderId: '550e8400-e29b-41d4-a716-446655440000',
          verifiedWeightGrams: 850,
          shippingAmountBdt: '350.00',
        }),
      ).not.toThrow();
    });
  });

  // ── PII Boundary: Public Tracking ─────────────────────────────────────
  describe('PublicTrackingDtoSchema — PII boundary', () => {
    it('does NOT expose customer name, phone, or address fields', () => {
      // Inspect the shape of the schema to confirm PII fields are absent
      const shape = (PublicTrackingDtoSchema as z.ZodObject<z.ZodRawShape>).shape;
      const exposedKeys = Object.keys(shape);
      expect(exposedKeys).not.toContain('recipientName');
      expect(exposedKeys).not.toContain('phone');
      expect(exposedKeys).not.toContain('customerEmail');
      expect(exposedKeys).not.toContain('streetAddress');
    });

    it('does NOT expose sourcing_price_cny in public tracking', () => {
      const shape = (PublicTrackingDtoSchema as z.ZodObject<z.ZodRawShape>).shape;
      expect(Object.keys(shape)).not.toContain('sourcingPriceCny');
    });

    it('accepts a valid public tracking response', () => {
      expect(() =>
        PublicTrackingDtoSchema.parse({
          trackingNumber: 'GB-2024-0001',
          orderStatus: 'shipped_from_china',
          currentMilestoneBn: 'চীন থেকে পাঠানো হয়েছে',
          currentMilestoneEn: 'Shipped from China',
          events: [],
        }),
      ).not.toThrow();
    });
  });

  // ── PII Boundary: Product DTOs ─────────────────────────────────────────
  describe('Product DTO PII boundaries', () => {
    it('PublicProductDtoSchema does NOT include sourcing_price_cny', () => {
      const shape = (PublicProductDtoSchema as z.ZodObject<z.ZodRawShape>).shape;
      expect(Object.keys(shape)).not.toContain('sourcingPriceCny');
    });

    it('AdminProductDtoSchema includes sourcing_price_cny', () => {
      const shape = (AdminProductDtoSchema as z.ZodObject<z.ZodRawShape>).shape;
      expect(Object.keys(shape)).toContain('sourcingPriceCny');
    });
  });
});
