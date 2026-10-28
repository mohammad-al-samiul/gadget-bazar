import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queue.constants';
import { RedisService } from '../../redis/redis.service';
import { IdempotentConsumer } from '../idempotent-consumer';
import { OutboxJobPayload } from '../../outbox/outbox-publisher.service';

@Processor(QUEUES.REPORTS, { concurrency: 2 })
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);
  private readonly idempotentConsumer: IdempotentConsumer;

  constructor(redisService: RedisService) {
    super();
    this.idempotentConsumer = new IdempotentConsumer(redisService, ReportsProcessor.name);
  }

  async process(job: Job<OutboxJobPayload>): Promise<unknown> {
    const { eventId, aggregateId } = job.data;
    this.logger.log(`[Job ${job.id}] Generating low-priority report: ${aggregateId}`);

    return this.idempotentConsumer.executeIdempotent(eventId, async () => {
      // Async report generation / CSV ledger export
      this.logger.log(`[Job ${job.id}] Report generation completed for ${aggregateId}`);
      return { generated: true, reportId: aggregateId };
    });
  }
}
