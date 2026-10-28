import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  const outPath = path.resolve(__dirname, '../openapi.json');
  fs.writeFileSync(outPath, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI specification written to ${outPath}`);
  await app.close();
  process.exit(0);
}

generate().catch((err) => {
  console.error('Error generating OpenAPI spec:', err);
  process.exit(1);
});
