import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { AttendanceEvent } from './attendance/attendance-event.entity.ts';
import { AuthModule } from './auth/auth.module.ts';
import { AdminAttendanceController } from './attendance/admin-attendance.controller.ts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    AuthModule,
    TypeOrmModule.forFeature([AttendanceEvent]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.getOrThrow<string>('MYSQL_HOST'),
        port: Number(config.getOrThrow<string>('MYSQL_PORT')),
        username: config.getOrThrow<string>('MYSQL_USER'),
        password: config.getOrThrow<string>('MYSQL_PASSWORD'),
        database: config.getOrThrow<string>('ATTENDANCE_DB_NAME'),
        timezone: 'Z',
        entities: [AttendanceEvent],
        synchronize: false,
      }),
    }),
  ],
  controllers: [AppController, AdminAttendanceController],
  providers: [AppService],
})
export class AppModule { }
