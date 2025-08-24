// src/tyre-change/tyre-change.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { TyreChangeService } from './tyre-change.service';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CreateTyreChangeDto } from 'src/schemas/create-tyre-change.dto';
import { TyreChange } from 'src/schemas/tyre-change.schemas';

@ApiTags('Tyre Change')
@Controller('tyre-change')
export class TyreChangeController {
  constructor(
    private readonly tyreChangeService: TyreChangeService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoRemoved', maxCount: 1 },
      { name: 'photoAdded', maxCount: 1 },
    ]),
  ) 
  @ApiOperation({ summary: 'Déclarer un changement de pneu avec photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  description: 'Données du changement de pneus + photos',
  schema: {
    type: 'object',
    properties: {
      driverId: { type: 'string', example: '66d8b2a4e1f12b001c111111' },
      vehicleId: { type: 'string', example: '66d8b2a4e1f12b001c222222' },
      dateChange: {
        type: 'string',
        format: 'date-time',
        example: '2025-08-24T10:00:00.000Z',
      },
      kilometrage: { type: 'number', example: 152340 },
      position: {   
        type: 'string',
        enum: [
          'avant_gauche',
          'avant_droit',
          'arriere_gauche',
          'arriere_droit',
        ],
        example: 'avant_gauche',
      },
      note: { type: 'string', example: 'Changement effectué après usure' },
      serialRemoved: { type: 'string', example: 'OLD-1234' },
      serialAdded: { type: 'string', example: 'NEW-5678' },
      photoRemoved: { type: 'string', format: 'binary' },
      photoAdded: { type: 'string', format: 'binary' },
    },
  },
})

  @ApiResponse({
    status: 201,
    description: 'Changement de pneu créé avec succès',
    type: TyreChange,
  })
async create(
  @Body() dto: CreateTyreChangeDto,
  @UploadedFiles() files: { photoRemoved?: Express.Multer.File[]; photoAdded?: Express.Multer.File[] },
) {

  if (files.photoRemoved?.length) {
    const uploaded1 = await this.cloudinaryService.uploadFile(files.photoRemoved[0]);
    dto.photoRemoved = uploaded1.secure_url;
  }

  if (files.photoAdded?.length) {
    const uploaded2 = await this.cloudinaryService.uploadFile(files.photoAdded[0]);
    dto.photoAdded = uploaded2.secure_url;
  }

  return this.tyreChangeService.create(dto);
}

  @Get()
  @ApiOperation({ summary: 'Lister tous les changements de pneus' })
  @ApiResponse({
    status: 200,
    description: 'Liste des changements de pneus',
    type: [TyreChange],
  })
  async findAll() {
    return this.tyreChangeService.findAll();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Lister les changements de pneus d’un véhicule spécifique',
  })
  @ApiParam({ name: 'vehicleId', description: 'ID du véhicule', type: String })
  @ApiResponse({
    status: 200,
    description: 'Liste des changements de pneus pour ce véhicule',
    type: [TyreChange],
  })
  async findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.tyreChangeService.findByVehicle(vehicleId);
  }
}
