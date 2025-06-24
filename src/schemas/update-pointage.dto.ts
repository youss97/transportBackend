// src/pointage/dto/update-pointage.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePointageDto } from './create-pointage.dto';

export class UpdatePointageDto extends PartialType(CreatePointageDto) {}
