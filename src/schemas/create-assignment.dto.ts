import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'ID du chauffeur',
    example: '64b7f2dc0f74a93031b8e901',
  })
  @IsOptional()
  @IsMongoId()
  driver?: string;

  @ApiProperty({
    description: 'ID du superviseur (optionnel)',
    example: '64b7f2dc0f74a93031b8e902',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  supervisor?: string;

  @ApiProperty({
    description: 'ID du site',
    example: '64b7f2dc0f74a93031b8e903',
  })
  @IsMongoId()
  site: string;
}
