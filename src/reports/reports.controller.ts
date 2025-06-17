import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Statistiques du tableau de bord' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('driver/:driverId/performance')
  @ApiOperation({ summary: "Performance d'un chauffeur" })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  getDriverPerformance(
    @Param('driverId') driverId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getDriverPerformance(
      driverId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('vehicle-utilization')
  @ApiOperation({ summary: "Taux d'utilisation des véhicules" })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  getVehicleUtilization(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getVehicleUtilization(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('fuel-consumption')
  @ApiOperation({ summary: 'Rapport de consommation de carburant' })
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  getFuelConsumption(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getFuelConsumptionReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Rapport de maintenance' })
  @Roles(UserRole.MECHANIC, UserRole.SUPERVISOR, UserRole.ADMIN)
  getMaintenanceReport() {
    return this.reportsService.getMaintenanceReport();
  }
}
