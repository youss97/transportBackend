import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

 async login(user: any) {
  console.log(await bcrypt.compare("5XuX9pfZd&Fr", "$2b$12$uAZk9Z0cBpoP4/8WnqGiYOUEk/3KoEHOmVmm1znfN5n/vBgSwQPay"));

  const payload = { 
    email: user.email, 
    sub: user._id, 
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company
  };

  const accessToken = this.jwtService.sign(payload, {
    expiresIn: '10h',
  });

  const refreshToken = this.jwtService.sign(
    { sub: user._id },
    { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET }
  );

  // Enregistrer le refreshToken dans la base (hashé si besoin)
  await this.usersService.updateRefreshToken(user._id, refreshToken);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      company: user.company
    },
  };
}
async getUserIfRefreshTokenMatches(userId: string, refreshToken: string) {
  return this.usersService.getUserIfRefreshTokenMatches(userId, refreshToken);
}


}