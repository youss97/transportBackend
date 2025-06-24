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
import { ChargementDechargementService } from './chargement-dechargement.service';
import { CreateChargementDechargementDto } from 'src/schemas/create-chargement-dechargement.dto';
import {
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateChargementDechargementDto } from 'src/schemas/update-chargement-dechargement.dto';

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
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photo', maxCount: 1 }]))
  async create(
    @Body() createDto: CreateChargementDechargementDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: { photo?: Express.Multer.File[] },
  ) {
    const userId = user.userId;
    if (files?.photo?.[0]) {
      createDto.photo = await this.chargementDechargementService.uploadPhoto(
        files.photo[0],
        'photo',
      );
    }

    return this.chargementDechargementService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer les chargements/déchargements' })
  async findAll(@CurrentUser() user: any) {
    return this.chargementDechargementService.findAllByUserId(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un chargement/dechargement' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chargementDechargementService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un chargement/dechargement' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photo', maxCount: 1 }]))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChargementDechargementDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: { photo?: Express.Multer.File[] },
  ) {
    if (files?.photo?.[0]) {
      updateDto.photo = await this.chargementDechargementService.uploadPhoto(
        files.photo[0],
        'photo',
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
  @Get('today')
  @ApiOperation({
    summary: "Récupérer le chargement/déchargement d'aujourd'hui du conducteur",
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
}
