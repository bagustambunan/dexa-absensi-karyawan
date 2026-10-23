import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.ts';
import { Employee } from './employee.entity.ts';
import { AdminEmployeesController } from './admin-employees.controller.ts';
import { ProfileNotification } from '../notifications/profile-notification.entity.ts';
import { ProfileChangesService } from './profile-changes.service.ts';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Employee, ProfileNotification])],
  controllers: [AdminEmployeesController],
  providers: [ProfileChangesService],
  exports: [ProfileChangesService],
})
export class EmployeesModule {}
