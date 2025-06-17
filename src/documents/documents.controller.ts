import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  UseInterceptors, 
  UploadedFile, 
  Body, 
  UseGuards,
  Res,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UploadDocumentDto } from 'src/schemas/upload-document.dto';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

 @Post('upload')
@ApiOperation({ summary: 'Télécharger un document' })
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}))
uploadDocument(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: UploadDocumentDto,
  @CurrentUser() user: any
) {
  return this.documentsService.uploadDocument(
    file,
    body.type as unknown as DocumentType,
    user.userId,
    body.vehicleId,
    body.activityId,
    body.expirationDate ? new Date(body.expirationDate) : undefined
  );
}


  @Get('my-documents')
  @ApiOperation({ summary: 'Mes documents' })
  getMyDocuments(@CurrentUser() user: any) {
    return this.documentsService.findByOwner(user.userId);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Documents d\'un véhicule' })
  getVehicleDocuments(@Param('vehicleId') vehicleId: string) {
    return this.documentsService.findByVehicle(vehicleId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Documents expirant bientôt' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  getExpiringDocuments(@Query('days') days?: string) {
    return this.documentsService.findExpiringSoon(days ? parseInt(days, 10) : 30);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Télécharger un document' })
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    const { document, filePath } = await this.documentsService.getDocument(id);
    
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    
    return res.sendFile(filePath, { root: '.' });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document' })
  @Roles(UserRole.ADMIN)
  deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}