import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, PrimaryColumn, EntityManager } from 'typeorm';
import { PieceCorner } from './piece-corner.entity';
import { PieceOwnership } from './piece-ownership.entity';

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

    @Column({ default: false })
    public approved: boolean;
}