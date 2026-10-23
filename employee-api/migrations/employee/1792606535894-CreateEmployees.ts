import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployees1792606535894 implements MigrationInterface {
    name = 'CreateEmployees1792606535894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`employees\` (\`id\` char(36) NOT NULL, \`full_name\` varchar(150) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`position\` varchar(100) NOT NULL, \`phone\` varchar(30) NOT NULL, \`avatar_path\` varchar(255) NULL, \`role\` enum ('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE', \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`IDX_765bc1ac8967533a04c74a9f6a\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`employees\``);
    }
}
