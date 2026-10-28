import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../services/media.service';
import { S3StorageService } from '../services/s3-storage.service';
import { getQueueToken } from '@nestjs/bullmq';
import { QUEUES } from '../../queues/queue.constants';
import { Role } from '@prisma/client';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('Media Module: Private Bucket Security & RBAC Access Control', () => {
  let service: MediaService;
  let mockStorage: any;

  beforeEach(async () => {
    mockStorage = {
      privateBucket: 'gadgetbazar-private',
      publicBucket: 'gadgetbazar-public',
      publicCdnUrl: 'https://cdn.gadgetbazar.com',
      generatePresignedGetUrl: jest
        .fn()
        .mockResolvedValue('https://r2.cloudflarestorage.com/signed-get-url'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: S3StorageService, useValue: mockStorage },
        { provide: getQueueToken(QUEUES.MEDIA), useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('allows ADMIN to generate short-lived signed GET URLs for any private asset', async () => {
    const adminUser = { id: 'admin-1', role: Role.ADMIN };

    const result = await service.getSignedUrlForPrivateAsset(
      'nid/dealer-nid-card.pdf',
      adminUser,
      300,
    );

    expect(result.signedUrl).toBe('https://r2.cloudflarestorage.com/signed-get-url');
    expect(result.expiresInSeconds).toBe(300);
    expect(mockStorage.generatePresignedGetUrl).toHaveBeenCalledWith(
      'gadgetbazar-private',
      'nid/dealer-nid-card.pdf',
      300,
    );
  });

  it('forbids RIDER from accessing customer NID / KYC documents', async () => {
    const riderUser = { id: 'rider-1', role: Role.RIDER };

    await expect(
      service.getSignedUrlForPrivateAsset('nid/secret-nid.pdf', riderUser, 300),
    ).rejects.toThrow(ForbiddenException);
  });

  it('forbids CUSTOMER from accessing delivery proof photos', async () => {
    const customerUser = { id: 'cust-1', role: Role.CUSTOMER };

    await expect(
      service.getSignedUrlForPrivateAsset('delivery_proof/photo-1.jpg', customerUser, 300),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if key is missing or empty', async () => {
    const adminUser = { id: 'admin-1', role: Role.ADMIN };

    await expect(service.getSignedUrlForPrivateAsset('', adminUser, 300)).rejects.toThrow(
      BadRequestException,
    );
  });
});
