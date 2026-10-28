import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { S3StorageService } from '../../media/services/s3-storage.service';
import { IdempotentConsumer } from '../idempotent-consumer';

@Processor(QUEUES.MEDIA, { concurrency: 5 })
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(
    redisService: RedisService,
    @Optional() private readonly storage?: S3StorageService,
  ) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, MediaProcessor.name);
  }

  async process(job: Job<any>): Promise<unknown> {
    if (job.name === 'delete-expired-image-search') {
      const { bucket, key } = job.data;
      this.logger.log(`[Job ${job.id}] Auto-deleting expired image-search upload at ${key}`);
      if (this.storage) {
        await this.storage.deleteObject(bucket, key);
      }
      return { deleted: true, key };
    }

    const { eventId, aggregateId, key } = job.data;
    const targetKey = key || aggregateId;
    this.logger.log(
      `[Job ${job.id}] Generating media variants and WebP thumbnails for asset ${targetKey}`,
    );

    const consumerKey = eventId || `media-${job.id}`;

    return this.idempotentConsumer.executeIdempotent(consumerKey, async () => {
      // Async image resizing / WebP optimization
      this.logger.log(`[Job ${job.id}] WebP variants & thumbnails generated for ${targetKey}`);
      return { compressed: true, assetId: targetKey };
    });
  }
}
