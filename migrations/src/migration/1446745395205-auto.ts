import {MigrationInterface, QueryRunner} from "typeorm";

//export class auto1546745395205 implements MigrationInterface {
export class auto1446745395205 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `roles` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(10) NOT NULL, `created` datetime NULL, `updated` datetime NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `firstName` varchar(50) NOT NULL, `lastName` varchar(50) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `enabled` tinyint(1) NOT NULL DEFAULT 0, `created` datetime NULL, `updated` datetime NULL, `config` mediumtext NULL, UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `many` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(50) NOT NULL, `user_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_role` (`user_id` int NOT NULL, `role_id` int NOT NULL, PRIMARY KEY (`user_id`, `role_id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `many` ADD CONSTRAINT `FK_c38f48340b7b2f067d02bb36dcb` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT");
        await queryRunner.query("ALTER TABLE `user_role` ADD CONSTRAINT `FK_d0e5815877f7395a198a4cb0a46` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT");
        await queryRunner.query("ALTER TABLE `user_role` ADD CONSTRAINT `FK_32a6fc2fcb019d8e3a8ace0f55f` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_role` DROP FOREIGN KEY `FK_32a6fc2fcb019d8e3a8ace0f55f`");
        await queryRunner.query("ALTER TABLE `user_role` DROP FOREIGN KEY `FK_d0e5815877f7395a198a4cb0a46`");
        await queryRunner.query("ALTER TABLE `many` DROP FOREIGN KEY `FK_c38f48340b7b2f067d02bb36dcb`");
        await queryRunner.query("DROP TABLE `user_role`");
        await queryRunner.query("DROP TABLE `many`");
        await queryRunner.query("DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP TABLE `roles`");
    }

}
