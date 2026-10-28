import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OutboxStatus, OutboxMessage } from '@prisma/client';

export interface CreateOutboxEventParams {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  scheduledAt?: Date;
}

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persists a domain event to the outbox table.
   * Can be passed an ongoing Prisma transaction client to guarantee atomicity with state changes.
   */
  async createEvent(
    params: CreateOutboxEventParams,
    tx?: Prisma.TransactionClient,
  ): Promise<OutboxMessage> {
    const client = tx || this.prisma;

    return client.outboxMessage.create({
      data: {
        eventType: params.eventType,
        aggregateType: params.aggregateType,
        aggregateId: params.aggregateId,
        payload: params.payload as Prisma.InputJsonValue,
        status: OutboxStatus.PENDING,
        scheduledAt: params.scheduledAt || new Date(),
      },
    });
  }

  /**
   * Fetches pending outbox events using transaction and pessimistic SKIP LOCKED
   * to guarantee zero duplicate publishing when multiple instances poll.
   */
  async fetchPendingBatch(batchSize = 20): Promise<OutboxMessage[]> {
    return this.prisma.$transaction(async (tx) => {
      // Find eligible message IDs with SKIP LOCKED
      const rows = await tx.$queryRaw<{ id: string }[]>(
        Prisma.sql`
          SELECT id FROM "outbox_messages"
          WHERE status = 'PENDING'
            AND scheduled_at <= NOW()
          ORDER BY scheduled_at ASC
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        `,
      );

      if (!rows.length) {
        return [];
      }

      const ids = rows.map((r) => r.id);

      // Mark batch as PROCESSING
      await tx.outboxMessage.updateMany({
        where: { id: { in: ids } },
        data: { status: OutboxStatus.PROCESSING },
      });

      return tx.outboxMessage.findMany({
        where: { id: { in: ids } },
      });
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: {
        status: OutboxStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: {
        status: OutboxStatus.FAILED,
        lastError: error,
        retryCount: { increment: 1 },
      },
    });
  }
}
