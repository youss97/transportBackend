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
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { CompaniesService } from './companies.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateCompanyDto } from 'src/schemas/create-company.dto';
import { UpdateCompanyDto } from 'src/schemas/update-company.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateCompanySwaggerDto } from 'src/schemas/create-company-swagger.dto';

@ApiTags('companies')
@Controller('companies')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

@Post()
@ApiConsumes('multipart/form-data')
@ApiBody({ type: CreateCompanySwaggerDto })
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
  ], {
    storage: memoryStorage(),
  }),
)
@ApiOperation({ summary: 'Créer une société avec logo et photo admin' })
async create(
  @UploadedFiles()
  files: { logo?: Express.Multer.File[]; photo?: Express.Multer.File[] },
  @Body() body: any, // Utilisez 'any' ou créez une interface pour le body
) {
  // Reconstituez vos objets
  const createCompanyDto: CreateCompanyDto = {
    name: body.name,
    slug: body.slug,
    address: body.address,
    email: body.email,
    adminUser: {
      email: body.adminEmail,
      password: body.adminPassword,
      firstName: body.adminFirstName,
      lastName: body.adminLastName,
      role: body.adminRole,
      phone: body.adminPhone,
      address: body.adminAddress,
      birthDate: body.adminBirthDate,
    }
  };

  const logo = files.logo?.[0];
  const photo = files.photo?.[0];
  
  return this.companiesService.create(createCompanyDto, logo, photo);
}

@Get()
@ApiOperation({ summary: 'Lister toutes les sociétés avec pagination et recherche' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page', example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page', example: 10 })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par nom de société' })
@Roles(UserRole.SUPER_ADMIN)
findAll(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('search') search = '',
) {
  return this.companiesService.findAll(page, limit, search);
}


  @Get(':id')
  @ApiOperation({ summary: "Détails d'une société" })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() })) // Permet d'upload un logo pendant la mise à jour
  @ApiOperation({ summary: 'Modifier une société' })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFile() logoFile?: Express.Multer.File, // Optionnel pour le logo
  ) {
    return this.companiesService.update(id, updateCompanyDto, logoFile);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une société' })
  async remove(@Param('id') id: string) {
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
