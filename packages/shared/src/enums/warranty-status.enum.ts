import { z } from 'zod';

export enum WarrantyStatus {
  NOT_APPLICABLE = 'not_applicable',
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  REPLACED = 'replaced',
  EXPIRED = 'expired',
  VOID = 'void',
}

export const WarrantyStatusSchema = z.nativeEnum(WarrantyStatus);
