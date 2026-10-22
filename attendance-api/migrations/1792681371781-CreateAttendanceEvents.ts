import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAttendanceEvents1792681371781 implements MigrationInterface {
    name = 'CreateAttendanceEvents1792681371781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`attendance_events\` (\`id\` char(36) NOT NULL, \`employee_id\` char(36) NOT NULL, \`work_date\` date NOT NULL, \`type\` enum ('IN', 'OUT') NOT NULL, \`occurred_at_utc\` datetime(3) NOT NULL, INDEX \`IDX_attendance_date\` (\`work_date\`), INDEX \`IDX_attendance_employee_date\` (\`employee_id\`, \`work_date\`), UNIQUE INDEX \`UQ_attendance_employee_date_type\` (\`employee_id\`, \`work_date\`, \`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`UQ_attendance_employee_date_type\` ON \`attendance_events\``);
        await queryRunner.query(`DROP INDEX \`IDX_attendance_employee_date\` ON \`attendance_events\``);
        await queryRunner.query(`DROP INDEX \`IDX_attendance_date\` ON \`attendance_events\``);
        await queryRunner.query(`DROP TABLE \`attendance_events\``);
    }

}
