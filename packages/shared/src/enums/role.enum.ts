import { z } from 'zod';

export enum Role {
  CUSTOMER = 'customer',
  DEALER = 'dealer',
  RIDER = 'rider',
  ADMIN = 'admin',
  WAREHOUSE_STAFF = 'warehouse_staff',
}

export const RoleSchema = z.nativeEnum(Role);
