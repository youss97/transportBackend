import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  insuranceStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  insuranceEndDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  currentDriver?: string; // Si c'est un ID Mongo valide

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  carteGriseNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
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
  @IsDateString()
  lastOilChangeDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  technicalControlDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
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
