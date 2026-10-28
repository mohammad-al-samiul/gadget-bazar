import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetSignedUrlDto {
  @ApiProperty({
    example: 'nid/123e4567-e89b-12d3-a456-426614174000-nid.pdf',
    description: 'Object key of the private file',
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiPropertyOptional({
    example: 300,
    default: 300,
    description: 'URL expiration lifetime in seconds (maximum 900 seconds / 15 minutes)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(60, { message: 'Expiration must be at least 60 seconds' })
  @Max(900, {
    message: 'Signed URL lifetime cannot exceed 900 seconds (15 minutes) per security rules',
  })
  @IsOptional()
  expiresInSeconds?: number = 300;
}
