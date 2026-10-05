import { z } from 'zod';
import {
  UUIDSchema,
  MoneyDecimalSchema,
  WeightGramsSchema,
  BangladeshPhoneSchema,
} from './primitives.dto';

export const DeliveryAddressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name must be at least 2 characters'),
  phone: BangladeshPhoneSchema,
  district: z.string().min(2, 'District is required'),
  thana: z.string().min(2, 'Thana is required'),
  streetAddress: z.string().min(5, 'Full street address is required'),
});

export type DeliveryAddress = z.infer<typeof DeliveryAddressSchema>;

export const OrderItemInputSchema = z.object({
  productId: UUIDSchema,
  variantId: UUIDSchema.optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPriceBdt: MoneyDecimalSchema,
  estimatedWeightGrams: WeightGramsSchema.optional(),
});

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

/**
 * CHECKOUT STAGE 1: Product Price Payment
 * Payment for goods at checkout before sourcing from China.
 * NON-NEGOTIABLE RULE: Idempotency-Key is mandatory on both checkout stages.
 */
export const CheckoutStage1DtoSchema = z.object({
  idempotencyKey: z.string().min(16, 'Idempotency key must be at least 16 characters'),
  items: z.array(OrderItemInputSchema).min(1, 'Order must contain at least one item'),
  deliveryAddress: DeliveryAddressSchema,
  notes: z.string().max(500).optional(),
});

export type CheckoutStage1Dto = z.infer<typeof CheckoutStage1DtoSchema>;

/**
 * CHECKOUT STAGE 2: Weighed Shipping & Customs Payment
 * Paid ONLY AFTER goods arrive in Bangladesh and are weighed on digital scale.
 * NON-NEGOTIABLE RULE: Idempotency-Key is mandatory on both checkout stages.
 */
export const CheckoutStage2DtoSchema = z.object({
  idempotencyKey: z.string().min(16, 'Idempotency key must be at least 16 characters'),
  orderId: UUIDSchema,
  verifiedWeightGrams: WeightGramsSchema,
  shippingAmountBdt: MoneyDecimalSchema,
});

export type CheckoutStage2Dto = z.infer<typeof CheckoutStage2DtoSchema>;
