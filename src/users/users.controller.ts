import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/schemas/create-user.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('users')
@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur' })
  // @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
