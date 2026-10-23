import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileNotification } from '../notifications/profile-notification.entity.ts';
import { ProfileChangeLog } from './profile-change-log.entity.ts';
import { ProfileAuditService } from './profile-audit.service.ts';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileNotification]),
    TypeOrmModule.forFeature([ProfileChangeLog], 'audit'),
  ],
  providers: [ProfileAuditService],
})
export class AuditModule {}
