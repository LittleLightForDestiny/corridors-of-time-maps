import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { MapSlot } from './map-slot.entity';

@Entity()
export class CorridorMap {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => MapSlot, slot => slot.map, { cascade: true, eager:true })
    public slots: MapSlot[];

    @Column({default:0})
    totalPieces:number;
}