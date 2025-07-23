import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePanneDto {
  @ApiProperty({ example: '2025-08-01', description: 'Date de la panne' })
  @IsDateString()
  datePanne: string;

  @ApiProperty({ example: 'Rue de Sousse, Tunisia', description: 'Position ou localisation de la panne' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Photo 1 (optionnelle)' })
  @IsOptional()
  photo1?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Photo 2 (optionnelle)' })
  @IsOptional()
  photo2?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Photo 3 (optionnelle)' })
  @IsOptional()
  photo3?: any;
}
