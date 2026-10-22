import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, type FindOptionsSelect } from 'typeorm';
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
