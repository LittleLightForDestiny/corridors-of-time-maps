import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from 'src/player/player.module';
import { MapPiece } from '../entity/map-piece.entity';
import { MapPieceController } from './map-piece.controller';
import { MapPieceService } from './map-piece.service';

@Module({
  imports: [TypeOrmModule.forFeature([MapPiece]), PlayerModule],
  providers: [MapPieceService],
  controllers: [MapPieceController],
  exports: [MapPieceService],
})
export class MapPieceModule{
}
