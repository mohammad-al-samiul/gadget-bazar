import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { QueuesModule } from './queues.module';
import { CatalogModule } from '../catalog/catalog.module';
import { MediaModule } from '../media/media.module';
import { PaymentsProcessor } from './processors/payments.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { MediaProcessor } from './processors/media.processor';
import { SearchIndexingProcessor } from './processors/search-indexing.processor';
import { ReportsProcessor } from './processors/reports.processor';

@Module({
  imports: [ConfigModule, PrismaModule, RedisModule, QueuesModule, CatalogModule, MediaModule],
  providers: [
    PaymentsProcessor,
    NotificationsProcessor,
    MediaProcessor,
    SearchIndexingProcessor,
    ReportsProcessor,
  ],
})
export class WorkerModule {}
