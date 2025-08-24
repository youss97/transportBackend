// src/tyre-change/dto/create-tyre-change.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class CreateTyreChangeDto {
  @ApiProperty()
  @IsMongoId()
  driverId: string;

  @ApiProperty()
  @IsMongoId()
  vehicleId: string;

  @ApiProperty()
  @IsDateString()
  dateChange: string;

  @ApiProperty()
  @ApiProperty()
  @Type(() => Number) 
  @IsNumber()
  kilometrage: number;

  @ApiProperty({
    enum: ['avant_gauche', 'avant_droit', 'arriere_gauche', 'arriere_droit'],
    description: 'Position du pneu changé',
    example: 'avant_gauche',
  })
  @IsEnum(['avant_gauche', 'avant_droit', 'arriere_gauche', 'arriere_droit'])
  position: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serialRemoved?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serialAdded?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photoRemoved?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photoAdded?: any;
}
