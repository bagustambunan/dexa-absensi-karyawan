import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { ProfileChangeLog } from '../audit/profile-change-log.entity.ts';

config({ path: resolve(import.meta.dirname, '../../../.env') });

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.AUDIT_DB_NAME,
  timezone: 'Z',
  entities: [ProfileChangeLog],
  migrations: [resolve(import.meta.dirname, '../../migrations/audit/*{.ts,.js}')],
  synchronize: false,
});
