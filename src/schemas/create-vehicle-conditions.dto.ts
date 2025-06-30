import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateVehicleConditionDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  leftSide: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  rightSide: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  frontLeftAngle: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  frontRightAngle: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  frontFace: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  rearFace: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  interior: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  mileage: any;
}