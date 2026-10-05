import { z } from 'zod';

export enum DealStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  TARGET_REACHED = 'target_reached',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export const DealStatusSchema = z.nativeEnum(DealStatus);
