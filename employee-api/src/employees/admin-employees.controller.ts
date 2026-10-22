import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Not,
  QueryFailedError,
  Repository,
  type FindOptionsSelect,
} from 'typeorm';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcrypt';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard.ts';
import { Employee } from './employee.entity.ts';

const employeeFields: FindOptionsSelect<Employee> = {
  id: true,
  fullName: true,
  email: true,
  position: true,
  phone: true,
  isActive: true,
};

@Controller('api/admin/employees')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class AdminEmployeesController {
  constructor(
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
  ) { }

  @Post()
  async create(@Body() body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Data karyawan tidak valid');
    }
    const input = body as Record<string, unknown>;
    const requiredText = (field: string, maxLength: number) => {
      const value = input[field];
      if (
        typeof value !== 'string' ||
        !value.trim() ||
        value.trim().length > maxLength
      ) {
        throw new BadRequestException(
          `${field} wajib diisi, maksimal ${maxLength} karakter`,
        );
      }
      return value.trim();
    };
    const fullName = requiredText('fullName', 150);
    const email = requiredText('email', 255).toLowerCase();
    const position = requiredText('position', 100);
    const phone = requiredText('phone', 30);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Format email tidak valid');
    }
    const password = input.initialPassword;
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw new BadRequestException(
        'initialPassword minimal 8 karakter dan maksimal 72 byte',
      );
    }
    if (await this.employees.existsBy({ email })) {
      throw new ConflictException('Email sudah digunakan');
    }

    const id = randomUUID();
    const passwordHash = await hash(password, 12);
    try {
      await this.employees.insert({
        id,
        fullName,
        email,
        position,
        phone,
        passwordHash,
        role: 'EMPLOYEE',
        isActive: true,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Email sudah digunakan');
      }
      throw error;
    }
    return { id, fullName, email, position, phone, isActive: true };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Data karyawan tidak valid');
    }
    const input = body as Record<string, unknown>;
    const limits = { fullName: 150, email: 255, position: 100, phone: 30 };
    if (
      !Object.keys(input).length ||
      Object.keys(input).some((key) => !Object.hasOwn(limits, key))
    ) {
      throw new BadRequestException(
        'Hanya fullName, email, position, dan phone yang boleh diubah',
      );
    }
    const changes: Partial<Pick<Employee, keyof typeof limits>> = {};
    for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
      if (!Object.hasOwn(input, field)) continue;
      const value = input[field];
      if (
        typeof value !== 'string' ||
        !value.trim() ||
        value.trim().length > limits[field]
      ) {
        throw new BadRequestException(
          `${field} wajib diisi, maksimal ${limits[field]} karakter`,
        );
      }
      changes[field] = value.trim();
    }
    if (changes.email !== undefined) {
      changes.email = changes.email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) {
        throw new BadRequestException('Format email tidak valid');
      }
    }
    await this.detail(id);
    if (
      changes.email !== undefined &&
      (await this.employees.existsBy({ email: changes.email, id: Not(id) }))
    ) {
      throw new ConflictException('Email sudah digunakan');
    }
    try {
      await this.employees.update({ id, role: 'EMPLOYEE' }, changes);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Email sudah digunakan');
      }
      throw error;
    }
    return this.detail(id);
  }

  @Get()
  list() {
    return this.employees.find({
      where: { role: 'EMPLOYEE' },
      select: employeeFields,
      order: { fullName: 'ASC', id: 'ASC' },
    });
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const employee = await this.employees.findOne({
      where: { id, role: 'EMPLOYEE' },
      select: employeeFields,
    });
    if (!employee) throw new NotFoundException('Karyawan tidak ditemukan');
    return employee;
  }
}
