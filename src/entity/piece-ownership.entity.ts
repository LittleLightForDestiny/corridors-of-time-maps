import {Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, Unique} from 'typeorm';
import { Player } from './player.entity';
import { MapPiece } from './map-piece.entity';

@Entity()
@Unique('piece_owner', ['piece', 'owner'])
export class PieceOwnership{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length:1000})
    public evidenceImage: string;
    
    @ManyToOne(type => Player, player=> player.pieces)
    public owner: Player;

    @ManyToOne(type => MapPiece, piece => piece.owners)
    public piece: MapPiece;
}