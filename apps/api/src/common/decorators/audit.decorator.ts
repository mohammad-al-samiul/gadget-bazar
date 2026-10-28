import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDIT_METADATA_KEY = 'AUDIT_METADATA_KEY';

export interface AuditOptions {
  entity: string;
  action?: AuditAction;
}

export const Audit = (entityOrOptions: string | AuditOptions) => {
  const options =
    typeof entityOrOptions === 'string' ? { entity: entityOrOptions } : entityOrOptions;
  return SetMetadata(AUDIT_METADATA_KEY, options);
};
