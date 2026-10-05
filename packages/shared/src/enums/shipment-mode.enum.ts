import { z } from 'zod';

export enum ShipmentMode {
  AIR = 'air',
  SEA = 'sea',
}

export const ShipmentModeSchema = z.nativeEnum(ShipmentMode);
