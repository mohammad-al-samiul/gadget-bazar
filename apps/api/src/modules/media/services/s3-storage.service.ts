import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '../../config/config.service';

export interface HeadObjectResult {
  exists: boolean;
  contentLength?: number;
  contentType?: string;
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly isMock: boolean;
  public readonly publicBucket: string;
  public readonly privateBucket: string;
  public readonly publicCdnUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get('R2_ACCOUNT_ID') || 'mock-r2-account';
    const accessKeyId = this.config.get('R2_ACCESS_KEY_ID') || 'mock-access-key';
    const secretAccessKey = this.config.get('R2_SECRET_ACCESS_KEY') || 'mock-secret-key';
    const customEndpoint = this.config.get('R2_ENDPOINT');

    this.publicBucket = this.config.get('R2_PUBLIC_BUCKET') || 'gadgetbazar-public';
    this.privateBucket = this.config.get('R2_PRIVATE_BUCKET') || 'gadgetbazar-private';
    this.publicCdnUrl = this.config.get('R2_PUBLIC_URL') || 'https://cdn.gadgetbazar.com';

    this.isMock =
      accessKeyId.startsWith('mock') ||
      secretAccessKey.startsWith('mock') ||
      this.config.get('NODE_ENV') === 'test';

    const endpoint = customEndpoint || `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async generatePresignedUploadUrl(
    bucket: string,
    key: string,
    contentType: string,
    fileSize: number,
    expiresIn = 300,
  ): Promise<{ uploadUrl: string; key: string }> {
    if (this.isMock) {
      return {
        uploadUrl: `https://mock-storage.gadgetbazar.com/upload/${bucket}/${key}?signed=true&expires=${expiresIn}`,
        key,
      };
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return { uploadUrl, key };
  }

  async verifyObjectExists(bucket: string, key: string): Promise<HeadObjectResult> {
    if (this.isMock) {
      return {
        exists: true,
        contentLength: 1024,
        contentType: 'image/webp',
      };
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return {
        exists: true,
        contentLength: response.ContentLength,
        contentType: response.ContentType,
      };
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return { exists: false };
      }
      this.logger.warn(`Failed to execute HeadObject for ${bucket}/${key}: ${err.message}`);
      return { exists: false };
    }
  }

  async generatePresignedGetUrl(bucket: string, key: string, expiresIn = 300): Promise<string> {
    if (this.isMock) {
      return `https://mock-storage.gadgetbazar.com/download/${bucket}/${key}?expires=${expiresIn}`;
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(bucket: string, key: string): Promise<boolean> {
    if (this.isMock) {
      return true;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (err: any) {
      this.logger.warn(`Failed to delete object ${bucket}/${key}: ${err.message}`);
      return false;
    }
  }
}
