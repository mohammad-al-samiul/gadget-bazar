import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../services/media.service';
import { S3StorageService } from '../services/s3-storage.service';
import { MediaCategory } from '../dto/generate-upload-url.dto';
import { getQueueToken } from '@nestjs/bullmq';
import { QUEUES } from '../../queues/queue.constants';
import { BadRequestException } from '@nestjs/common';

describe('MediaService', () => {
  let service: MediaService;
  let mockStorage: any;
  let mockMediaQueue: any;

  beforeEach(async () => {
    mockStorage = {
      publicBucket: 'gadgetbazar-public',
      privateBucket: 'gadgetbazar-private',
      publicCdnUrl: 'https://cdn.gadgetbazar.com',
      generatePresignedUploadUrl: jest.fn().mockResolvedValue({
        uploadUrl: 'https://r2.cloudflarestorage.com/mock-upload-url',
        key: 'product/test-asset.webp',
      }),
      verifyObjectExists: jest.fn().mockResolvedValue({
        exists: true,
        contentLength: 2048,
        contentType: 'image/webp',
      }),
      generatePresignedGetUrl: jest
        .fn()
        .mockResolvedValue('https://r2.cloudflarestorage.com/mock-download-url'),
      deleteObject: jest.fn().mockResolvedValue(true),
    };

    mockMediaQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: S3StorageService, useValue: mockStorage },
        { provide: getQueueToken(QUEUES.MEDIA), useValue: mockMediaQueue },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  describe('generateUploadUrl', () => {
    it('generates public upload url and public CDN url for product image', async () => {
      const result = await service.generateUploadUrl({
        fileName: 'airpods-pro.webp',
        contentType: 'image/webp',
        fileSize: 500000,
        category: MediaCategory.PRODUCT,
      });

      expect(result.bucketType).toBe('public');
      expect(result.publicUrl).toContain('https://cdn.gadgetbazar.com/product/');
      expect(mockStorage.generatePresignedUploadUrl).toHaveBeenCalledWith(
        'gadgetbazar-public',
        expect.stringContaining('product/'),
        'image/webp',
        500000,
        300,
      );
    });

    it('routes NID uploads to the private bucket and redacts public URL', async () => {
      const result = await service.generateUploadUrl({
        fileName: 'nid-card.pdf',
        contentType: 'application/pdf',
        fileSize: 1500000,
        category: MediaCategory.NID,
      });

      expect(result.bucketType).toBe('private');
      expect(result.publicUrl).toBeNull();
      expect(mockStorage.generatePresignedUploadUrl).toHaveBeenCalledWith(
        'gadgetbazar-private',
        expect.stringContaining('nid/'),
        'application/pdf',
        1500000,
        300,
      );
    });

    it('rejects unsupported content types', async () => {
      await expect(
        service.generateUploadUrl({
          fileName: 'malicious.exe',
          contentType: 'application/x-msdownload',
          fileSize: 1000,
          category: MediaCategory.PRODUCT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects PDF uploads for product images (PDF only permitted for NID/warranty)', async () => {
      await expect(
        service.generateUploadUrl({
          fileName: 'product.pdf',
          contentType: 'application/pdf',
          fileSize: 100000,
          category: MediaCategory.PRODUCT,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyUpload', () => {
    it('verifies existing object and dispatches thumbnail optimization job for products', async () => {
      const result = await service.verifyUpload({
        key: 'product/123-headphones.webp',
        category: MediaCategory.PRODUCT,
      });

      expect(result.verified).toBe(true);
      expect(result.processingQueued).toBe(true);
      expect(mockStorage.verifyObjectExists).toHaveBeenCalledWith(
        'gadgetbazar-public',
        'product/123-headphones.webp',
      );
      expect(mockMediaQueue.add).toHaveBeenCalledWith(
        'process-thumbnail',
        expect.objectContaining({ key: 'product/123-headphones.webp' }),
        expect.any(Object),
      );
    });

    it('throws BadRequestException if object does not exist in storage', async () => {
      mockStorage.verifyObjectExists.mockResolvedValue({ exists: false });

      await expect(
        service.verifyUpload({
          key: 'product/missing.webp',
          category: MediaCategory.PRODUCT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('schedules TTL auto-delete job for image-search temporary uploads', async () => {
      const result = await service.verifyUpload({
        key: 'image_search/query-photo.jpg',
        category: MediaCategory.IMAGE_SEARCH,
      });

      expect(result.verified).toBe(true);
      expect(mockMediaQueue.add).toHaveBeenCalledWith(
        'delete-expired-image-search',
        expect.objectContaining({ key: 'image_search/query-photo.jpg' }),
        expect.objectContaining({ delay: 7200000 }),
      );
    });
  });
});
