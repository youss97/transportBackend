import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Heure de début de travail au format HH:mm',
    example: '08:00',
  })
  @IsString()
  workStartHour: string;

  @ApiProperty({
    description: 'Heure de fin de travail au format HH:mm',
    example: '17:00',
  })
  @IsString()
  workEndHour: string;

  @ApiPropertyOptional({
    description: 'Nombre total d\'heures de pause',
    example: 1.5,
  })
  @IsOptional()
  @IsNumber()
  totalBreakHours?: number;
}
