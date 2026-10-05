import { z } from 'zod';

export const MoneyDecimalSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal money format (e.g. 1500 or 1500.50)');

export const WeightGramsSchema = z
  .number()
  .int('Weight must be an integer')
  .nonnegative('Weight in grams cannot be negative');

export const OrderIdSchema = z.string().uuid('Order ID must be a valid UUID');

export const CheckoutPayloadSchema = z.object({
  idempotencyKey: z.string().min(16, 'Idempotency-Key must have sufficient entropy'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPriceBdt: MoneyDecimalSchema,
      }),
    )
    .min(1, 'Order must contain at least one item'),
  deliveryAddress: z.object({
    recipientName: z.string().min(2),
    phone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Must be a valid Bangladesh phone number'),
    district: z.string().min(2),
    thana: z.string().min(2),
    streetAddress: z.string().min(5),
  }),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
