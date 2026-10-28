import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductSortOption {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
  POPULAR = 'popular',
}

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'Base64 encoded cursor for pagination' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Category slug or UUID (matches category and its subcategories)',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Brand name filter' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 500, description: 'Minimum retail price in BDT' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMin?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Maximum retail price in BDT' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMax?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter for single piece purchase (GadgetOne compatibility)',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  singlePiece?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter only products with available stock' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ enum: ProductSortOption, default: ProductSortOption.NEWEST })
  @IsEnum(ProductSortOption)
  @IsOptional()
  sort?: ProductSortOption = ProductSortOption.NEWEST;
}
