import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { VehiclesService } from './vehciles.service';
import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un véhicule' })
  @Roles(UserRole.ADMIN)
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les véhicules' })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Véhicules nécessitant une maintenance' })
  @Roles(UserRole.MECHANIC, UserRole.SUPERVISOR, UserRole.ADMIN)
  getMaintenanceNeeded() {
    return this.vehiclesService.getVehiclesNeedingMaintenance();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id/assign/:driverId')
  @ApiOperation({ summary: 'Assigner un chauffeur à un véhicule' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  assignDriver(@Param('id') id: string, @Param('driverId') driverId: string) {
    return this.vehiclesService.assignDriver(id, driverId);
  }
}
