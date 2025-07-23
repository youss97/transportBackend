import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PanneService } from './panne.service';
import {
    ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreatePanneDto } from 'src/schemas/create-panne.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('Pannes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pannes')
export class PanneController {
  constructor(
    private readonly panneService: PanneService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une panne avec 3 photos individuelles' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePanneDto })
  @ApiResponse({ status: 201, description: 'Panne créée avec succès' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo1', maxCount: 1 },
      { name: 'photo2', maxCount: 1 },
      { name: 'photo3', maxCount: 1 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      photo1?: Express.Multer.File[];
      photo2?: Express.Multer.File[];
      photo3?: Express.Multer.File[];
    },
    @Body() dto: CreatePanneDto,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,
  ) {
    const userId = user.userId;

    const urls: string[] = [];

    for (const key of ['photo1', 'photo2', 'photo3']) {
      const photoFile = files[key]?.[0];
      if (photoFile) {
        const result = await this.cloudinaryService.uploadFile(photoFile);
        urls.push(result.secure_url);
      }
    }

    return this.panneService.create(dto, companyId, userId, urls);
  }
  @Get('company')
  @ApiOperation({ summary: 'Lister les pannes d’une entreprise' })
  async getAllByCompany(@CurrentCompany() companyId: string) {
    return this.panneService.findByCompanyId(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une panne par ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async getById(@Param('id') id: string) {
    return this.panneService.findById(id);
  }
}
