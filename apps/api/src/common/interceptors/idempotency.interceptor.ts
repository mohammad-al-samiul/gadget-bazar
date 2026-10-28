import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { RedisService } from '../../modules/redis/redis.service';
import { IDEMPOTENT_KEY, IdempotentOptions } from '../decorators/idempotent.decorator';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const options = this.reflector.getAllAndOverride<IdempotentOptions | undefined>(
      IDEMPOTENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If route is not decorated with @Idempotent, skip
    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required for this operation');
    }

    const redisKey = `idempotency:${request.method}:${idempotencyKey}`;
    const ttlSeconds = options.ttlSeconds || 86400; // default 24h

    try {
      const cached = await this.redisService.get(redisKey);
      if (cached) {
        this.logger.debug(`Idempotency cache hit for key: ${redisKey}`);
        return of(JSON.parse(cached));
      }
    } catch (err) {
      this.logger.warn(`Failed reading idempotency key from Redis: ${(err as Error).message}`);
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          if (responseBody !== undefined) {
            await this.redisService.set(redisKey, JSON.stringify(responseBody), ttlSeconds);
          }
        } catch (err) {
          this.logger.warn(`Failed caching idempotency response: ${(err as Error).message}`);
        }
      }),
    );
  }
}
