import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CorridorMap } from './corridor-map.entity';
import { MapPiece } from './map-piece.entity';

@Entity()
export class MapSlot{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type=>MapPiece, {cascade:false, eager:true})
    @JoinColumn()
    piece:MapPiece;

    @ManyToOne(type=>CorridorMap, {eager:false, cascade:false})
    @JoinColumn()
    map:CorridorMap;

    @Column({default:0})
    x:number;

    @Column({default:0})
    y:number;
}