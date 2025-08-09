// src/tyre-change/dto/create-tyre-change.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, ArrayMinSize } from 'class-validator';

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
  @IsNumber()
  kilometrage: number;

  @ApiProperty({
    type: [String],
    enum: ['avant_gauche', 'avant_droit', 'arriere_gauche', 'arriere_droit']
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(['avant_gauche', 'avant_droit', 'arriere_gauche', 'arriere_droit'], { each: true })
  positions: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
