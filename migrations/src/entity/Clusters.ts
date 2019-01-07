import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
    Unique,
} from "typeorm";

import { Roles } from './Roles';

@Entity('clusters')
export class Clusters {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Collumn types: https://github.com/typeorm/typeorm/blob/master/src/driver/types/ColumnTypes.ts
     */
    @Column({
        length: 50
    })
    cluster: string;

    @Column({
        length: 50
    })
    node: string;

    @Column({
        length: 50
    })
    ip: string;

    @Column({
        length: 8
    })
    port: string;

    @Column("datetime", {
        nullable: true,
        // default: () => 'CURRENT_TIMESTAMP',
    })
    created: Date;

    @Column("datetime", {
        default: () => null,
        nullable: true,
        // onUpdate: "CURRENT_TIMESTAMP" // available for DATETIME since MySQL 5.6.5 https://stackoverflow.com/a/168832/5560682
    })
    updated: Date;
}
