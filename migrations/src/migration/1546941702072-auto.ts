import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1546941702072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `clusters` CHANGE `node` `node` varchar(50) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {

        await queryRunner.query("ALTER TABLE `clusters` CHANGE `node` `node` varchar(50) NOT NULL");
    }

}
