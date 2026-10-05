import { z } from 'zod';

export enum DeliveryTaskStatus {
  PENDING_ASSIGNMENT = 'pending_assignment',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED_TO_HUB = 'returned_to_hub',
}

export const DeliveryTaskStatusSchema = z.nativeEnum(DeliveryTaskStatus);
