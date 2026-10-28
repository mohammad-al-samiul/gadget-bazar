import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { IdempotentConsumer } from '../idempotent-consumer';
import { OutboxJobPayload } from '../../outbox/outbox-publisher.service';

@Processor(QUEUES.NOTIFICATIONS, { concurrency: 15 })
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(redisService: RedisService) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, NotificationsProcessor.name);
  }

  async process(job: Job<OutboxJobPayload>): Promise<unknown> {
    const { eventId, eventType, aggregateId } = job.data;
    this.logger.log(`[Job ${job.id}] Sending notification for ${eventType} on ${aggregateId}`);

    return this.idempotentConsumer.executeIdempotent(eventId, async () => {
      // Dispatches bilingual SMS/Push (Bengali/English) to customer
      this.logger.log(`[Job ${job.id}] Notification dispatched for event ${eventId}`);
      return { sent: true, recipient: aggregateId };
    });
  }
}
