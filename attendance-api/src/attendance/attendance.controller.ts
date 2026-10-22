import {
  BadRequestException,
  ConflictException,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
} from '../auth/jwt-auth.guard.ts';
import { AttendanceEvent } from './attendance-event.entity.ts';

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
