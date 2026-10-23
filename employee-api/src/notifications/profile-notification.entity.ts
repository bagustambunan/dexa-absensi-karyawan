import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('profile_notifications')
@Index('IDX_profile_notifications_pending', ['publishedAtUtc', 'id'])
export class ProfileNotification {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    unsigned: true,
  })
  id!: number;

  @Column({
    name: 'event_id',
    type: 'char',
    length: 36,
    unique: true,
  })
  eventId!: string;

  @Column({
    name: 'employee_id',
    type: 'char',
    length: 36,
  })
  employeeId!: string;

  @Column({
    name: 'changed_field',
    type: 'varchar',
    length: 30,
  })
  changedField!: string;

  @CreateDateColumn({
    name: 'created_at_utc',
    type: 'datetime',
    precision: 3,
  })
  createdAtUtc!: Date;

  @Column({
    name: 'published_at_utc',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  publishedAtUtc!: Date | null;
}