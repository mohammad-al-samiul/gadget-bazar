import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };
  timestamp: string;
  version: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const [dbUp, redisUp] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    let overallStatus: 'ok' | 'degraded' | 'down' = 'ok';
    if (!dbUp && !redisUp) {
      overallStatus = 'down';
    } else if (!dbUp || !redisUp) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      checks: {
        database: dbUp ? 'up' : 'down',
        redis: redisUp ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB health check timeout')), 3000),
      );
      await Promise.race([this.prisma.$queryRaw(Prisma.sql`SELECT 1`), timeoutPromise]);
      return true;
    } catch (err) {
      this.logger.debug(`Database check failed: ${(err as Error).message}`);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis health check timeout')), 2000),
      );
      const res = await Promise.race([this.redis.ping(), timeoutPromise]);
      return res === 'PONG';
    } catch (err) {
      this.logger.debug(`Redis check failed: ${(err as Error).message}`);
      return false;
    }
  }
}
