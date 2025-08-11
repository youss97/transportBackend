import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsMongoId,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  licensePlate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  modelCar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  year?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value === '' ? undefined : value)

  insuranceStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)

  @IsDateString()
  insuranceEndDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({
  required: false,
  type: [String],
  description: 'Liste des conducteurs (IDs)',
  example: ['64d9f4e9a7e123456789abcd'],
})
@IsOptional()
@IsArray()
@ArrayUnique()
@IsMongoId({ each: true })
@Transform(({ value }) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // Si string avec virgule, on split en tableau
    if (value.includes(',')) {
      return value.split(',').map(v => v.trim());
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [value];
    } catch {
      return [value];
    }
  }
  return value;
})


currentDrivers?: string[];


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  carteGriseNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)

  @IsDateString()
  carteGriseRegistrationDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  carteGriseBrand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  carteGriseModel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  carteGriseFuelType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  kilometersAtPurchase?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vehicleCategory?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insuranceName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insuranceType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)

  @IsDateString()
  lastOilChangeDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)

  @IsDateString()
  technicalControlDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)

  @IsDateString()
  technicalControlExpirationDate?: string;

  @ApiProperty({ required: false, description: 'Fichier carte grise', type: 'string', format: 'binary' })
  @IsOptional()
  carteGriseFile?: any;

  @ApiProperty({ required: false, description: "Fichier d'assurance", type: 'string', format: 'binary' })
  @IsOptional()
  insuranceFile?: any;

  @ApiProperty({ required: false, description: "Fichier contrôle technique", type: 'string', format: 'binary' })
  @IsOptional()
  technicalControlFile?: any;
}
