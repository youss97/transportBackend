import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

class LoginDto {
  email: string;
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' }
      }
    }
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
