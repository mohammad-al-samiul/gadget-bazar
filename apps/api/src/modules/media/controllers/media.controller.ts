import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { GenerateUploadUrlDto, MediaCategory } from '../dto/generate-upload-url.dto';
import { VerifyUploadDto } from '../dto/verify-upload.dto';
import { GetSignedUrlDto } from '../dto/get-signed-url.dto';
import { Request } from 'express';
import { Role } from '@prisma/client';

@ApiTags('Media')
@Controller({ version: '1', path: 'media' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @ApiOperation({
    summary: 'Generate pre-signed direct upload PUT URL for Cloudflare R2 storage',
  })
  @ApiResponse({
    status: 201,
    description: 'Pre-signed URL generated successfully for direct browser/client upload',
  })
  async generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    return this.mediaService.generateUploadUrl(dto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify uploaded object exists in R2 bucket and trigger thumbnail/WebP optimization',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload verified and background media processing enqueued',
  })
  async verifyUpload(@Body() dto: VerifyUploadDto) {
    return this.mediaService.verifyUpload(dto);
  }

  @Get('signed-url')
  @ApiOperation({
    summary:
      'Generate short-lived signed GET URL for accessing private files (NID, warranty, delivery proof)',
  })
  @ApiResponse({
    status: 200,
    description: 'Temporary signed download URL returned (max 15 minutes lifetime)',
  })
  async getSignedUrl(
    @Query() query: GetSignedUrlDto,
    @Req() req: Request & { user?: { id: string; role: Role } },
  ) {
    return this.mediaService.getSignedUrlForPrivateAsset(
      query.key,
      req.user,
      query.expiresInSeconds,
    );
  }

  @Post('image-search-upload')
  @ApiOperation({
    summary: 'Generate temporary upload URL for image search with 2-hour TTL auto-deletion',
  })
  @ApiResponse({
    status: 201,
    description: 'Temporary image search upload URL generated with automatic expiration',
  })
  async generateImageSearchUpload(@Body() dto: Omit<GenerateUploadUrlDto, 'category'>) {
    return this.mediaService.generateUploadUrl({
      ...dto,
      category: MediaCategory.IMAGE_SEARCH,
    });
  }
}
