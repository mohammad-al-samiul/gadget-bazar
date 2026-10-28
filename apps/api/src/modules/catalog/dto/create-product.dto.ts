import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class CreateProductVariantDto {
  @ApiProperty({ example: '8GB / 128GB - Midnight Black' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '-BLK-128' })
  @IsString()
  @IsNotEmpty()
  skuSuffix!: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  priceAdjustmentBdt?: number;

  @ApiProperty({ example: 50, default: 0 })
  @IsNumber()
  @Min(0)
  stock!: number;
}

export class CreateProductMediaDto {
  @ApiProperty({ example: 'https://cdn.gadgetbazar.com/products/img1.webp' })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({ enum: MediaType, default: MediaType.IMAGE })
  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'Front view' })
  @IsString()
  @IsOptional()
  altText?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'GB-PHONE-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: 'শাওমি রেডমি নোট ১৩ প্রো' })
  @IsString()
  @IsNotEmpty()
  titleBn!: string;

  @ApiProperty({ example: 'Xiaomi Redmi Note 13 Pro 5G' })
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @ApiPropertyOptional({ example: '২০০ মেগাপিক্সেল ওআইএস ক্যামেরা সহ পাওয়ারফুল স্মার্টফোন।' })
  @IsString()
  @IsOptional()
  descriptionBn?: string;

  @ApiPropertyOptional({ example: 'Flagship-level 200MP camera with OIS and 67W turbo charge.' })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({
    example: 1250.0,
    description: 'CONFIDENTIAL: Sourcing cost in CNY (Admin only, never returned to public)',
  })
  @IsNumber()
  @Min(0)
  sourcingPriceCny!: number;

  @ApiProperty({ example: 26500.0 })
  @IsNumber()
  @Min(0)
  retailPriceBdt!: number;

  @ApiPropertyOptional({ example: 23500.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dealerPriceBdt?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  moq?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  singlePieceAvailable?: boolean;

  @ApiProperty({
    example: 950.0,
    description: 'Estimated shipping rate per kg BDT (labelled as ESTIMATE at API)',
  })
  @IsNumber()
  @Min(0)
  avgShippingRatePerKgBdt!: number;

  @ApiPropertyOptional({ example: 12, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  warrantyMonths?: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  isGenuineCertified?: boolean;

  @ApiProperty({
    example: 187,
    description: 'Weight in integer grams',
  })
  @IsNumber()
  @Min(1)
  estimatedWeightGrams!: number;

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];

  @ApiPropertyOptional({ type: [CreateProductMediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMediaDto)
  @IsOptional()
  media?: CreateProductMediaDto[];
}
