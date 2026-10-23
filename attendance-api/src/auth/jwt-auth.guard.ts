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
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { Request } from 'express';


export type Role = 'ADMIN' | 'EMPLOYEE';
export type JwtUser = { sub: string; role: Role; exp: number };
export type AuthenticatedRequest = Request & { user: JwtUser };

const ROLES_KEY = 'auth:roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(ConfigService) private readonly config: ConfigService,
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
    const database = this.dataSource.driver.escape(
      this.config.getOrThrow<string>('EMPLOYEE_DB_NAME'),
    );
    const accounts: { id: string }[] = await this.dataSource.query(
      `SELECT id FROM ${database}.\`employees\` WHERE id = ? AND is_active = 1 AND role = ? LIMIT 1`,
      [user.sub, user.role],
    );
    if (!accounts.length) {
      throw new UnauthorizedException('Akun tidak aktif atau tidak tersedia');
    }

    request.user = user;
    return true;
  }
}
