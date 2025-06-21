import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CompaniesService } from './companies.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateCompanyDto } from 'src/schemas/create-company.dto';
import { UpdateCompanyDto } from 'src/schemas/update-company.dto';

@ApiTags('companies')
@Controller('companies')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une société' })
  // @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les sociétés' })
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'une société" })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une société' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une société' })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.companiesService.delete(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Statistiques de la société' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getStats(@Param('id') id: string) {
    return this.companiesService.getCompanyStats(id);
  }
  @Get('search/by-name')
  @ApiOperation({
    summary: 'Rechercher une société par nom (partiel ou complet)',
  })
  @Roles(UserRole.SUPER_ADMIN)
  searchByName(@Query('name') name: string) {
    return this.companiesService.searchByName(name);
  }
}
