import { Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface IdempotentExecutionResult<T> {
  processed: boolean;
  result?: T;
}

export class IdempotentConsumer {
  private readonly logger: Logger;

  constructor(
    private readonly redisService: RedisService,
    contextName: string,
  ) {
    this.logger = new Logger(contextName);
  }

  /**
   * Runs the provided task atomically only if eventId has not been processed.
   * Uses Redis atomic SET NX with 24-hour expiration.
   */
  async executeIdempotent<T>(
    eventId: string,
    task: () => Promise<T>,
    ttlSeconds = 86400,
  ): Promise<IdempotentExecutionResult<T>> {
    const lockKey = `event:processed:${eventId}`;

    try {
      // Check if already processed
      const client = this.redisService.getClient();
      const acquired = await client.set(lockKey, '1', 'EX', ttlSeconds, 'NX');

      if (!acquired) {
        this.logger.debug(
          `IdempotentConsumer: Event ${eventId} has already been processed. Skipping duplicate execution.`,
        );
        return { processed: false };
      }

      const result = await task();
      return { processed: true, result };
    } catch (err) {
      // If task failed, remove the lock so BullMQ retry can re-attempt processing
      try {
        await this.redisService.del(lockKey);
      } catch {
        // ignore redis cleanup error on failure
      }
      throw err;
    }
  }
}
