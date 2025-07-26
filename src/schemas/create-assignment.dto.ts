import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'ID du chauffeur (optionnel ou vide)',
    example: '64b7f2dc0f74a93031b8e901',
    required: false,
  })
  @IsOptional()
  @Matches(/^$|^[0-9a-fA-F]{24}$/, { message: 'driver must be a MongoDB ObjectId or empty string' })
  driver?: string;

  @ApiProperty({
    description: 'ID du superviseur (optionnel ou vide)',
    example: '64b7f2dc0f74a93031b8e902',
    required: false,
  })
  @IsOptional()
  @Matches(/^$|^[0-9a-fA-F]{24}$/, { message: 'supervisor must be a MongoDB ObjectId or empty string' })
  supervisor?: string;

  @ApiProperty({
    description: 'ID du site (optionnel ou vide)',
    example: '64b7f2dc0f74a93031b8e903',
    required: false,
  })
  @IsOptional()
  @Matches(/^$|^[0-9a-fA-F]{24}$/, { message: 'site must be a MongoDB ObjectId or empty string' })
  site?: string;
}
