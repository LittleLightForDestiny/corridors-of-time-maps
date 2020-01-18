import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorridorMap } from '../entity/corridor-map.entity';
import { MapSlotModule } from '../map-slot/map-slot.module';
import { MapPieceModule } from '../map-piece/map-piece.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorridorMap]),
    MapSlotModule,
    MapPieceModule
  ],
  providers: [MapService],
  controllers: [MapController]
})
export class MapModule { }
