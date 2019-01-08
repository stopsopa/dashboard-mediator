import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1546941087212 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_9c7f6f921efc3df435bbe862c8` ON `clusters`(`cluster`, `node`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP INDEX `IDX_9c7f6f921efc3df435bbe862c8` ON `clusters`");
    }

}
