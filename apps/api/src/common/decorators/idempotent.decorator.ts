import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'IDEMPOTENT_KEY';

export interface IdempotentOptions {
  ttlSeconds?: number;
}

export const Idempotent = (options: IdempotentOptions = { ttlSeconds: 86400 }) =>
  SetMetadata(IDEMPOTENT_KEY, options);
