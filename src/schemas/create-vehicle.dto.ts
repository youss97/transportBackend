import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
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
  model?: string;

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
}