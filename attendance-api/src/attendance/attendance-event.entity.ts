import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('attendance_events')
@Index('UQ_attendance_employee_date_type', [
  'employeeId',
  'workDate',
  'type',
], { unique: true })
@Index('IDX_attendance_employee_date', ['employeeId', 'workDate'])
@Index('IDX_attendance_date', ['workDate'])
export class AttendanceEvent {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'employee_id', type: 'char', length: 36 })
  employeeId!: string;

  @Column({ name: 'work_date', type: 'date' })
  workDate!: string;

  @Column({ type: 'enum', enum: ['IN', 'OUT'] })
  type!: 'IN' | 'OUT';

  @Column({
    name: 'occurred_at_utc',
    type: 'datetime',
    precision: 3,
  })
  occurredAtUtc!: Date;
}