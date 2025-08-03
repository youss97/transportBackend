import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/schemas/create-user.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateUserDto } from 'src/schemas/update-user.dto';
import { CurrentCompany } from 'src/decorators/company.decorator';
import { CompanyAccessGuard } from 'src/guards/company-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DeleteAccountDto } from 'src/schemas/delete-account.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() })) // Interceptor pour photo
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiConsumes('multipart/form-data')
  @Roles(UserRole.ADMIN)
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() photo: Express.Multer.File, // Ajouter le fichier photo
    @CurrentCompany() companyId: string,
  ) {
    return this.usersService.create(createUserDto, companyId, photo);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() })) // Interceptor pour photo
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo?: Express.Multer.File, // Ajouter le fichier photo
    @CurrentCompany() companyId?: string,
  ) {
    return this.usersService.update(id, updateUserDto, companyId, photo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer (désactiver) un utilisateur' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les utilisateurs avec pagination et recherche',
  })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filtrer par frstName,lastName,role,email',
  })
  findAll(
    @CurrentCompany() companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.usersService.findAll(companyId, +page, +limit, search);
  }

  @Get('drivers')
  @ApiOperation({ summary: 'Lister tous les chauffeurs' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findDrivers(@CurrentCompany() companyId: string) {
    return this.usersService.findDriversByCompany(companyId);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Lister les utilisateurs par rôle' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findByRole(@Param('role') role: string, @CurrentCompany() companyId: string) {
    return this.usersService.findUsersByRole(companyId, role);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des utilisateurs' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/performance')
  @ApiOperation({ summary: 'Mettre à jour le score de performance' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updatePerformance(
    @Param('id') id: string,
    @Body('score') score: number,
    @CurrentCompany() companyId: string,
  ) {
    return this.usersService.updatePerformanceScore(id, score, companyId);
  }

  // @Get('search')
  // @ApiOperation({
  //   summary: 'Rechercher des utilisateurs par nom, prénom et rôle',
  // })
  // @Roles(UserRole.ADMIN)
  // searchUsers(
  //   @CurrentCompany() companyId: string,
  //   @Query('firstName') firstName?: string,
  //   @Query('lastName') lastName?: string,
  //   @Query('role') role?: string,
  // ) {
  //   return this.usersService.searchUsers(companyId, {
  //     firstName,
  //     lastName,
  //     role,
  //   });
  // }
  // users.controller.ts
  @Post('delete-account')
  @ApiOperation({
    summary: 'Supprimer le compte ou les données de l’utilisateur',
  })
  async deleteAccount(@Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(dto);
  }
}
