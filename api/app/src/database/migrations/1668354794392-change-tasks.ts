import {MigrationInterface, QueryRunner} from "typeorm";

export class changeTasks1668354794392 implements MigrationInterface {
    name = 'changeTasks1668354794392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testapp" ADD "creation_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "testapp" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testapp" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "testapp" DROP COLUMN "creation_at"`);
    }

}
