import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { hash } from 'bcrypt';
import { escapeId } from 'mysql2';
import { createConnection } from 'mysql2/promise';

config({ path: resolve(import.meta.dirname, '../../.env'), quiet: true });
for (const key of [
  'MYSQL_HOST',
  'MYSQL_PORT',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'EMPLOYEE_DB_NAME',
  'ATTENDANCE_DB_NAME',
]) {
  if (!process.env[key]) throw new Error(`${key} wajib diisi`);
}

const accounts = [
  {
    fullName: 'Admin Demo',
    email: 'admin@example.com',
    role: 'ADMIN',
    position: 'HRD',
    phone: '081200000001',
    password: 'DemoAdmin123!',
  },
  {
    fullName: 'Karyawan 1',
    email: 'employee1@example.com',
    role: 'EMPLOYEE',
    position: 'Developer',
    phone: '081200000002',
    password: 'DemoEmployee123!',
  },
  {
    fullName: 'Karyawan 2',
    email: 'employee2@example.com',
    role: 'EMPLOYEE',
    position: 'Designer',
    phone: '081200000003',
    password: 'DemoEmployee123!',
  },
];

const connection = await createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  timezone: 'Z',
});
try {
  await connection.query("SET time_zone = '+00:00'");
  await connection.beginTransaction();
  const employees = `${escapeId(process.env.EMPLOYEE_DB_NAME)}.employees`;
  for (const account of accounts) {
    await connection.execute(
      `INSERT INTO ${employees}
       (id, full_name, email, password_hash, position, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE id = id`,
      [
        randomUUID(),
        account.fullName,
        account.email,
        await hash(account.password, 12),
        account.position,
        account.phone,
        account.role,
      ],
    );
    const [rows] = await connection.execute(
      `SELECT id, role FROM ${employees} WHERE email = ?`,
      [account.email],
    );
    const employee = rows[0];
    if (!employee || employee.role !== account.role) {
      throw new Error(`Role ${account.email} berbeda dari seed`);
    }
    if (account.role !== 'EMPLOYEE') continue;
    const attendance = `${escapeId(process.env.ATTENDANCE_DB_NAME)}.attendance_events`;
    for (const date of ['2026-10-01', '2026-10-02']) {
      for (const [type, utcTime] of [
        ['IN', '01:00:00.000'],
        ['OUT', '10:00:00.000'],
      ]) {
        await connection.execute(
          `INSERT INTO ${attendance} (id, employee_id, work_date, type, occurred_at_utc)
           VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = id`,
          [randomUUID(), employee.id, date, type, `${date} ${utcTime}`],
        );
      }
    }
  }
  await connection.commit();
  console.log('Seed demo selesai.');
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
