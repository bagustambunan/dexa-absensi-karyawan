import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployees1792606535894 implements MigrationInterface {
    name = 'CreateEmployees1792606535894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`UQ_employees_email\` ON \`employees\``);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD UNIQUE INDEX \`IDX_765bc1ac8967533a04c74a9f6a\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`phone\` varchar(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`avatar_path\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`avatar_path\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`role\` enum ('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE'`);
        await queryRunner.query(`ALTER TABLE \`employees\` CHANGE \`created_at\` \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`employees\` CHANGE \`updated_at\` \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employees\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`employees\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`role\` varchar(32) NOT NULL DEFAULT 'employee'`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`avatar_path\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`avatar_path\` varchar(512) NULL`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`phone\` varchar(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP INDEX \`IDX_765bc1ac8967533a04c74a9f6a\``);
        await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`employees\` ADD \`email\` varchar(254) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_employees_email\` ON \`employees\` (\`email\`)`);
    }

}
