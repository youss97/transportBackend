import { IsOptional, IsString, IsDateString, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

function emptyToUndefined() {
  return Transform(({ value }) => (value === '' ? undefined : value));
}

export class CreateChargementDechargementDto {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  chargement?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  dechargement?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  arriveeBase?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  baseDirection?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  portDirection?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsString()
  @emptyToUndefined()
  photo?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsString()
  @emptyToUndefined()
  balancePhoto?: string;  // Nouveau champ pour la photo de balance
}
