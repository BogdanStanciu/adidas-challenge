/* eslint-disable @typescript-eslint/class-name-casing */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class initDb1615141644430 implements MigrationInterface {
  name = 'initDb1615141644430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "firstName" character varying, "gender" integer, "birth" date NOT NULL, "consent" boolean NOT NULL, "newsletterCampaign" integer NOT NULL, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba857f4e5d61b74f184c26de3c" ON "subscription" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da6a1f2334458042b241b4b876" ON "subscription" ("newsletterCampaign") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ed07d84e07dcaae466ecb5424f" ON "subscription" ("email", "newsletterCampaign") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ed07d84e07dcaae466ecb5424f"`);
    await queryRunner.query(`DROP INDEX "IDX_da6a1f2334458042b241b4b876"`);
    await queryRunner.query(`DROP INDEX "IDX_ba857f4e5d61b74f184c26de3c"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
  }
}
