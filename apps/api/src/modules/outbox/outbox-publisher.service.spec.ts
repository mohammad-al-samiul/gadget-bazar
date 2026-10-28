import { OutboxPublisherService } from './outbox-publisher.service';
import { OutboxService } from './outbox.service';
import { Queue } from 'bullmq';
import { DOMAIN_EVENTS } from '../queues/queue.constants';
import { OutboxMessage, OutboxStatus } from '@prisma/client';

describe('OutboxPublisherService', () => {
  let publisher: OutboxPublisherService;
  let mockOutboxService: Partial<OutboxService>;
  let mockPaymentsQueue: Partial<Queue>;
  let mockNotificationsQueue: Partial<Queue>;
  let mockMediaQueue: Partial<Queue>;
  let mockSearchQueue: Partial<Queue>;
  let mockReportsQueue: Partial<Queue>;

  beforeEach(() => {
    mockOutboxService = {
      fetchPendingBatch: jest.fn(),
      markPublished: jest.fn(),
      markFailed: jest.fn(),
    };

    mockPaymentsQueue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };
    mockNotificationsQueue = { add: jest.fn().mockResolvedValue({ id: 'job-2' }) };
    mockMediaQueue = { add: jest.fn().mockResolvedValue({ id: 'job-3' }) };
    mockSearchQueue = { add: jest.fn().mockResolvedValue({ id: 'job-4' }) };
    mockReportsQueue = { add: jest.fn().mockResolvedValue({ id: 'job-5' }) };

    publisher = new OutboxPublisherService(
      mockOutboxService as OutboxService,
      mockPaymentsQueue as unknown as Queue,
      mockNotificationsQueue as unknown as Queue,
      mockMediaQueue as unknown as Queue,
      mockSearchQueue as unknown as Queue,
      mockReportsQueue as unknown as Queue,
    );
  });

  afterEach(() => {
    publisher.onModuleDestroy();
  });

  it('should fetch pending events and route payment event to payments queue', async () => {
    const mockMsg: OutboxMessage = {
      id: 'msg-payment-1',
      eventType: DOMAIN_EVENTS.PAYMENT_CONFIRMED,
      aggregateType: 'Order',
      aggregateId: 'ord-100',
      payload: { amount: 3500 },
      status: OutboxStatus.PROCESSING,
      retryCount: 0,
      lastError: null,
      scheduledAt: new Date(),
      publishedAt: null,
      createdAt: new Date(),
    };

    (mockOutboxService.fetchPendingBatch as jest.Mock).mockResolvedValue([mockMsg]);

    const count = await publisher.publishPendingBatch(10);

    expect(count).toBe(1);
    expect(mockPaymentsQueue.add).toHaveBeenCalledWith(
      DOMAIN_EVENTS.PAYMENT_CONFIRMED,
      expect.objectContaining({
        eventId: 'msg-payment-1',
        eventType: DOMAIN_EVENTS.PAYMENT_CONFIRMED,
        aggregateId: 'ord-100',
      }),
      expect.objectContaining({
        jobId: 'msg-payment-1',
        attempts: 5,
      }),
    );
    expect(mockOutboxService.markPublished).toHaveBeenCalledWith('msg-payment-1');
  });

  it('should route shipment arrived event to notifications queue', async () => {
    const mockMsg: OutboxMessage = {
      id: 'msg-shipment-1',
      eventType: DOMAIN_EVENTS.SHIPMENT_ARRIVED,
      aggregateType: 'Shipment',
      aggregateId: 'ship-200',
      payload: { trackingCode: 'BD-CN-1234' },
      status: OutboxStatus.PROCESSING,
      retryCount: 0,
      lastError: null,
      scheduledAt: new Date(),
      publishedAt: null,
      createdAt: new Date(),
    };

    (mockOutboxService.fetchPendingBatch as jest.Mock).mockResolvedValue([mockMsg]);

    const count = await publisher.publishPendingBatch(10);

    expect(count).toBe(1);
    expect(mockNotificationsQueue.add).toHaveBeenCalledWith(
      DOMAIN_EVENTS.SHIPMENT_ARRIVED,
      expect.objectContaining({
        eventId: 'msg-shipment-1',
        aggregateId: 'ship-200',
      }),
      expect.any(Object),
    );
    expect(mockOutboxService.markPublished).toHaveBeenCalledWith('msg-shipment-1');
  });

  it('should mark message as failed when queue.add rejects', async () => {
    const mockMsg: OutboxMessage = {
      id: 'msg-fail-1',
      eventType: DOMAIN_EVENTS.PAYMENT_CONFIRMED,
      aggregateType: 'Order',
      aggregateId: 'ord-fail',
      payload: {},
      status: OutboxStatus.PROCESSING,
      retryCount: 0,
      lastError: null,
      scheduledAt: new Date(),
      publishedAt: null,
      createdAt: new Date(),
    };

    (mockOutboxService.fetchPendingBatch as jest.Mock).mockResolvedValue([mockMsg]);
    (mockPaymentsQueue.add as jest.Mock).mockRejectedValue(new Error('Redis connection down'));

    const count = await publisher.publishPendingBatch(10);

    expect(count).toBe(0);
    expect(mockOutboxService.markFailed).toHaveBeenCalledWith(
      'msg-fail-1',
      'Redis connection down',
    );
  });
});
