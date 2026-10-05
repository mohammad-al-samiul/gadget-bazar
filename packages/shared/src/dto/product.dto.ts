import { z } from 'zod';
import { UUIDSchema, MoneyDecimalSchema, WeightGramsSchema } from './primitives.dto';

export const BaseProductDtoSchema = z.object({
  id: UUIDSchema,
  sku: z.string().min(3),
  titleBn: z.string().min(2),
  titleEn: z.string().min(2),
  descriptionBn: z.string().optional(),
  descriptionEn: z.string().optional(),
  retailPriceBdt: MoneyDecimalSchema,
  dealerPriceBdt: MoneyDecimalSchema.optional(),
  moq: z.number().int().positive().default(1),
  estimatedWeightGrams: WeightGramsSchema,
  images: z.array(z.string().url()),
  categorySlug: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * ADMIN ONLY PRODUCT DTO:
 * Contains the confidential China factory sourcing price (sourcing_price_cny).
 */
export const AdminProductDtoSchema = BaseProductDtoSchema.extend({
  sourcingPriceCny: MoneyDecimalSchema,
  supplierId: UUIDSchema.optional(),
  supplierNotes: z.string().optional(),
});

export type AdminProductDto = z.infer<typeof AdminProductDtoSchema>;

/**
 * PUBLIC / CUSTOMER PRODUCT DTO:
 * NON-NEGOTIABLE RULE: Public responses must NEVER contain sourcing_price_cny.
 */
export const PublicProductDtoSchema = BaseProductDtoSchema;

export type PublicProductDto = z.infer<typeof PublicProductDtoSchema>;
