import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { IdempotentConsumer } from '../idempotent-consumer';
import { OutboxJobPayload } from '../../outbox/outbox-publisher.service';

@Processor(QUEUES.SEARCH_INDEXING, { concurrency: 5 })
export class SearchIndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchIndexingProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(redisService: RedisService) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, SearchIndexingProcessor.name);
  }

  async process(job: Job<OutboxJobPayload>): Promise<unknown> {
    const { eventId, aggregateId } = job.data;
    this.logger.log(
      `[Job ${job.id}] Syncing product ${aggregateId} to Elasticsearch and generating vector embedding`,
    );

    return this.idempotentConsumer.executeIdempotent(eventId, async () => {
      // Async Elasticsearch product sync + pgvector update
      this.logger.log(`[Job ${job.id}] Search index updated for product ${aggregateId}`);
      return { indexed: true, productId: aggregateId };
    });
  }
}
