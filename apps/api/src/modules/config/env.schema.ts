import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  ELASTICSEARCH_NODE: z.string().default('http://localhost:9200'),
  SSLCOMMERZ_STORE_ID: z.string().default('test_store_id'),
  SSLCOMMERZ_STORE_PASSWORD: z.string().default('test_store_password'),
  SSLCOMMERZ_IS_SANDBOX: z.coerce.boolean().default(true),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 chars')
    .default('super_secret_development_key_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z
    .string()
    .default(
      'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003',
    ),
  R2_ACCOUNT_ID: z.string().default('mock-r2-account'),
  R2_ACCESS_KEY_ID: z.string().default('mock-access-key'),
  R2_SECRET_ACCESS_KEY: z.string().default('mock-secret-key'),
  R2_PUBLIC_BUCKET: z.string().default('gadgetbazar-public'),
  R2_PUBLIC_URL: z.string().default('https://cdn.gadgetbazar.com'),
  R2_PRIVATE_BUCKET: z.string().default('gadgetbazar-private'),
  R2_ENDPOINT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(config);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Environment validation error: ${errorMessages}`);
  }
  return result.data;
}
