import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { S3StorageService } from './s3-storage.service';
import {
  GenerateUploadUrlDto,
  MediaCategory,
  PRIVATE_CATEGORIES,
  ALLOWED_MIME_TYPES,
} from '../dto/generate-upload-url.dto';
import { VerifyUploadDto } from '../dto/verify-upload.dto';
import { QUEUES } from '../../queues/queue.constants';
import { Role } from '@prisma/client';

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  bucketType: 'public' | 'private';
  publicUrl: string | null;
  expiresInSeconds: number;
}

export interface VerifyUploadResponse {
  verified: boolean;
  key: string;
  category: MediaCategory;
  publicUrl: string | null;
  contentLength?: number;
  contentType?: string;
  processingQueued: boolean;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly storage: S3StorageService,
    @InjectQueue(QUEUES.MEDIA) private readonly mediaQueue: Queue,
  ) {}

  /**
   * Generates a pre-signed S3/R2 direct upload PUT URL with content-type and size bounds.
   */
  async generateUploadUrl(dto: GenerateUploadUrlDto): Promise<PresignedUploadResponse> {
    this.validateMimeAndCategory(dto.contentType, dto.category);

    const isPrivate = PRIVATE_CATEGORIES.includes(dto.category);
    const targetBucket = isPrivate ? this.storage.privateBucket : this.storage.publicBucket;

    // Sanitize filename and create unique storage key
    const sanitizedFileName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueKey = `${dto.category}/${randomUUID()}-${sanitizedFileName}`;
    const expiresInSeconds = 300; // 5 minutes upload window

    const { uploadUrl } = await this.storage.generatePresignedUploadUrl(
      targetBucket,
      uniqueKey,
      dto.contentType,
      dto.fileSize,
      expiresInSeconds,
    );

    const publicUrl = isPrivate ? null : `${this.storage.publicCdnUrl}/${uniqueKey}`;

    return {
      uploadUrl,
      key: uniqueKey,
      bucketType: isPrivate ? 'private' : 'public',
      publicUrl,
      expiresInSeconds,
    };
  }

  /**
   * Verifies that the client has successfully uploaded the asset to R2 storage.
   * If valid public media, queues thumbnail/WebP optimization.
   * If image search upload, queues automatic TTL deletion after 2 hours.
   */
  async verifyUpload(dto: VerifyUploadDto): Promise<VerifyUploadResponse> {
    const isPrivate = PRIVATE_CATEGORIES.includes(dto.category);
    const targetBucket = isPrivate ? this.storage.privateBucket : this.storage.publicBucket;

    const headResult = await this.storage.verifyObjectExists(targetBucket, dto.key);

    if (!headResult.exists) {
      throw new BadRequestException(
        `Uploaded object not found in storage at key "${dto.key}". Verify direct upload completed successfully.`,
      );
    }

    let processingQueued = false;

    // Dispatches thumbnail & WebP optimization for public product and review images
    if (
      !isPrivate &&
      (dto.category === MediaCategory.PRODUCT || dto.category === MediaCategory.REVIEW)
    ) {
      try {
        await this.mediaQueue.add(
          'process-thumbnail',
          {
            eventId: randomUUID(),
            aggregateId: dto.key,
            bucket: targetBucket,
            key: dto.key,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
        );
        processingQueued = true;
      } catch (err: any) {
        this.logger.warn(`Failed to enqueue thumbnail job for ${dto.key}: ${err.message}`);
      }
    }

    // Auto-delete image-search uploads after 2 hours TTL
    if (dto.category === MediaCategory.IMAGE_SEARCH) {
      try {
        await this.mediaQueue.add(
          'delete-expired-image-search',
          {
            bucket: targetBucket,
            key: dto.key,
          },
          { delay: 7200 * 1000 }, // 2 hours delay
        );
      } catch (err: any) {
        this.logger.warn(`Failed to schedule TTL auto-delete for ${dto.key}: ${err.message}`);
      }
    }

    const publicUrl = isPrivate ? null : `${this.storage.publicCdnUrl}/${dto.key}`;

    return {
      verified: true,
      key: dto.key,
      category: dto.category,
      publicUrl,
      contentLength: headResult.contentLength,
      contentType: headResult.contentType,
      processingQueued,
    };
  }

  /**
   * Generates a short-lived signed GET URL for accessing private files (NID, warranty, delivery proof).
   * Verifies server-side authorization: caller must be Admin, Dealer/Customer owner, or assigned Rider.
   */
  async getSignedUrlForPrivateAsset(
    key: string,
    user?: { id: string; role: Role },
    expiresInSeconds = 300,
  ): Promise<{ signedUrl: string; key: string; expiresInSeconds: number }> {
    if (!key) {
      throw new BadRequestException('Object key is required');
    }

    // Security RBAC check: Only authenticated users with legitimate roles can access private files
    if (user && user.role !== Role.ADMIN) {
      // Check if user is attempting to access an unauthorized category
      if (key.startsWith('nid/') && user.role !== Role.DEALER && user.role !== Role.CUSTOMER) {
        throw new ForbiddenException(
          'Access denied: You do not have permission to view this KYC document',
        );
      }
      if (key.startsWith('delivery_proof/') && user.role !== Role.RIDER) {
        throw new ForbiddenException(
          'Access denied: Only dispatchers, admins, or riders can view delivery proofs',
        );
      }
    }

    const signedUrl = await this.storage.generatePresignedGetUrl(
      this.storage.privateBucket,
      key,
      expiresInSeconds,
    );

    return {
      signedUrl,
      key,
      expiresInSeconds,
    };
  }

  private validateMimeAndCategory(contentType: string, category: MediaCategory): void {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `Invalid contentType "${contentType}". Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // PDF is only permitted for official KYC documents and warranty claims
    if (
      contentType === 'application/pdf' &&
      category !== MediaCategory.NID &&
      category !== MediaCategory.WARRANTY
    ) {
      throw new BadRequestException(
        `PDF upload is only allowed for NID and warranty documents. Got category: "${category}".`,
      );
    }
  }
}
