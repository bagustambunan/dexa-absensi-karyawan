import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsSelect } from 'typeorm';
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
  ) {}

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
