import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MapPiece } from './map-piece.entity';

@Entity()
export class PieceCorner{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    public code: string;
    
    @Column()
    public order!: number;


    @ManyToOne(type => MapPiece, piece => piece.corners)
    public piece: MapPiece;
}