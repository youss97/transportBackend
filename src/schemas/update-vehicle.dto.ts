import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { VehicleStatus } from 'src/enums/vehicle-status.enum';
import { Transform } from 'class-transformer';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @ApiPropertyOptional({ description: 'Nom du véhicule' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Marque du véhicule' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Modèle du véhicule' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ description: 'Numéro de plaque' })
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiPropertyOptional({ description: 'Année de fabrication' })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ description: 'Couleur du véhicule' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Statut du véhicule' })
  @IsString()
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    description: "Date de début d'assurance",
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  insuranceStartDate?: string;

  @ApiPropertyOptional({
    description: "Date de fin d'assurance",
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  insuranceEndDate?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @ValidateIf(
    (o) =>
      o.currentDriver !== undefined &&
      o.currentDriver !== null &&
      o.currentDriver !== '',
  )
  @IsMongoId({ message: "L'ID du conducteur doit être un ID MongoDB valide" })
  currentDriver?: string;
}
