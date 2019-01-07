import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1546900447471 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `clusters` (`id` int NOT NULL AUTO_INCREMENT, `cluster` varchar(50) NOT NULL, `node` varchar(50) NOT NULL, `ip` varchar(50) NOT NULL, `port` varchar(8) NOT NULL, `created` datetime NULL, `updated` datetime NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TABLE `clusters`");
    }

}
