import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OutboxService } from './outbox.service';
import { QUEUES, EVENT_TO_QUEUE_MAP, QueueName } from '../queues/queue.constants';

export interface OutboxJobPayload {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: unknown;
  timestamp: string;
}

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly outboxService: OutboxService,
    @InjectQueue(QUEUES.PAYMENTS) private readonly paymentsQueue: Queue,
    @InjectQueue(QUEUES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUES.MEDIA) private readonly mediaQueue: Queue,
    @InjectQueue(QUEUES.SEARCH_INDEXING) private readonly searchQueue: Queue,
    @InjectQueue(QUEUES.REPORTS) private readonly reportsQueue: Queue,
  ) {}

  onModuleInit() {
    // Start background poller loop (every 1000ms)
    this.timer = setInterval(() => {
      this.publishPendingBatch().catch((err) => {
        this.logger.error(`Error in outbox publisher loop: ${(err as Error).message}`);
      });
    }, 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getQueue(name: QueueName): Queue {
    switch (name) {
      case QUEUES.PAYMENTS:
        return this.paymentsQueue;
      case QUEUES.NOTIFICATIONS:
        return this.notificationsQueue;
      case QUEUES.MEDIA:
        return this.mediaQueue;
      case QUEUES.SEARCH_INDEXING:
        return this.searchQueue;
      case QUEUES.REPORTS:
        return this.reportsQueue;
      default:
        return this.notificationsQueue;
    }
  }

  async publishPendingBatch(batchSize = 25): Promise<number> {
    if (this.isProcessing) {
      return 0;
    }

    this.isProcessing = true;
    let publishedCount = 0;

    try {
      const messages = await this.outboxService.fetchPendingBatch(batchSize);

      for (const msg of messages) {
        try {
          const queueName = EVENT_TO_QUEUE_MAP[msg.eventType] || QUEUES.NOTIFICATIONS;
          const queue = this.getQueue(queueName);

          const jobPayload: OutboxJobPayload = {
            eventId: msg.id,
            eventType: msg.eventType,
            aggregateType: msg.aggregateType,
            aggregateId: msg.aggregateId,
            payload: msg.payload,
            timestamp: msg.createdAt.toISOString(),
          };

          // BullMQ options: retry 5 times with exponential backoff, unique jobId
          await queue.add(msg.eventType, jobPayload, {
            jobId: msg.id,
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false, // keep failed for DLQ inspection
          });

          await this.outboxService.markPublished(msg.id);
          publishedCount++;
        } catch (err) {
          const errorMsg = (err as Error).message;
          this.logger.warn(`Failed to publish outbox event ${msg.id}: ${errorMsg}`);
          await this.outboxService.markFailed(msg.id, errorMsg);
        }
      }
    } catch (err) {
      this.logger.error(`Failed to process outbox batch: ${(err as Error).message}`);
    } finally {
      this.isProcessing = false;
    }

    return publishedCount;
  }
}
