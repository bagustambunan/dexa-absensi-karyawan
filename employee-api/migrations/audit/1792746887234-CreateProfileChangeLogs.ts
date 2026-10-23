import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfileChangeLogs1792746887234 implements MigrationInterface {
  name = 'CreateProfileChangeLogs1792746887234';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`profile_change_logs\` (
      \`event_id\` char(36) NOT NULL,
      \`employee_id\` char(36) NOT NULL,
      \`changed_field\` varchar(30) NOT NULL,
      \`occurred_at_utc\` datetime(3) NOT NULL,
      \`logged_at_utc\` datetime(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
      PRIMARY KEY (\`event_id\`)
    ) ENGINE=InnoDB`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `profile_change_logs`');
  }
}
