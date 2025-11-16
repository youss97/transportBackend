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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { UpdateVehicleDto } from 'src/schemas/update-vehicle.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { VehiclesService } from './vehciles.service';
import { ArrayUnique, IsArray, IsMongoId } from 'class-validator';
export class AssignDriversDto {
  @ApiProperty({
    type: [String],
    description: 'Liste des IDs des conducteurs à assigner',
    example: ['64d9f4e9a7e123456789abcd', '64d9f4e9a7e123456789abce'],
  })
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  driverIds: string[];
}

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'carteGriseFile', maxCount: 1 },
      { name: 'insuranceFile', maxCount: 1 },
      { name: 'technicalControlFile', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVehicleDto })
  async createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentCompany() companyId: string,
    @UploadedFiles()
    files: {
      carteGriseFile?: Express.Multer.File[];
      insuranceFile?: Express.Multer.File[];
      technicalControlFile?: Express.Multer.File[];
    },
  ) {
    console.log(companyId,'caompanyId')
    return this.vehiclesService.create(createVehicleDto, files, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les véhicules' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @CurrentCompany() companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.vehiclesService.findAll(companyId, page, limit, search);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Lister les véhicules nécessitant une maintenance' })
  getMaintenanceNeeded(@CurrentCompany() companyId: string) {
    return this.vehiclesService.getVehiclesNeedingMaintenance(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID de chauffeur' })
  findOneByDriver(@Param('driverId') driverId: string) {
    return this.vehiclesService.findOneByDriver(driverId);
  }

  @Patch(':id/assign-drivers')
  @ApiOperation({ summary: 'Assigner plusieurs conducteurs à un véhicule' })
  @ApiBody({ type: AssignDriversDto })
  @ApiResponse({
    status: 200,
    description: 'Véhicule mis à jour avec les conducteurs assignés',
  })
  async assignDrivers(
    @Param('id') vehicleId: string,
    @Body() assignDriversDto: AssignDriversDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.vehiclesService.assignDrivers(vehicleId, assignDriversDto.driverIds, companyId);
  }

  // Désassigner tous les conducteurs
  @Patch(':id/unassign-drivers')
  @ApiOperation({ summary: 'Désassigner tous les conducteurs d’un véhicule' })
    @ApiBody({ type: AssignDriversDto })
  @ApiResponse({
    status: 200,
    description: 'Tous les conducteurs désassignés du véhicule',
  })
  async unassignAllDrivers(
    @Param('id') vehicleId: string,
    @CurrentCompany() companyId: string,
        @Body() assignDriversDto: AssignDriversDto,

  ) {
    return this.vehiclesService.unassignDrivers(vehicleId, companyId,assignDriversDto.driverIds);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateVehicleDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'carteGriseFile', maxCount: 1 },
      { name: 'insuranceFile', maxCount: 1 },
      { name: 'technicalControlFile', maxCount: 1 },
    ]),
  )
  async updateVehicle(
    @Param('id') id: string,
    @Body() updateData: UpdateVehicleDto,
    @CurrentCompany() companyId: string,
    @UploadedFiles()
    files: {
      carteGriseFile?: Express.Multer.File[];
      insuranceFile?: Express.Multer.File[];
      technicalControlFile?: Express.Multer.File[];
    },
  ) {
    return this.vehiclesService.updateVehicle(id, companyId, updateData, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  deleteVehicle(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehiclesService.deleteVehicle(id, companyId);
  }
}
