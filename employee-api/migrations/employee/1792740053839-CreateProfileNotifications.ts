import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfileNotifications1792740053839 implements MigrationInterface {
    name = 'CreateProfileNotifications1792740053839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profile_notifications\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`event_id\` char(36) NOT NULL, \`employee_id\` char(36) NOT NULL, \`changed_field\` varchar(30) NOT NULL, \`created_at_utc\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`published_at_utc\` datetime(3) NULL, INDEX \`IDX_profile_notifications_pending\` (\`published_at_utc\`, \`id\`), UNIQUE INDEX \`IDX_fe128be670b7d3621e5901cb2c\` (\`event_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_fe128be670b7d3621e5901cb2c\` ON \`profile_notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_profile_notifications_pending\` ON \`profile_notifications\``);
        await queryRunner.query(`DROP TABLE \`profile_notifications\``);
    }

}
