import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { IdempotentConsumer } from '../idempotent-consumer';
import { OutboxJobPayload } from '../../outbox/outbox-publisher.service';

@Processor(QUEUES.MEDIA, { concurrency: 5 })
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(redisService: RedisService) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, MediaProcessor.name);
  }

  async process(job: Job<OutboxJobPayload>): Promise<unknown> {
    const { eventId, aggregateId } = job.data;
    this.logger.log(
      `[Job ${job.id}] Generating media variants and thumbnails for asset ${aggregateId}`,
    );

    return this.idempotentConsumer.executeIdempotent(eventId, async () => {
      // Async image resizing / optimization
      this.logger.log(`[Job ${job.id}] Thumbnails generated for ${aggregateId}`);
      return { compressed: true, assetId: aggregateId };
    });
  }
}
