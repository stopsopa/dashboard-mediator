import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1546939581591 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `clusters` CHANGE `port` `port` int(8) NOT NULL DEFAULT 80");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `clusters` CHANGE `port` `port` varchar(8) NOT NULL");
    }
}
