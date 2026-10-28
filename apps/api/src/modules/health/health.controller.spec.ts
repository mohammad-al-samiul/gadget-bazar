import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthService: Partial<HealthService>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockHealthService = {
      checkHealth: jest.fn().mockResolvedValue({
        status: 'ok',
        checks: { database: 'up', redis: 'up' },
        timestamp: '2026-10-28T08:00:00.000Z',
        version: '1.0.0',
      }),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return 200 when system health is ok', async () => {
    const result = await controller.check(mockResponse as Response);
    expect(result.status).toBe('ok');
    expect(result.checks.database).toBe('up');
    expect(result.checks.redis).toBe('up');
    expect(mockResponse.status).not.toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should set status 503 when system health is down', async () => {
    (mockHealthService.checkHealth as jest.Mock).mockResolvedValue({
      status: 'down',
      checks: { database: 'down', redis: 'down' },
      timestamp: '2026-10-28T08:00:00.000Z',
      version: '1.0.0',
    });

    const result = await controller.check(mockResponse as Response);
    expect(result.status).toBe('down');
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should return liveness ok', () => {
    const liveness = controller.getLiveness();
    expect(liveness.status).toBe('ok');
    expect(typeof liveness.uptime).toBe('number');
  });
});
