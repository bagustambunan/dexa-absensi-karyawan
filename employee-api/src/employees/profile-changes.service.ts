import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { Employee } from './employee.entity.ts';
import { ProfileNotification } from '../notifications/profile-notification.entity.ts';

export type ProfileChanges = Partial<
  Pick<Employee, 'fullName' | 'email' | 'position' | 'phone' | 'avatarPath'>
> & { password?: string };

@Injectable()
export class ProfileChangesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async update(
    id: string,
    changes: ProfileChanges,
    role?: Employee['role'],
    options: { requireActive?: boolean; currentPassword?: string } = {},
  ): Promise<{ previousAvatarPath: string | null }> {
    if (changes.password !== undefined && (
      typeof changes.password !== 'string' || changes.password.length < 8 ||
      Buffer.byteLength(changes.password, 'utf8') > 72
    )) {
      throw new BadRequestException('Password minimal 8 karakter dan maksimal 72 byte');
    }

    return this.dataSource.transaction(async (manager) => {
      const employee = await manager.findOne(Employee, {
        where: {
          id,
          ...(role === undefined ? {} : { role }),
          ...(options.requireActive ? { isActive: true } : {}),
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!employee) {
        if (options.requireActive) throw new UnauthorizedException('Akun tidak aktif atau tidak tersedia');
        throw new NotFoundException('Karyawan tidak ditemukan');
      }

      if (
        options.currentPassword !== undefined &&
        !(await compare(options.currentPassword, employee.passwordHash))
      ) {
        throw new BadRequestException('Password saat ini tidak sesuai');
      }

      const updates: Partial<Employee> = {};
      const fields: ProfileNotification['changedField'][] = [];
      for (const field of ['fullName', 'email', 'position', 'phone', 'avatarPath'] as const) {
        const value = changes[field];
        if (value === undefined || value === employee[field]) continue;
        Object.assign(updates, { [field]: value });
        if (field === 'phone') fields.push('PHONE');
        if (field === 'avatarPath') fields.push('PHOTO');
      }
      if (changes.password !== undefined && !(await compare(changes.password, employee.passwordHash))) {
        updates.passwordHash = await hash(changes.password, 12);
        fields.push('PASSWORD');
      }
      if (!Object.keys(updates).length) return { previousAvatarPath: employee.avatarPath };

      await manager.update(Employee, { id }, updates);
      for (const changedField of fields) {
        await manager.insert(ProfileNotification, {
          eventId: randomUUID(), employeeId: id, changedField, publishedAtUtc: null,
          createdAtUtc: () => 'UTC_TIMESTAMP(3)',
        });
      }
      return { previousAvatarPath: employee.avatarPath };
    });
  }
}
