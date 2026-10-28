import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompareQueryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000,123e4567-e89b-12d3-a456-426614174001',
    description: 'Comma-separated product UUIDs (minimum 2, maximum 4)',
  })
  @IsString()
  @IsNotEmpty()
  ids!: string;
}
