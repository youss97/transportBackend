// src/gazoil/gazoil.controller.ts
import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Req,
  Param,
} from '@nestjs/common';
import { GazoilService } from './gazoil.service';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/enums/user-role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateGazoilDto } from 'src/schemas/create-gazoil.dto';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@ApiTags('Gazoil')
@ApiBearerAuth()
@Controller('gazoil')
export class GazoilController {
  constructor(private readonly gazoilService: GazoilService) {}

  @Post()
  @Roles(UserRole.DRIVER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'kilometragePhoto', maxCount: 1 },
      { name: 'gazoilPhoto', maxCount: 1 },
    ])
  )
  @ApiOperation({ summary: 'Ajouter une entrée de gazoil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateGazoilDto })
  async create(
    @UploadedFiles() files: { kilometragePhoto?: Express.Multer.File[], gazoilPhoto?: Express.Multer.File[] },
    @Body() dto: CreateGazoilDto,
    @CurrentUser() req: any,
    @CurrentCompany() company: string
  ) {
    const driverId = req.userId;
    const companyId = company;

    // Vérifie que les fichiers sont présents
    if (!files.kilometragePhoto || !files.gazoilPhoto) {
      throw new Error('Les deux images (kilométrage et gazoil) sont nécessaires.');
    }

    return this.gazoilService.create(dto, files, driverId, companyId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lister toutes les entrées gazoil' })
  getAll(@CurrentCompany() req: any) {
    return this.gazoilService.findAll(req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un gazoil par ID' })
  getById(@Param('id') id: string) {
    return this.gazoilService.findById(id);
  }
}
