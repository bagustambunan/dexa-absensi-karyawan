import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { Employee } from './employees/employee.entity.ts';
import { ProfileNotification } from './notifications/profile-notification.entity.ts';

config({
  path: resolve(import.meta.dirname, '../../.env'),
});

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.EMPLOYEE_DB_NAME,
  timezone: 'Z',
  entities: [Employee, ProfileNotification],
  migrations: [
    resolve(import.meta.dirname, '../migrations/*{.ts,.js}'),
  ],
  synchronize: false,
});
