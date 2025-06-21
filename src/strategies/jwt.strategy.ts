import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      company :payload.company // Assurez-vous que l'utilisateur a une société
    };
  }
}
