import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('profile_change_logs')
export class ProfileChangeLog {
  @PrimaryColumn({ name: 'event_id', type: 'char', length: 36 })
  eventId!: string;

  @Column({ name: 'employee_id', type: 'char', length: 36 })
  employeeId!: string;

  @Column({ name: 'changed_field', type: 'varchar', length: 30 })
  changedField!: 'PHOTO' | 'PHONE' | 'PASSWORD';

  @Column({ name: 'occurred_at_utc', type: 'datetime', precision: 3 })
  occurredAtUtc!: Date;

  @CreateDateColumn({
    name: 'logged_at_utc',
    type: 'datetime',
    precision: 3,
    default: () => '(UTC_TIMESTAMP(3))',
  })
  loggedAtUtc!: Date;
}
