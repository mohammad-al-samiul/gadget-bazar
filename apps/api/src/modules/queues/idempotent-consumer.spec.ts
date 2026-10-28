import { IdempotentConsumer } from './idempotent-consumer';
import { RedisService } from '../redis/redis.service';

describe('IdempotentConsumer', () => {
  let consumer: IdempotentConsumer;
  let mockRedisClient: {
    set: jest.Mock;
  };
  let mockRedisService: Partial<RedisService>;

  beforeEach(() => {
    mockRedisClient = {
      set: jest.fn(),
    };
    mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
      del: jest.fn().mockResolvedValue(1),
    };

    consumer = new IdempotentConsumer(mockRedisService as RedisService, 'TestConsumer');
  });

  it('should execute task when event has not been processed previously', async () => {
    mockRedisClient.set.mockResolvedValue('OK');
    const mockTask = jest.fn().mockResolvedValue('task_result');

    const result = await consumer.executeIdempotent('event-123', mockTask);

    expect(result.processed).toBe(true);
    expect(result.result).toBe('task_result');
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'event:processed:event-123',
      '1',
      'EX',
      86400,
      'NX',
    );
    expect(mockTask).toHaveBeenCalledTimes(1);
  });

  it('should skip task when event was already processed (SET NX returns null)', async () => {
    mockRedisClient.set.mockResolvedValue(null);
    const mockTask = jest.fn();

    const result = await consumer.executeIdempotent('event-duplicate', mockTask);

    expect(result.processed).toBe(false);
    expect(result.result).toBeUndefined();
    expect(mockTask).not.toHaveBeenCalled();
  });

  it('should delete lock key and re-throw if task fails', async () => {
    mockRedisClient.set.mockResolvedValue('OK');
    const mockTask = jest.fn().mockRejectedValue(new Error('Downstream DB error'));

    await expect(consumer.executeIdempotent('event-error', mockTask)).rejects.toThrow(
      'Downstream DB error',
    );

    expect(mockRedisService.del).toHaveBeenCalledWith('event:processed:event-error');
  });
});
