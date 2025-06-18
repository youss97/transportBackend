import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/enums/user-role.enum';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    const companyId = request.params.companyId || request.body.companyId || request.query.companyId;
    
    if (companyId && companyId !== user.companyId) {
      throw new ForbiddenException('Accès refusé : données d\'une autre société');
    }
    
    return true;
  }
}