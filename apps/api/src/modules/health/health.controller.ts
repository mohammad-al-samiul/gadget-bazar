import { Controller, Get, HttpStatus, Res, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';
import { QueueMetricsService } from '../queues/queue-metrics.service';

@ApiTags('Health')
@Controller({ version: '1', path: 'health' })
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    @Optional() private readonly queueMetricsService?: QueueMetricsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Comprehensive health check for DB and Redis' })
  @ApiResponse({ status: 200, description: 'Service is operational or degraded' })
  @ApiResponse({ status: 503, description: 'All core dependencies are down' })
  async check(@Res({ passthrough: true }) res: Response) {
    const health = await this.healthService.checkHealth();
    if (health.status === 'down') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return health;
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for container orchestrator' })
  @ApiResponse({ status: 200, description: 'Application instance is live' })
  getLiveness() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('queues')
  @ApiOperation({ summary: 'Queue depth, active tasks, lag, and dead-letter queue metrics' })
  @ApiResponse({ status: 200, description: 'Queue metrics payload' })
  async getQueueMetrics() {
    if (!this.queueMetricsService) {
      return { status: 'unavailable', message: 'Queue metrics service not initialized' };
    }
    return this.queueMetricsService.getMetrics();
  }
}
