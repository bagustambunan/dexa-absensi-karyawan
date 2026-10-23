import {
  Controller,
  Get,
  NotFoundException,
  Req,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { open } from 'node:fs/promises';
import { extname } from 'node:path';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Roles, type AuthenticatedRequest } from '../auth/jwt-auth.guard.ts';
import { Employee } from './employee.entity.ts';

@Controller('me')
@UseGuards(JwtAuthGuard)
@Roles('EMPLOYEE')
export class MeController {
  constructor(
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
  ) {}

  private async activeEmployee(id: string) {
    const employee = await this.employees.findOne({
      where: { id, role: 'EMPLOYEE', isActive: true },
      select: {
        id: true, fullName: true, email: true, position: true,
        phone: true, avatarPath: true,
      },
    });
    if (!employee) throw new UnauthorizedException('Akun tidak aktif atau tidak tersedia');
    return employee;
  }

  @Get()
  async me(@Req() request: AuthenticatedRequest) {
    const employee = await this.activeEmployee(request.user.sub);
    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      position: employee.position,
      phone: employee.phone,
      avatarUrl: employee.avatarPath ? '/api/me/avatar' : null,
    };
  }

  @Get('avatar')
  async avatar(@Req() request: AuthenticatedRequest) {
    const employee = await this.activeEmployee(request.user.sub);
    if (!employee.avatarPath) throw new NotFoundException('Foto tidak tersedia');
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.webp': 'image/webp', '.gif': 'image/gif',
    };
    const type = types[extname(employee.avatarPath).toLowerCase()];
    if (!type) throw new NotFoundException('Foto tidak tersedia');
    try {
      const file = await open(employee.avatarPath, 'r');
      return new StreamableFile(file.createReadStream(), { type });
    } catch {
      throw new NotFoundException('Foto tidak tersedia');
    }
  }
}
