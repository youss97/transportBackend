import { IsOptional, IsString, IsDateString, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
function emptyToUndefined() {
  return Transform(({ value }) => (value === '' ? undefined : value));
}

export class CreatePointageDto {
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  pointageDebut?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  pointageFin?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  pauseDebut?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  @emptyToUndefined()
  pauseFin?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsString()
  @emptyToUndefined()
  photoSelfie?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsString()
  @emptyToUndefined()
  photoKilometrage?: string;
}
