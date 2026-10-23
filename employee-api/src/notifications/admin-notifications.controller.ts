import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard.ts';
import { Employee } from '../employees/employee.entity.ts';
import { ProfileNotification } from './profile-notification.entity.ts';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class AdminNotificationsController {
  constructor(
    @InjectRepository(ProfileNotification)
    private readonly notifications: Repository<ProfileNotification>,
  ) { }

  @Get()
  async list(@Query('afterId') afterId: unknown) {
    if (afterId === undefined) {
      const latest = await this.notifications.findOne({
        where: {},
        select: { id: true },
        order: { id: 'DESC' },
      });
      return { items: [], cursor: latest?.id ?? 0 };
    }

    if (
      typeof afterId !== 'string' ||
      !/^\d+$/.test(afterId) ||
      !Number.isSafeInteger(Number(afterId)) ||
      Number(afterId) > 4294967295
    ) {
      throw new BadRequestException(
        'afterId harus bilangan bulat antara 0 dan 4294967295',
      );
    }

    const cursor = Number(afterId);
    const rows = await this.notifications
      .createQueryBuilder('notification')
      .leftJoin(Employee, 'employee', 'employee.id = notification.employeeId')
      .select('notification.id', 'id')
      .addSelect('notification.employeeId', 'employeeId')
      .addSelect(
        'COALESCE(employee.fullName, notification.employeeId)',
        'employeeName',
      )
      .addSelect('notification.changedField', 'changedField')
      .addSelect('notification.createdAtUtc', 'createdAt')
      .where('notification.id > :cursor', { cursor })
      .orderBy('notification.id', 'ASC')
      .limit(50)
      .getRawMany<{
        id: number;
        employeeId: string;
        employeeName: string;
        changedField: ProfileNotification['changedField'];
        createdAt: Date;
      }>();

    const items = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
    return { items, cursor: items.at(-1)?.id ?? cursor };
  }
}
