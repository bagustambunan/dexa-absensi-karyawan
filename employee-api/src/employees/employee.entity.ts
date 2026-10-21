import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100 })
  position!: string;

  @Column({ type: 'varchar', length: 30 })
  phone!: string;

  @Column({
    name: 'avatar_path',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatarPath!: string | null;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'EMPLOYEE'],
    default: 'EMPLOYEE',
  })
  role!: 'ADMIN' | 'EMPLOYEE';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
  })
  updatedAt!: Date;
}