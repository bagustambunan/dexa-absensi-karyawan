import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { Employee } from '../employees/employee.entity.ts';

export type Role = Employee['role'];
export type JwtUser = { sub: string; role: Role; exp: number };
export type AuthenticatedRequest = Request & { user: JwtUser };

const ROLES_KEY = 'auth:roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = /^Bearer ([^\s]+)$/i.exec(
      request.headers.authorization ?? '',
    );
    if (!match) throw new UnauthorizedException('Bearer token wajib diisi');

    let user: JwtUser;
    try {
      const payload = await this.jwt.verifyAsync<Record<string, unknown>>(
        match[1],
        {
          algorithms: ['HS256'],
        },
      );
      if (
        typeof payload.sub !== 'string' ||
        !payload.sub.trim() ||
        (payload.role !== 'ADMIN' && payload.role !== 'EMPLOYEE') ||
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        throw new Error('Invalid JWT claims');
      }
      user = { sub: payload.sub, role: payload.role, exp: payload.exp };
    } catch {
      throw new UnauthorizedException('Token tidak valid atau kedaluwarsa');
    }

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException('Role tidak diizinkan');
    }
    request.user = user;
    return true;
  }
}
