import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { IdempotentConsumer } from '../idempotent-consumer';
import { OutboxJobPayload } from '../../outbox/outbox-publisher.service';

@Processor(QUEUES.PAYMENTS, { concurrency: 20 })
export class PaymentsProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentsProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(redisService: RedisService) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, PaymentsProcessor.name);
  }

  async process(job: Job<OutboxJobPayload>): Promise<unknown> {
    const { eventId, eventType, aggregateId } = job.data;
    this.logger.log(
      `[Job ${job.id}] Processing payment event ${eventType} for order ${aggregateId}`,
    );

    return this.idempotentConsumer.executeIdempotent(eventId, async () => {
      // Execute payment confirmation / refund logic
      this.logger.log(`[Job ${job.id}] Payment event ${eventId} processed successfully.`);
      return { success: true, processedAt: new Date().toISOString() };
    });
  }
}
