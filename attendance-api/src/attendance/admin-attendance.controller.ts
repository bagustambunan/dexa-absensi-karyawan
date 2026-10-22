import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  type FindOptionsWhere,
} from 'typeorm';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard.ts';
import { AttendanceEvent } from './attendance-event.entity.ts';

type AttendanceRow = {
  employeeId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
};

@Controller('admin/attendance')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class AdminAttendanceController {
  constructor(
    @InjectRepository(AttendanceEvent)
    private readonly events: Repository<AttendanceEvent>,
  ) {}

  @Get()
  async list(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('employeeId') employeeId?: string,
  ): Promise<AttendanceRow[]> {
    for (const [field, value] of [
      ['from', from],
      ['to', to],
    ]) {
      if (value === undefined) continue;
      if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value
      ) {
        throw new BadRequestException(
          `${field} harus tanggal valid YYYY-MM-DD`,
        );
      }
    }
    if (from && to && from > to) {
      throw new BadRequestException('from tidak boleh melebihi to');
    }
    if (
      employeeId !== undefined &&
      (typeof employeeId !== 'string' ||
        !employeeId.trim() ||
        employeeId.length > 36)
    ) {
      throw new BadRequestException('employeeId tidak valid');
    }

    const where: FindOptionsWhere<AttendanceEvent> = {};
    if (employeeId !== undefined) where.employeeId = employeeId.trim();
    if (from && to) where.workDate = Between(from, to);
    else if (from) where.workDate = MoreThanOrEqual(from);
    else if (to) where.workDate = LessThanOrEqual(to);

    const events = await this.events.find({
      select: {
        employeeId: true,
        workDate: true,
        type: true,
        occurredAtUtc: true,
      },
      where,
      order: { workDate: 'DESC', employeeId: 'ASC' },
    });
    const rows = new Map<string, AttendanceRow>();
    for (const event of events) {
      const key = `${event.employeeId}:${event.workDate}`;
      let row = rows.get(key);
      if (!row) {
        row = {
          employeeId: event.employeeId,
          date: event.workDate,
          checkInAt: null,
          checkOutAt: null,
        };
        rows.set(key, row);
      }
      if (event.type === 'IN')
        row.checkInAt = event.occurredAtUtc.toISOString();
      else if (event.type === 'OUT')
        row.checkOutAt = event.occurredAtUtc.toISOString();
    }
    return [...rows.values()];
  }
}
