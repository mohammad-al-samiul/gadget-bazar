import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from '../../catalog/services/elasticsearch.service';
import { IdempotentConsumer } from '../idempotent-consumer';
import { OutboxJobPayload } from '../../outbox/outbox-publisher.service';

@Processor(QUEUES.SEARCH_INDEXING, { concurrency: 5 })
export class SearchIndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchIndexingProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(
    redisService: RedisService,
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly elasticsearch?: ElasticsearchService,
  ) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, SearchIndexingProcessor.name);
  }

  async process(job: Job<OutboxJobPayload>): Promise<unknown> {
    const { eventId, aggregateId } = job.data;
    this.logger.log(
      `[Job ${job.id}] Syncing product ${aggregateId} to Elasticsearch and generating vector embedding`,
    );

    return this.idempotentConsumer.executeIdempotent(eventId, async () => {
      if (this.prisma && this.elasticsearch && aggregateId) {
        const product = await this.prisma.product.findUnique({
          where: { id: aggregateId },
        });

        if (product && !product.deletedAt && product.isActive) {
          await this.elasticsearch.indexProduct(product);
          this.logger.log(`[Job ${job.id}] Product ${aggregateId} indexed into Elasticsearch`);
        } else if (product?.deletedAt || (product && !product.isActive)) {
          await this.elasticsearch.deleteProduct(aggregateId);
          this.logger.log(`[Job ${job.id}] Product ${aggregateId} removed from Elasticsearch`);
        }
      }

      return { indexed: true, productId: aggregateId };
    });
  }
}
