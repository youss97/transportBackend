import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsMongoId, ValidateIf, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
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
