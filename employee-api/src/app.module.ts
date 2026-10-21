import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.getOrThrow<string>('MYSQL_HOST'),
        port: Number(config.getOrThrow<string>('MYSQL_PORT')),
        username: config.getOrThrow<string>('MYSQL_USER'),
        password: config.getOrThrow<string>('MYSQL_PASSWORD'),
        database: config.getOrThrow<string>('EMPLOYEE_DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
