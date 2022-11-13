import {MigrationInterface, QueryRunner} from "typeorm";

export class init1668353801498 implements MigrationInterface {
    name = 'init1668353801498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "testapp" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "completed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_375af497e6f1064792163fcc6ed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "testapp"`);
    }

}
