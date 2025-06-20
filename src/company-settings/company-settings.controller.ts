import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompanySettingsService } from './company-settings.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { UpdateSettingsDto } from 'src/schemas/create-company-settings.dto';

@ApiTags('company-settings')
@Controller('company-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompanySettingsController {
  constructor(private readonly settingsService: CompanySettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'voir les paramètres de sociétés' })
  getSettings(@CurrentCompany() companyId: string) {
    return this.settingsService.getByCompanyId(companyId);
  }

  @Patch()
  @ApiOperation({ summary: 'créer ou modifier les paramètres' })
  @Roles(UserRole.ADMIN)
  updateSettings(
    @CurrentCompany() companyId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.createOrUpdate(companyId, dto);
  }

  @Delete()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer les paramètres' })
  deleteSettings(@CurrentCompany() companyId: string) {
    return this.settingsService.deleteByCompanyId(companyId);
  }
}
