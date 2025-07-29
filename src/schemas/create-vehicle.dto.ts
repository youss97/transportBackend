import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus } from 'src/enums/vehicle-status.enum';

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
  @IsNumber()
  year?: number;

  @ApiProperty({ enum: VehicleStatus, required: false })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

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

  @ApiProperty({
    description: 'ID Mongo du chauffeur assigné (facultatif)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  currentDriver?: string;

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
  @IsNumber()
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

  // Fichiers en tant qu'URL (upload séparé)
 @ApiProperty({
  required: false,
  description: 'Fichier carte grise',
  type: 'string',
  format: 'binary',
})
@IsOptional()
carteGriseFile?: any;

@ApiProperty({
  required: false,
  description: "Fichier d'assurance",
  type: 'string',
  format: 'binary',
})
@IsOptional()
insuranceFile?: any;

@ApiProperty({
  required: false,
  description: "Fichier contrôle technique",
  type: 'string',
  format: 'binary',
})
@IsOptional()
technicalControlFile?: any;

}
