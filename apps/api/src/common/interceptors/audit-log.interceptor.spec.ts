import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { Role, AuditAction } from '@prisma/client';

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let mockReflector: Partial<Reflector>;
  let mockPrisma: {
    auditLog: {
      create: jest.Mock;
    };
  };
  let mockContext: ExecutionContext;
  let mockNext: CallHandler;
  let mockRequest: {
    method: string;
    body: Record<string, unknown>;
    user?: { id: string; role: Role };
    ip?: string;
    headers: Record<string, string>;
  };

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      body: { name: 'Item', password: 'secret_to_strip' },
      user: { id: 'admin-1', role: Role.ADMIN },
      headers: {},
      ip: '127.0.0.1',
    };

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    mockNext = {
      handle: jest.fn().mockReturnValue(of({ id: 'item-101', name: 'Item' })),
    };

    mockPrisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    interceptor = new AuditLogInterceptor(
      mockReflector as Reflector,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('should skip logging when route has no @Audit decorator', () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const result$ = interceptor.intercept(mockContext, mockNext);
    result$.subscribe();

    expect(mockNext.handle).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('should skip logging when user is not an ADMIN', () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue({ entity: 'Product' });
    mockRequest.user = { id: 'user-1', role: Role.CUSTOMER };

    const result$ = interceptor.intercept(mockContext, mockNext);
    result$.subscribe();

    expect(mockNext.handle).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('should record sanitized audit log on successful admin mutation', (done) => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue({ entity: 'Product' });

    const result$ = interceptor.intercept(mockContext, mockNext);
    result$.subscribe({
      next: () => {
        // Wait for async tap execution
        setTimeout(() => {
          expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
            data: {
              actorId: 'admin-1',
              action: AuditAction.CREATE,
              entity: 'Product',
              entityId: 'item-101',
              changeset: { name: 'Item' }, // password stripped!
              ipAddress: '127.0.0.1',
            },
          });
          done();
        }, 10);
      },
    });
  });
});
