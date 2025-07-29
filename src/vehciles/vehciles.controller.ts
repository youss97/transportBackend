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
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { UpdateVehicleDto } from 'src/schemas/update-vehicle.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { VehiclesService } from './vehciles.service';
import { UserRole } from 'src/enums/user-role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseInterceptors( FileFieldsInterceptor([
    { name: 'carteGriseFile', maxCount: 1 },
    { name: 'insuranceFile', maxCount: 1 },
    { name: 'technicalControlFile', maxCount: 1 },
  ]),)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateVehicleDto,
  })
async createVehicle(
  @Body() createVehicleDto: CreateVehicleDto,
  @UploadedFiles()
  files: {
    carteGriseFile?: Express.Multer.File[];
    insuranceFile?: Express.Multer.File[];
    technicalControlFile?: Express.Multer.File[];
  },
) {
  return this.vehiclesService.create(createVehicleDto, files);
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

  @Get('/driver/:driverId')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID de chauffeur' })
  findOneByDriver(@Param('driverId') driverId: string) {
    return this.vehiclesService.findOneByDriver(driverId);
  }

  @Patch(':id/assign/:driverId')
  @ApiOperation({ summary: 'Assigner un chauffeur à un véhicule' })
  assignDriver(
    @Param('id') id: string,
    @Param('driverId') driverId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.vehiclesService.assignDriver(id, driverId, companyId);
  }

  @Patch(':id/unassign')
  @ApiOperation({ summary: 'Désassigner le chauffeur du véhicule' })
  unassignDriver(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehiclesService.unassignDriver(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateVehicleDto })
  @UseInterceptors(FileInterceptor('carteGriseFile'))
  async updateVehicle(
    @Param('id') id: string,
    @Body() updateData: UpdateVehicleDto,
    @CurrentCompany() companyId: string,
    @UploadedFile() carteGriseFile: Express.Multer.File,
  ) {
    return this.vehiclesService.updateVehicle(id, companyId, updateData, carteGriseFile);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  deleteVehicle(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.vehiclesService.deleteVehicle(id, companyId);
  }
}
