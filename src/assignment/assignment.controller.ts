import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateAssignmentDto } from 'src/schemas/create-assignment.dto';
import { UpdateAssignmentDto } from 'src/schemas/update-assignment.dto';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('Affectations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle affectation' })
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentCompany() companyId: any,
  ) {
    return this.assignmentService.create(createAssignmentDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les affectations de la société' })
  findAll(@CurrentCompany() companyId: any) {
    return this.assignmentService.findAll(companyId);
  }

  @Get('my-drivers')
  @Roles(UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Lister les chauffeurs affectés au superviseur connecté',
  })
  getMyDrivers(@CurrentUser() user: any) {
    return this.assignmentService.findDriversBySupervisor(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Afficher une affectation par ID' })
  @ApiParam({ name: 'id', description: 'ID de l’affectation' })
  findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une affectation' })
  @ApiParam({ name: 'id', description: 'ID de l’affectation' })
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une affectation' })
  @ApiParam({ name: 'id', description: 'ID de l’affectation' })
  remove(@Param('id') id: string) {
    return this.assignmentService.remove(id);
  }

  @Get('unassigned-drivers')
  @ApiOperation({ summary: 'Lister les chauffeurs non affectés' })
  getUnassignedDrivers() {
    return this.assignmentService.getUnassignedDrivers();
  }

  @Get('unassigned-supervisors')
  @ApiOperation({ summary: 'Lister les superviseurs non affectés' })
  getUnassignedSupervisors() {
    return this.assignmentService.getUnassignedSupervisors();
  }
}
