import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'smartphones' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'স্মার্টফোন' })
  @IsString()
  @IsNotEmpty()
  nameBn!: string;

  @ApiProperty({ example: 'Smartphones' })
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Parent category UUID if this is a subcategory',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 'https://cdn.gadgetbazar.com/categories/phones.webp' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
