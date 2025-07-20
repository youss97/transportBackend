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

@ApiTags('Congés')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un congé (normal ou arrêt maladie)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLeaveDto })
  @UseInterceptors(FileInterceptor('medicalFile'))
  create(
    @UploadedFile() medicalFile: Express.Multer.File,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: any,
    @Body() dto: CreateLeaveDto,
  ) {
    const fileUrl = medicalFile?.path;
    return this.leaveService.create(user.userId, companyId, dto, fileUrl);
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
