import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { QueuesModule } from './modules/queues/queues.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    RedisModule,
    QueuesModule,
    OutboxModule,
    HealthModule,
    CatalogModule,
  ],
})
export class AppModule {}
