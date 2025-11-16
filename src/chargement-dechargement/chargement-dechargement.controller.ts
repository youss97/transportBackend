import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ChargementDechargementService } from './chargement-dechargement.service';
import { CreateChargementDechargementDto } from 'src/schemas/create-chargement-dechargement.dto';
import {
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateChargementDechargementDto } from 'src/schemas/update-chargement-dechargement.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import {  Types } from 'mongoose';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';

@ApiTags('chargement-dechargement')
@Controller('chargement-dechargement')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChargementDechargementController {
  constructor(
    private readonly chargementDechargementService: ChargementDechargementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un chargement/dechargement' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'balancePhoto', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createDto: CreateChargementDechargementDto,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      balancePhoto?: Express.Multer.File[];
    },
  ) {
    const userId = user.userId;

    // Téléchargement de la photo de chargement/déchargement si elle est fournie
    if (files?.photo?.[0]) {
      createDto.photo = await this.chargementDechargementService.uploadPhoto(
        files.photo[0],
        'photo',
      );
    }

    // Téléchargement de la photo de balance si elle est fournie
    if (files?.balancePhoto?.[0]) {
      createDto.balancePhoto =
        await this.chargementDechargementService.uploadPhoto(
          files.balancePhoto[0],
          'balance',
        );
    }

    return this.chargementDechargementService.create(
      createDto,
      userId,
      companyId,
    );
  }

  @Get('today')
  @ApiOperation({
    summary: "Récupérer chDe d'aujourd'hui du conducteur",
  })
  async getTodayChargementDechargement(@CurrentUser() user: any) {
    const driver = user.userId;
    const chargementDechargement =
      await this.chargementDechargementService.findTodayChargementDechargement(
        driver,
      );

    if (!chargementDechargement) {
      return {
        message: "Aucun chargement/déchargement trouvé pour aujourd'hui",
      }; // Message explicite si rien trouvé
    }

    return chargementDechargement;
  }
  @Get('by-company')
  @ApiOperation({ summary: "les chargements.. des utilisateurs d'une societe" })
  async findAllByCompanyId(@CurrentCompany() companyId: any) {
    return this.chargementDechargementService.findAllByCompanyId(companyId);
  }
  @Get('me')
  @ApiOperation({ summary: 'Récupérer mes chargements/déchargements' })
  async findAll(@CurrentUser() user: any) {
    return this.chargementDechargementService.findAllByUserId(user.userId);
  }
  @Get()
  @ApiOperation({
    summary: 'Récupérer  tous les chargements de toutes les soicetes',
  })
  async findAllForAllCompany() {
    return this.chargementDechargementService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un chargement/dechargement' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chargementDechargementService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un chargement/dechargement' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'balancePhoto', maxCount: 1 }, // ✅ Ajout du champ
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChargementDechargementDto,
    @CurrentUser() user: any,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      balancePhoto?: Express.Multer.File[];
    },
  ) {
    if (files?.photo?.[0]) {
      updateDto.photo = await this.chargementDechargementService.uploadPhoto(
        files.photo[0],
        'photo',
      );
    }

    if (files?.balancePhoto?.[0]) {
      updateDto.balancePhoto =
        await this.chargementDechargementService.uploadPhoto(
          files.balancePhoto[0],
          'balance',
        );
    }

    return this.chargementDechargementService.update(
      id,
      updateDto,
      user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un chargement/dechargement' })
  async remove(@Param('id') id: string) {
    return this.chargementDechargementService.remove(id);
  }

  @Get('stats/me')
  @ApiOperation({
    summary: 'Statistiques personnelles (chargements/déchargements + tonnes)',
  })
  async getMyStats(@CurrentUser() user: any) {
    return this.chargementDechargementService.getStatsByDriver(user.userId);
  }

  @Get('stats/company')
  @ApiOperation({ summary: 'Statistiques par chauffeur dans la société' })
  async getStatsByCompany(@CurrentCompany() companyId: string) {
    return this.chargementDechargementService.getStatsByCompany(companyId);
  }

  @Get('stats/monthly/:year/:month')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Stats mensuelles par chauffeur' })
  async getMonthlyStats(
    @CurrentCompany() companyId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    if (!year || !month) {
      throw new BadRequestException('Year and month are required');
    }

    return this.chargementDechargementService.getMonthlyStatsByCompany(
      companyId,
      Number(year),
      Number(month),
    );
  }
  @Get('turnover-by-driver/:year/:month')
  @ApiOperation({ summary: 'Statistiques mensuelles par chauffeur' })
  async getMonthlyStatsByCompanyByDriverByMonth(
    @CurrentCompany() companyId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.chargementDechargementService.getMonthlyStatsByCompanyByDriverByMonth(
      companyId,
      Number(year),
      Number(month),
    );
  }
  //one
@Get('report/revenue/:year/:month')
@ApiOperation({ summary: 'Chiffre d’affaires par site pour le mois (optionnel: siteId, day)' })
@ApiQuery({ name: 'siteId', required: false, type: String })
@ApiQuery({ name: 'day', required: false, type: String })
async getRevenue(
  @CurrentCompany() companyId: string,
  @Param('year') year: number,
  @Param('month') month: number,
  @Query('siteId') siteId?: string,
  @Query('day') day?: string,
) {
  return this.chargementDechargementService.getRevenueByMonth(
    companyId,
    Number(year),
    Number(month),
    siteId,
    day,
  );
}


//two
@Get('report/production/:year/:month')
@ApiOperation({ summary: 'Production de tonnes par site pour le mois (optionnel: siteId, day)' })
@ApiQuery({ name: 'siteId', required: false, type: String })
@ApiQuery({ name: 'day', required: false, type: String, description: 'Filtrer par jour au format YYYY-MM-DD' })
async getProduction(
  @CurrentCompany() companyId: string,
  @Param('year') year: number,
  @Param('month') month: number,
  @Query('siteId') siteId?: string,
  @Query('day') day?: string,
) {
  return this.chargementDechargementService.getProductionByMonth(
    companyId,
    Number(year),
    Number(month),
    siteId,
    day,
  );
}


//One
@Get('ranking/:year/:month')
@ApiOperation({ summary: 'Classement des chauffeurs par site et par mois (optionnel: siteId, day)' })
@ApiQuery({ name: 'siteId', required: false, type: String })
@ApiQuery({ name: 'day', required: false, type: String })
async getRanking(
  @CurrentCompany() companyId: string,
  @Param('year') year: number,
  @Param('month') month: number,
  @Query('siteId') siteId?: string,
  @Query('day') day?: string,
) {
  return this.chargementDechargementService.getRankingBySiteAndMonth(
    companyId,
    Number(year),
    Number(month),
    siteId,
    day,
  );
}


}
