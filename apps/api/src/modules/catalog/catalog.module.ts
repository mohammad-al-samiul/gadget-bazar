import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxModule } from '../outbox/outbox.module';
import { CatalogController } from './controllers/catalog.controller';
import { AdminCatalogController } from './controllers/admin-catalog.controller';
import { CatalogService } from './services/catalog.service';
import { AdminCatalogService } from './services/admin-catalog.service';
import { ElasticsearchService } from './services/elasticsearch.service';

@Module({
  imports: [ConfigModule, PrismaModule, OutboxModule],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService, AdminCatalogService, ElasticsearchService],
  exports: [CatalogService, AdminCatalogService, ElasticsearchService],
})
export class CatalogModule {}
