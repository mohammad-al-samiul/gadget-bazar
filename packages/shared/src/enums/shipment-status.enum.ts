import { z } from 'zod';

export enum ShipmentStatus {
  PENDING = 'pending',
  WAREHOUSE_RECEIVED_CHINA = 'warehouse_received_china',
  CUSTOMS_CLEARANCE_CHINA = 'customs_clearance_china',
  IN_TRANSIT_AIR = 'in_transit_air',
  IN_TRANSIT_SEA = 'in_transit_sea',
  CUSTOMS_CLEARANCE_BD = 'customs_clearance_bd',
  WAREHOUSE_RECEIVED_BD = 'warehouse_received_bd',
  WEIGHED = 'weighed',
  READY_FOR_DISPATCH = 'ready_for_dispatch',
}

export const ShipmentStatusSchema = z.nativeEnum(ShipmentStatus);
