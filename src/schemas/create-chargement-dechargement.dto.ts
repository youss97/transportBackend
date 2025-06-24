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

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsString()
  @emptyToUndefined()
  photo?: string;
}
