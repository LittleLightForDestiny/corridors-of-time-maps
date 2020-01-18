import {Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn} from 'typeorm';
import { PieceOwnership } from './piece-ownership.entity';

@Entity()
export class Player{
    @PrimaryColumn()
    public membershipId: string;

    @Column()
    public name: string;

    @OneToMany(type => PieceOwnership, piece => piece.owner)
    public pieces: PieceOwnership[];

    @Column({default:false})
    public blocked:boolean;

    @Column({default:false, })
    public moderator:boolean;

    @Column({default:false})
    public sysAdmin:boolean;
}