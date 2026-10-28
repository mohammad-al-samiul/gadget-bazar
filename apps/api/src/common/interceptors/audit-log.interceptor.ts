import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { AUDIT_METADATA_KEY, AuditOptions } from '../decorators/audit.decorator';
import { AuditAction, Role, Prisma } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.getAllAndOverride<AuditOptions | undefined>(AUDIT_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const method = request.method.toUpperCase();

    // Only audit mutations: POST, PUT, PATCH, DELETE
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const user = request.user;
    // Only audit ADMIN actions
    if (!user || user.role !== Role.ADMIN) {
      return next.handle();
    }

    const action = options.action || this.mapMethodToAction(method);
    const entity = options.entity;
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip || null;

    // Sanitize body to remove secrets/passwords
    const sanitizedBody = this.sanitizeChangeset(request.body);

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const rawId =
            (responseBody as Record<string, unknown>)?.id ?? request.params?.id ?? 'unknown';
          const entityId = Array.isArray(rawId) ? rawId[0] : String(rawId);

          await this.prisma.auditLog.create({
            data: {
              actorId: user.id,
              action,
              entity,
              entityId,
              changeset: sanitizedBody ? (sanitizedBody as Prisma.InputJsonValue) : Prisma.JsonNull,
              ipAddress,
            },
          });
        } catch (err) {
          this.logger.error(`Failed to record audit log: ${(err as Error).message}`);
        }
      }),
    );
  }

  private mapMethodToAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.UPDATE;
    }
  }

  private sanitizeChangeset(body: unknown): Record<string, unknown> | null {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null;
    }
    const clean = { ...(body as Record<string, unknown>) };
    const sensitiveFields = ['password', 'passwordHash', 'secret', 'token'];
    for (const field of sensitiveFields) {
      if (field in clean) {
        delete clean[field];
      }
    }
    return clean;
  }
}
