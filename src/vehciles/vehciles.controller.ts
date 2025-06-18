import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { VehiclesService } from './vehciles.service';
import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentCompany } from 'src/decorators/company.decorator';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un véhicule' })
  @Roles(UserRole.ADMIN)
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.vehiclesService.create(createVehicleDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les véhicules' })
  findAll(@CurrentCompany() companyId: string) {
    return this.vehiclesService.findAll(companyId);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Véhicules nécessitant une maintenance' })
  @Roles(UserRole.MECHANIC, UserRole.SUPERVISOR, UserRole.ADMIN)
  getMaintenanceNeeded(@CurrentCompany() companyId: string) {
    return this.vehiclesService.getVehiclesNeedingMaintenance(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id/assign/:driverId')
  @ApiOperation({ summary: 'Assigner un chauffeur à un véhicule' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  assignDriver(
    @Param('id') id: string,
    @Param('driverId') driverId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.vehiclesService.assignDriver(id, driverId, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @Roles(UserRole.ADMIN)
  deleteVehicle(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehiclesService.deleteVehicle(id, companyId);
  }
  @Patch(':id/unassign')
  @ApiOperation({ summary: 'Désassigner le chauffeur du véhicule' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  unassignDriver(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehiclesService.unassignDriver(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @Roles(UserRole.ADMIN)
  updateVehicle(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateVehicleDto>,
    @CurrentCompany() companyId: string,
  ) {
    return this.vehiclesService.updateVehicle(id, companyId, updateData);
  }
  @Get('search')
  @ApiOperation({
    summary: 'Rechercher des véhicules par immatriculation, marque ou modèle',
  })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  searchVehicles(
    @CurrentCompany() companyId: string,
    @Query('licensePlate') licensePlate?: string,
    @Query('brand') brand?: string,
    @Query('modelCar') modelCar?: string,
  ) {
    return this.vehiclesService.searchVehicles(companyId, {
      licensePlate,
      brand,
      modelCar,
    });
  }
}
