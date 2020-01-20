import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { MapPiece } from './map-piece.entity';

@Entity()
export class CorridorMap {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => MapPiece, piece => piece.map)
    public pieces: MapPiece[];

    @Column({default:0})
    @Index("totalPieces")
    totalPieces:number;
}