import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  connect,
  type Channel,
  type ChannelModel,
  type ConfirmChannel,
} from 'amqplib';
import { setTimeout as delay } from 'node:timers/promises';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { ProfileNotification } from '../notifications/profile-notification.entity.ts';
import { ProfileChangeLog } from './profile-change-log.entity.ts';

const queue = 'profile-changes.audit';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type ProfileEvent = {
  eventId: string;
  eventType: 'employee.profile.changed';
  employeeId: string;
  changedField: ProfileNotification['changedField'];
  occurredAt: string;
};

@Injectable()
export class ProfileAuditService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProfileAuditService.name);
  private running = false;
  private task?: Promise<void>;
  private connection?: ChannelModel;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @InjectRepository(ProfileNotification)
    private readonly notifications: Repository<ProfileNotification>,
    @InjectRepository(ProfileChangeLog, 'audit')
    private readonly logs: Repository<ProfileChangeLog>,
  ) {}

  onModuleInit() {
    const url = this.config.getOrThrow<string>('RABBITMQ_URL');
    this.running = true;
    this.task = this.run(url);
  }

  async onModuleDestroy() {
    this.running = false;
    await this.connection?.close().catch(() => {});
    await this.task;
  }

  private async run(url: string) {
    while (this.running) {
      let connection: ChannelModel | undefined;
      try {
        connection = await connect(url, { timeout: 10000 });
        this.connection = connection;
        connection.on('error', () =>
          this.logger.warn('Koneksi RabbitMQ terputus'),
        );
        const publisher = await connection.createConfirmChannel();
        const consumer = await connection.createChannel();
        publisher.on('error', () =>
          this.logger.warn('Channel publisher gagal'),
        );
        consumer.on('error', () => this.logger.warn('Channel consumer gagal'));
        await publisher.assertQueue(queue, { durable: true });
        while (this.running) {
          await this.publish(publisher);
          await this.consume(consumer);
          if (this.running) await delay(2000);
        }
      } catch {
        if (this.running)
          this.logger.warn('Audit belum berhasil; coba lagi dalam 2 detik');
      } finally {
        this.connection = undefined;
        await connection?.close().catch(() => {});
      }
      if (this.running) await delay(2000);
    }
  }

  private async publish(channel: ConfirmChannel) {
    const pending = await this.notifications.find({
      where: { publishedAtUtc: IsNull() },
      order: { id: 'ASC' },
      take: 50,
    });
    for (const notification of pending) {
      if (!this.running) return;
      const event: ProfileEvent = {
        eventId: notification.eventId,
        eventType: 'employee.profile.changed',
        employeeId: notification.employeeId,
        changedField: notification.changedField,
        occurredAt: notification.createdAtUtc.toISOString(),
      };
      let returned = false;
      const onReturn = () => {
        returned = true;
      };
      channel.once('return', onReturn);
      try {
        await new Promise<void>((resolve, reject) => {
          channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(event)),
            {
              persistent: true,
              mandatory: true,
              contentType: 'application/json',
            },
            (error) => (error ? reject(error) : resolve()),
          );
        });
        if (returned) throw new Error('Queue audit tidak tersedia');
      } finally {
        channel.removeListener('return', onReturn);
      }
      await this.notifications.update(
        { id: notification.id, publishedAtUtc: IsNull() },
        {
          publishedAtUtc: () => 'UTC_TIMESTAMP(3)',
        },
      );
    }
  }

  private async consume(channel: Channel) {
    for (let i = 0; i < 50 && this.running; i++) {
      const message = await channel.get(queue, { noAck: false });
      if (!message) return;
      let event: ProfileEvent;
      try {
        event = this.readEvent(message.content);
      } catch {
        this.logger.warn('Pesan audit tidak valid; pesan ditolak');
        channel.nack(message, false, false);
        continue;
      }
      try {
        await this.logs.manager.transaction(async (manager) => {
          try {
            await manager.insert(ProfileChangeLog, {
              eventId: event.eventId,
              employeeId: event.employeeId,
              changedField: event.changedField,
              occurredAtUtc: new Date(event.occurredAt),
            });
          } catch (error) {
            if (
              !(error instanceof QueryFailedError) ||
              (error.driverError as { code?: string }).code !== 'ER_DUP_ENTRY'
            )
              throw error;
          }
        });
        channel.ack(message);
      } catch (error) {
        channel.nack(message, false, true);
        throw error;
      }
    }
  }

  private readEvent(content: Buffer): ProfileEvent {
    const value: unknown = JSON.parse(content.toString());
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Invalid event');
    const event = value as Record<string, unknown>;
    if (
      typeof event.eventId !== 'string' ||
      !uuid.test(event.eventId) ||
      event.eventType !== 'employee.profile.changed' ||
      typeof event.employeeId !== 'string' ||
      !uuid.test(event.employeeId) ||
      typeof event.changedField !== 'string' ||
      !['PHOTO', 'PHONE', 'PASSWORD'].includes(event.changedField) ||
      typeof event.occurredAt !== 'string' ||
      !Number.isFinite(Date.parse(event.occurredAt)) ||
      new Date(event.occurredAt).toISOString() !== event.occurredAt
    )
      throw new Error('Invalid event');
    return event as ProfileEvent;
  }
}
