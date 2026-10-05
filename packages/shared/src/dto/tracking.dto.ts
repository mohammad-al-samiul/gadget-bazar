import { z } from 'zod';
import { OrderStatusSchema } from '../enums/order-status.enum';
import { ShipmentStatusSchema } from '../enums/shipment-status.enum';

export const TrackingTimelineEventSchema = z.object({
  id: z.string(),
  status: z.union([OrderStatusSchema, ShipmentStatusSchema]),
  titleBn: z.string(),
  titleEn: z.string(),
  locationCity: z.string().optional(),
  timestamp: z.string().datetime(),
});

export type TrackingTimelineEvent = z.infer<typeof TrackingTimelineEventSchema>;

/**
 * PUBLIC TRACKING DTO:
 * NON-NEGOTIABLE RULE: Public tracking exposes NO PII.
 * Strictly no customer name, no recipient phone number, no street address, and no sourcing price.
 */
export const PublicTrackingDtoSchema = z.object({
  trackingNumber: z.string().min(5),
  orderStatus: OrderStatusSchema,
  currentMilestoneBn: z.string(),
  currentMilestoneEn: z.string(),
  estimatedDeliveryDate: z.string().optional(),
  events: z.array(TrackingTimelineEventSchema),
});

export type PublicTrackingDto = z.infer<typeof PublicTrackingDtoSchema>;
