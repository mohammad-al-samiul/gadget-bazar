import { ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { RedisService } from '../../modules/redis/redis.service';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let mockReflector: Partial<Reflector>;
  let mockRedisService: Partial<RedisService>;
  let mockContext: ExecutionContext;
  let mockNext: CallHandler;
  let mockRequest: {
    method: string;
    headers: Record<string, string>;
  };

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      headers: {},
    };

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    mockNext = {
      handle: jest.fn().mockReturnValue(of({ success: true, orderId: 'ord-123' })),
    };

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    interceptor = new IdempotencyInterceptor(
      mockReflector as Reflector,
      mockRedisService as RedisService,
    );
  });

  it('should skip interception when @Idempotent decorator is not present', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const result$ = await interceptor.intercept(mockContext, mockNext);
    result$.subscribe((val) => {
      expect(val).toEqual({ success: true, orderId: 'ord-123' });
    });

    expect(mockNext.handle).toHaveBeenCalled();
    expect(mockRedisService.get).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when Idempotency-Key header is missing', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue({ ttlSeconds: 3600 });
    mockRequest.headers = {};

    await expect(interceptor.intercept(mockContext, mockNext)).rejects.toThrow(BadRequestException);
  });

  it('should return cached response on cache hit without invoking handler', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue({ ttlSeconds: 3600 });
    mockRequest.headers = { 'idempotency-key': 'key-abc' };
    (mockRedisService.get as jest.Mock).mockResolvedValue(
      JSON.stringify({ cached: true, orderId: 'cached-123' }),
    );

    const result$ = await interceptor.intercept(mockContext, mockNext);
    result$.subscribe((val) => {
      expect(val).toEqual({ cached: true, orderId: 'cached-123' });
    });

    expect(mockNext.handle).not.toHaveBeenCalled();
  });

  it('should execute handler and cache response when key is not cached', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue({ ttlSeconds: 3600 });
    mockRequest.headers = { 'idempotency-key': 'key-new' };
    (mockRedisService.get as jest.Mock).mockResolvedValue(null);

    const result$ = await interceptor.intercept(mockContext, mockNext);
    result$.subscribe(() => {
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'idempotency:POST:key-new',
        JSON.stringify({ success: true, orderId: 'ord-123' }),
        3600,
      );
    });

    expect(mockNext.handle).toHaveBeenCalled();
  });
});
