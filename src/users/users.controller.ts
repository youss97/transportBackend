import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/schemas/create-user.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateUserDto } from 'src/schemas/update-user.dto';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { CompanyAccessGuard } from 'src/guards/company-access.guard'; 

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyAccessGuard) 
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto, @CurrentCompany() companyId: string) {
    return this.usersService.create(createUserDto, companyId); 
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  findAll(@CurrentCompany() companyId: string) {
    return this.usersService.findAll(companyId); 
  }

  @Get('drivers')
  @ApiOperation({ summary: 'Lister tous les chauffeurs' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  findDrivers(@CurrentCompany() companyId: string) {
    return this.usersService.findDriversByCompany(companyId); 
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Lister les utilisateurs par rôle' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  findByRole(@Param('role') role: string, @CurrentCompany() companyId: string) {
    return this.usersService.findUsersByRole(companyId, role); 
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des utilisateurs' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async getStats(@CurrentCompany() companyId: string) {
    const totalUsers = await this.usersService.countUsersByCompany(companyId);
    const drivers = await this.usersService.findDriversByCompany(companyId);
    const admins = await this.usersService.findAdminsByCompany(companyId);
    
    return {
      totalUsers,
      totalDrivers: drivers.length,
      totalAdmins: admins.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.usersService.findOne(id, companyId); // PASSAGE DU COMPANY_ID
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentCompany() companyId: string
  ) {
    return this.usersService.update(id, updateUserDto, companyId); 
  }

  @Put(':id/performance')
  @ApiOperation({ summary: 'Mettre à jour le score de performance' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  updatePerformance(
    @Param('id') id: string, 
    @Body('score') score: number,
    @CurrentCompany() companyId: string
  ) {
    return this.usersService.updatePerformanceScore(id, score, companyId); 
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer (désactiver) un utilisateur' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}