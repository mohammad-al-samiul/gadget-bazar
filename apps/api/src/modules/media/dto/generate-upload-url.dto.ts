import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaCategory {
  // Public CDN assets
  PRODUCT = 'product',
  REVIEW = 'review',
  DEAL = 'deal',
  IMAGE_SEARCH = 'image_search',

  // Private assets (owner/admin signed GET only)
  NID = 'nid',
  WARRANTY = 'warranty',
  DELIVERY_PROOF = 'delivery_proof',
}

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const PRIVATE_CATEGORIES: MediaCategory[] = [
  MediaCategory.NID,
  MediaCategory.WARRANTY,
  MediaCategory.DELIVERY_PROOF,
];

export class GenerateUploadUrlDto {
  @ApiProperty({
    example: 'invoice_receipt.pdf',
    description: 'Original file name including extension',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'fileName contains invalid characters. Use alphanumeric, dot, underscore, or hyphen only.',
  })
  fileName!: string;

  @ApiProperty({
    example: 'image/webp',
    description: 'MIME type of the asset (image/jpeg, image/png, image/webp, application/pdf)',
    enum: ALLOWED_MIME_TYPES,
  })
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty({
    example: 1048576,
    description: 'File size in bytes (max 10,485,760 bytes / 10MB)',
    minimum: 1,
    maximum: 10485760,
  })
  @IsNumber()
  @Min(1, { message: 'fileSize must be at least 1 byte' })
  @Max(10485760, { message: 'fileSize exceeds maximum allowed limit of 10MB' })
  fileSize!: number;

  @ApiProperty({
    enum: MediaCategory,
    example: MediaCategory.PRODUCT,
    description: 'Destination category (determines public vs private bucket routing)',
  })
  @IsEnum(MediaCategory)
  category!: MediaCategory;
}
