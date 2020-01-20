import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, PrimaryColumn, EntityManager, ManyToOne } from 'typeorm';
import { PieceCorner } from './piece-corner.entity';
import { PieceOwnership } from './piece-ownership.entity';
import { CorridorMap } from './corridor-map.entity';

@Entity()
@Unique('identifier', ['identifier'])
export class MapPiece {
    @PrimaryColumn({ default: "" })
    public identifier: string;

    @Column({ length: 1 })
    public center: string;

    @Column({ length: 6 })
    public walls: string;

    @OneToMany(() => PieceCorner, corner => corner.piece, { eager: true , cascade:true})
    public corners: PieceCorner[];

    @OneToMany(() => PieceOwnership, ownership => ownership.piece, {
        eager: true,
        cascade:true
    })
    public owners: PieceOwnership[];

    @ManyToOne(()=>CorridorMap, map=>map.pieces, {eager:true})
    public map:CorridorMap;

    @Column({nullable:true})
    public x?:number;

    @Column({nullable:true})
    public y?:number;

    @Column({ default: false })
    public approved: boolean;
}