import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorridorMap } from '../entity/corridor-map.entity';
import { MapPiece } from '../entity/map-piece.entity';
import { MapPieceService } from './map-piece.service';
import { MapPieceController } from './map-piece.controller';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorridorMap, MapPiece]),
    PlayerModule
  ],
  providers: [MapService, MapPieceService],
  controllers: [MapController, MapPieceController]
})
export class MapModule { }
