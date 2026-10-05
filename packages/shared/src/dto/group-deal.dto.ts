import { z } from 'zod';
import { UUIDSchema } from './primitives.dto';
import { DealStatusSchema } from '../enums/deal-status.enum';

export const GroupDealJoinDtoSchema = z.object({
  dealId: UUIDSchema,
  quantity: z.number().int().positive().default(1),
  idempotencyKey: z.string().min(16),
});

export type GroupDealJoinDto = z.infer<typeof GroupDealJoinDtoSchema>;

export const GroupDealSummaryDtoSchema = z.object({
  dealId: UUIDSchema,
  productId: UUIDSchema,
  status: DealStatusSchema,
  targetParticipants: z.number().int().positive(),
  currentParticipants: z.number().int().nonnegative(),
  expiresAt: z.string().datetime(),
});

export type GroupDealSummaryDto = z.infer<typeof GroupDealSummaryDtoSchema>;
