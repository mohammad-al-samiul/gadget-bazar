import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaCategory } from './generate-upload-url.dto';

export class VerifyUploadDto {
  @ApiProperty({
    example: 'product/123e4567-e89b-12d3-a456-426614174000-headphones.webp',
    description: 'Object key returned by the upload-url endpoint',
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({
    enum: MediaCategory,
    example: MediaCategory.PRODUCT,
    description: 'Category where the file was uploaded',
  })
  @IsEnum(MediaCategory)
  category!: MediaCategory;
}
