import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CreateLeaveDto, UpdateLeaveStatusDto } from 'src/schemas/leave.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { LeaveType } from 'src/schemas/leave.schema';

@ApiTags('Congés')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService, private cloudinaryService :CloudinaryService) {}

 @ApiOperation({ summary: 'Créer un congé (normal ou arrêt maladie)' })
@ApiConsumes('multipart/form-data')
@ApiBody({ type: CreateLeaveDto })
@UseInterceptors(FileInterceptor('medicalFile'))
@Post()
async create(
  @UploadedFile() medicalFile: Express.Multer.File,
  @CurrentUser() user: any,
  @CurrentCompany() companyId: any,
  @Body() dto: CreateLeaveDto,
) {
  // Congé SICK => fichier requis
  if (dto.type === LeaveType.SICK && !medicalFile) {
    throw new ForbiddenException('Le certificat médical est requis pour un arrêt maladie.');
  }

  let medicalFileUrl: string | undefined;

  // Upload si fichier fourni
  if (medicalFile) {
    const result = await this.cloudinaryService.uploadFile(medicalFile);
    medicalFileUrl = result.secure_url;
  }

  return this.leaveService.create(user.userId, companyId, dto, medicalFileUrl);
}

  @Get('my')
  @ApiOperation({ summary: 'Voir mes congés' })
  getMyLeaves(@CurrentUser() user: any, @CurrentCompany() companyId: any) {
    return this.leaveService.findByUser(user.userId, companyId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Lister tous les congés en attente de validation (dans ma société)' })
  getPending(@CurrentCompany() companyId: any) {
    return this.leaveService.findPendingLeaves(companyId);
  }

  @Patch(':id/validate')
  @ApiOperation({ summary: 'Valider ou refuser un congé' })
  @ApiParam({ name: 'id', description: 'ID du congé' })
  validateLeave(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.validateLeave(id, dto);
  }
}
