import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from 'src/schemas/create-activity.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { ActivityType } from 'src/enums/activity-type.enum';

@ApiTags('activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une activité' })
  @Roles(UserRole.DRIVER)
  create(
    @CurrentUser() user: any,
    @Body() createActivityDto: CreateActivityDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.activitiesService.create(
      user.userId,
      createActivityDto,
      companyId,
    );
  }

  @Get('my-activities')
  @ApiOperation({ summary: 'Mes activités' })
  @Roles(UserRole.DRIVER)
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyActivities(@CurrentUser() user: any, @Query('limit') limit?: number) {
    return this.activitiesService.findByDriver(user.userId, limit);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Activités en attente de validation' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  getPendingActivities(@CurrentCompany() companyId: string) {
    return this.activitiesService.findPendingValidation(companyId);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Activités par chauffeur' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getDriverActivities(
    @Param('driverId') driverId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.findByDriver(driverId, limit);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Activités par véhicule' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getVehicleActivities(
    @Param('vehicleId') vehicleId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.findByVehicle(vehicleId, limit);
  }

  @Patch(':id/validate')
  @ApiOperation({ summary: 'Valider une activité' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  validateActivity(@Param('id') id: string, @CurrentUser() user: any) {
    return this.activitiesService.validateActivity(id, user.userId);
  }

  @Get('driver/:driverId/work-hours')
  @ApiOperation({ summary: 'Heures de travail quotidiennes' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'date', required: true, type: String })
  getDailyWorkHours(
    @Param('driverId') driverId: string,
    @Query('date') date: string,
  ) {
    return this.activitiesService.getDailyWorkHours(driverId, new Date(date));
  }

  @Get('has-activity-today')
  @ApiOperation({ summary: 'Vérifie si une activité a été faite aujourd’hui' })
  @Roles(UserRole.DRIVER)
  @ApiQuery({ name: 'type', enum: ActivityType, required: true })
  hasActivityToday(
    @CurrentUser() user: any,
    @Query('type') type: ActivityType,
  ) {
    return this.activitiesService.hasActivityToday(user.userId, type);
  }
  @Get('my-doc-activities')
  @ApiOperation({ summary: 'Mes activités avec documents' })
  @Roles(UserRole.DRIVER, UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Recherche par type ou fileName',
  })
  getMyActivitiesWithDocuments(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search = '',
  ) {
    return this.activitiesService.findActivitiesWithDocuments(
      user.userId,
      limit,
      page,
      search,
    );
  }

  @Get('all-for-company')
  @ApiOperation({ summary: 'Activités avec documents pour la société' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Recherche par type ou fileName',
  })
  getMyActivitiesWithDocumentsForCompany(
    @CurrentCompany() companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search = '',
  ) {
    return this.activitiesService.findActivitiesWithDocumentsForCompany(
      companyId,
      limit,
      page,
      search,
    );
  }
}
