import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';
import { ConfigService } from './modules/config/config.service';
import { RedisService } from './modules/redis/redis.service';
import { PrismaService } from './modules/prisma/prisma.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);
  const prismaService = app.get(PrismaService);
  const reflector = app.get(Reflector);

  // 1. Pino Logger
  app.useLogger(app.get(Logger));

  // 2. Helmet Security Headers
  app.use(helmet());

  // 3. Locked CORS
  app.enableCors({
    origin: configService.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-correlation-id'],
  });

  // 4. URI Versioning (/v1)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 5. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 6. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 7. Global Interceptors
  app.useGlobalInterceptors(
    new IdempotencyInterceptor(reflector, redisService),
    new AuditLogInterceptor(reflector, prismaService),
  );

  // 8. Swagger / OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GadgetBazar API')
    .setDescription(
      'High-performance China-import gadget marketplace API for Bangladesh. Implements two-stage checkout, idempotent payments, and RBAC.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'Idempotency-Key',
        description: 'Required for non-idempotent operations (checkout, group deal join, payments)',
      },
      'idempotency',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Export openapi.json for client generation
  const openapiPath = path.resolve(__dirname, '../openapi.json');
  fs.writeFileSync(openapiPath, JSON.stringify(document, null, 2));

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'GadgetBazar API Documentation',
  });

  const port = configService.get('PORT');
  await app.listen(port);
  app.get(Logger).log(`🚀 GadgetBazar API running on http://localhost:${port}/v1`);
  app.get(Logger).log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
}

bootstrap();
