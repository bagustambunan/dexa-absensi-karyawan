import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Between, QueryFailedError, Repository } from 'typeorm';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
} from '../auth/jwt-auth.guard.ts';
import { AttendanceEvent } from './attendance-event.entity.ts';

type AttendanceDay = {
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
};

const workDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

@Controller('attendance')
@UseGuards(JwtAuthGuard)
@Roles('EMPLOYEE')
export class AttendanceController {
  constructor(
    @InjectRepository(AttendanceEvent)
    private readonly events: Repository<AttendanceEvent>,
  ) {}

  @Get('me')
  async me(
    @Req() request: AuthenticatedRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<AttendanceDay[]> {
    if ((from === undefined) !== (to === undefined)) {
      throw new BadRequestException('from dan to harus diisi bersamaan');
    }
    const today = workDateFormat.format(new Date());
    const start = from ?? `${today.slice(0, 8)}01`;
    const end = to ?? today;
    for (const [field, value] of [
      ['from', start],
      ['to', end],
    ]) {
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
    if (start > end) {
      throw new BadRequestException('from tidak boleh melebihi to');
    }

    const events = await this.events.find({
      select: { workDate: true, type: true, occurredAtUtc: true },
      where: { employeeId: request.user.sub, workDate: Between(start, end) },
      order: { workDate: 'DESC' },
    });
    const days = new Map<string, AttendanceDay>();
    for (const event of events) {
      let day = days.get(event.workDate);
      if (!day) {
        day = { date: event.workDate, checkInAt: null, checkOutAt: null };
        days.set(event.workDate, day);
      }
      if (event.type === 'IN')
        day.checkInAt = event.occurredAtUtc.toISOString();
      else if (event.type === 'OUT')
        day.checkOutAt = event.occurredAtUtc.toISOString();
    }
    return [...days.values()];
  }

  @Post('check-in')
  checkIn(@Req() request: AuthenticatedRequest) {
    return this.record(request.user.sub, 'IN');
  }

  @Post('check-out')
  checkOut(@Req() request: AuthenticatedRequest) {
    return this.record(request.user.sub, 'OUT');
  }

  private async record(employeeId: string, type: AttendanceEvent['type']) {
    const occurredAtUtc = new Date();
    const workDate = workDateFormat.format(occurredAtUtc);
    if (
      type === 'OUT' &&
      !(await this.events.existsBy({ employeeId, workDate, type: 'IN' }))
    ) {
      throw new BadRequestException('Check-in hari ini belum dilakukan');
    }

    const event = {
      id: randomUUID(),
      employeeId,
      workDate,
      type,
      occurredAtUtc,
    };
    try {
      await this.events.insert(event);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          type === 'IN'
            ? 'Sudah check-in hari ini'
            : 'Sudah check-out hari ini',
        );
      }
      throw error;
    }
    return event;
  }
}
