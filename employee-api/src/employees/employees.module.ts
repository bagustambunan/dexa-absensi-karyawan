import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.ts';
import { Employee } from './employee.entity.ts';
import { AdminEmployeesController } from './admin-employees.controller.ts';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Employee])],
  controllers: [AdminEmployeesController],
})
export class EmployeesModule {}
