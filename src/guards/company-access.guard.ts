import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/enums/user-role.enum';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Protection contre user non défini
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const companyId = request.params.companyId || request.body.companyId || request.query.companyId;

    if (!user.company) {
      throw new ForbiddenException('Utilisateur sans société');
    }

    if (companyId && companyId !== user.company.toString()) {
      throw new ForbiddenException('Accès refusé : société différente');
    }

    return true;
  }
}
