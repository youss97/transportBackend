import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { UpdateSiteDto } from 'src/schemas/update-sites.dto';
import { CreateSiteDto } from 'src/schemas/create-sites.dto';
import { CurrentCompany } from 'src/decorators/company.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Site } from 'src/schemas/sites.schema';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('Sites')
@Controller('sites')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un site' })
  @ApiResponse({
    status: 201,
    description: 'Site créé avec succès',
    type: Site,
  })
  @ApiBody({ type: CreateSiteDto })
  create(
    @Body() createSiteDto: CreateSiteDto,
    @CurrentCompany() companyId: string,
  ) {
    console.log('Companyy:', companyId);
    return this.sitesService.create({ ...createSiteDto, companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les sites de la compagnie courante' })
  @ApiResponse({ status: 200, description: 'Liste des sites', type: [Site] })
  findAll(@CurrentCompany() companyId: string) {
    return this.sitesService.findAll(companyId);
  }
  @Get('all')
  @ApiOperation({ summary: 'Lister tous les sites (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Liste complète de tous les sites',
    type: [Site],
  })
  findAllWithoutCompany() {
    return this.sitesService.findAllWithoutCompany();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un site par son ID' })
  @ApiParam({ name: 'id', description: 'ID du site' })
  @ApiResponse({ status: 200, description: 'Détails du site', type: Site })
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.sitesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un site' })
  @ApiParam({ name: 'id', description: 'ID du site' })
  @ApiBody({ type: UpdateSiteDto })
  @ApiResponse({ status: 200, description: 'Site mis à jour', type: Site })
  update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.sitesService.update(id, updateSiteDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un site' })
  @ApiParam({ name: 'id', description: 'ID du site' })
  @ApiResponse({ status: 200, description: 'Site supprimé' })
  remove(@Param('id') id: string) {
    return this.sitesService.remove(id);
  }
}
