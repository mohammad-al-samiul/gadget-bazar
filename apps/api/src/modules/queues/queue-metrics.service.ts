import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, DLQS, QueueName } from './queue.constants';

export interface SingleQueueMetrics {
  name: string;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  dlqDepth: number;
  totalPending: number;
}

export interface SystemQueueMetrics {
  timestamp: string;
  queues: Record<string, SingleQueueMetrics>;
  summary: {
    totalWaiting: number;
    totalActive: number;
    totalFailed: number;
    totalDlq: number;
  };
}

@Injectable()
export class QueueMetricsService {
  private readonly logger = new Logger(QueueMetricsService.name);

  constructor(
    @InjectQueue(QUEUES.PAYMENTS) private readonly paymentsQueue: Queue,
    @InjectQueue(QUEUES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUES.MEDIA) private readonly mediaQueue: Queue,
    @InjectQueue(QUEUES.SEARCH_INDEXING) private readonly searchQueue: Queue,
    @InjectQueue(QUEUES.REPORTS) private readonly reportsQueue: Queue,

    @InjectQueue(DLQS.PAYMENTS) private readonly paymentsDlq: Queue,
    @InjectQueue(DLQS.NOTIFICATIONS) private readonly notificationsDlq: Queue,
    @InjectQueue(DLQS.MEDIA) private readonly mediaDlq: Queue,
    @InjectQueue(DLQS.SEARCH_INDEXING) private readonly searchDlq: Queue,
    @InjectQueue(DLQS.REPORTS) private readonly reportsDlq: Queue,
  ) {}

  private getQueuePairs(): Array<{ name: QueueName; primary: Queue; dlq: Queue }> {
    return [
      { name: QUEUES.PAYMENTS, primary: this.paymentsQueue, dlq: this.paymentsDlq },
      { name: QUEUES.NOTIFICATIONS, primary: this.notificationsQueue, dlq: this.notificationsDlq },
      { name: QUEUES.MEDIA, primary: this.mediaQueue, dlq: this.mediaDlq },
      { name: QUEUES.SEARCH_INDEXING, primary: this.searchQueue, dlq: this.searchDlq },
      { name: QUEUES.REPORTS, primary: this.reportsQueue, dlq: this.reportsDlq },
    ];
  }

  async getMetrics(): Promise<SystemQueueMetrics> {
    const pairs = this.getQueuePairs();
    const queuesRecord: Record<string, SingleQueueMetrics> = {};

    let totalWaiting = 0;
    let totalActive = 0;
    let totalFailed = 0;
    let totalDlq = 0;

    for (const { name, primary, dlq } of pairs) {
      try {
        const counts = await primary.getJobCounts('waiting', 'active', 'delayed', 'failed');
        const dlqCounts = await dlq.getJobCounts('waiting', 'active', 'failed');
        const dlqDepth = (dlqCounts.waiting || 0) + (dlqCounts.failed || 0);

        const single: SingleQueueMetrics = {
          name,
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          delayed: counts.delayed || 0,
          failed: counts.failed || 0,
          dlqDepth,
          totalPending: (counts.waiting || 0) + (counts.delayed || 0),
        };

        queuesRecord[name] = single;
        totalWaiting += single.waiting;
        totalActive += single.active;
        totalFailed += single.failed;
        totalDlq += single.dlqDepth;
      } catch (err) {
        this.logger.debug(`Could not read counts for queue ${name}: ${(err as Error).message}`);
        queuesRecord[name] = {
          name,
          waiting: 0,
          active: 0,
          delayed: 0,
          failed: 0,
          dlqDepth: 0,
          totalPending: 0,
        };
      }
    }

    return {
      timestamp: new Date().toISOString(),
      queues: queuesRecord,
      summary: {
        totalWaiting,
        totalActive,
        totalFailed,
        totalDlq,
      },
    };
  }
}
