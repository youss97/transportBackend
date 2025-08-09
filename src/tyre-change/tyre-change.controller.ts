// src/tyre-change/tyre-change.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { TyreChangeService } from './tyre-change.service';
import { CreateTyreChangeDto } from 'src/schemas/create-tyre-change.dto';
import { TyreChange } from 'src/schemas/tyre-change.schemas';

@ApiTags('Tyre Change')
@Controller('tyre-change')
export class TyreChangeController {
  constructor(private readonly tyreChangeService: TyreChangeService) {}

  @Post()
  @ApiOperation({ summary: 'Déclarer un changement de pneu' })
  @ApiResponse({ status: 201, description: 'Changement de pneu créé avec succès', type: TyreChange })
  @ApiBody({ type: CreateTyreChangeDto })
  async create(@Body() dto: CreateTyreChangeDto) {
    return this.tyreChangeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les changements de pneus' })
  @ApiResponse({ status: 200, description: 'Liste des changements de pneus', type: [TyreChange] })
  async findAll() {
    return this.tyreChangeService.findAll();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Lister les changements de pneus d’un véhicule spécifique' })
  @ApiParam({ name: 'vehicleId', description: 'ID du véhicule', type: String })
  @ApiResponse({ status: 200, description: 'Liste des changements de pneus pour ce véhicule', type: [TyreChange] })
  async findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.tyreChangeService.findByVehicle(vehicleId);
  }
}
