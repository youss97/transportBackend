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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PointageService } from './pointage.service';
import { CreatePointageDto } from 'src/schemas/create-pointage.dto';
import {
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdatePointageDto } from 'src/schemas/update-pointage.dto';
import { CurrentCompany } from 'src/decorators/company.decorator';
@ApiTags('pointage')
@Controller('pointage')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Post()
  @ApiOperation({ summary: 'ajouter pointage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoSelfie', maxCount: 1 },
      { name: 'photoKilometrage', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createPointageDto: CreatePointageDto,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,

    @UploadedFiles()
    files: {
      photoSelfie?: Express.Multer.File[];
      photoKilometrage?: Express.Multer.File[];
    },
  ) {
    const userId = user.userId;
    if (files?.photoSelfie?.[0]) {
      createPointageDto.photoSelfie = await this.pointageService.uploadPhoto(
        files.photoSelfie[0],
        'selfie',
      );
    }

    if (files?.photoKilometrage?.[0]) {
      createPointageDto.photoKilometrage =
        await this.pointageService.uploadPhoto(
          files.photoKilometrage[0],
          'kilometrage',
        );
    }

    return this.pointageService.create(createPointageDto, userId,companyId);
  }
  @Get('today')
  @ApiOperation({
    summary: "Récupérer le pointage d'aujourd'hui du conducteur",
  })
  async getTodayPointage(@CurrentUser() user: any) {
    const driver = user.userId;
    const pointage = await this.pointageService.findTodayPointage(driver);

    if (!pointage) {
      return { message: "Aucun pointage trouvé pour aujourd'hui" }; // Message explicite si rien trouvé
    }

    return pointage; // Renvoie le pointage si trouvé
  }

  @Get()
  @ApiOperation({ summary: 'mes pointages' })
  async findAllByCurrentUser(@CurrentUser() user: any) {
    const driver = user.userId;
    return this.pointageService.findAllByUserId(driver);
  }
  @Get()
  @ApiOperation({ summary: 'tous les  pointages de toutes les societes' })
  async findAll() {
    return this.pointageService.findAll();
  }
  @Get('by-company')
  @ApiOperation({ summary: "les pointages des utilisateurs d'une societe" })
  async findAllByCompanyId(@CurrentCompany() companyId: any) {
    return this.pointageService.findAllByCompanyId(companyId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'activity by id' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.pointageService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'modifier pointage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoSelfie', maxCount: 1 },
      { name: 'photoKilometrage', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePointageDto: UpdatePointageDto,
    @CurrentUser() user: any,
    @UploadedFiles()
    files: {
      photoSelfie?: Express.Multer.File[];
      photoKilometrage?: Express.Multer.File[];
    },
  ) {
    const userId = user.userId;

    // Upload des nouvelles photos si présentes
    if (files?.photoSelfie?.[0]) {
      updatePointageDto.photoSelfie = await this.pointageService.uploadPhoto(
        files.photoSelfie[0],
        'selfie',
      );
    }

    if (files?.photoKilometrage?.[0]) {
      updatePointageDto.photoKilometrage =
        await this.pointageService.uploadPhoto(
          files.photoKilometrage[0],
          'kilometrage',
        );
    }

    return this.pointageService.update(id, updatePointageDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'supprimer pointage' })
  async remove(@Param('id') id: string) {
    await this.pointageService.remove(id);
    return { message: 'Pointage supprimé avec succès' };
  }
}
