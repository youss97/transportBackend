import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsMongoId } from 'class-validator';
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
  @IsDateString()
  fuelType?: string;
  @ApiProperty({
    description: 'ID Mongo du chauffeur assigné (facultatif)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  currentDriver?: string;
}
