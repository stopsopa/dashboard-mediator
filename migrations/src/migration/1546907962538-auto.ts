import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1546907962538 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `clusters` CHANGE `ip` `domain` varchar(50) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `clusters` CHANGE `domain` `ip` varchar(50) NOT NULL");
    }

}
