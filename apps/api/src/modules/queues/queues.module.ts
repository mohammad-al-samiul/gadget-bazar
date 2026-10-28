import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { QUEUES, DLQS } from './queue.constants';
import { QueueMetricsService } from './queue-metrics.service';

const primaryQueues = Object.values(QUEUES).map((name) => ({ name }));
const dlqQueues = Object.values(DLQS).map((name) => ({ name }));

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
    }),
    BullModule.registerQueue(...primaryQueues, ...dlqQueues),
  ],
  providers: [QueueMetricsService],
  exports: [BullModule, QueueMetricsService],
})
export class QueuesModule {}
