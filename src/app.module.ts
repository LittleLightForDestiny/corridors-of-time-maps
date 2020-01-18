import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BungieAuthMiddleware } from './bungie-auth.middleware';
import { CorridorMap } from './entity/corridor-map.entity';
import { MapPiece } from './entity/map-piece.entity';
import { MapSlot } from './entity/map-slot.entity';
import { PieceCorner } from './entity/piece-corner.entity';
import { PieceOwnership } from './entity/piece-ownership.entity';
import { Player } from './entity/player.entity';
import { MapPieceModule } from './map-piece/map-piece.module';
import { MapSlotModule } from './map-slot/map-slot.module';
import { MapModule } from './map/map.module';
import { PlayerModule } from './player/player.module';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(
      {isGlobal: true,}
    ),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'admin',
      password: 'admin',
      database: 'corridors-of-time',
      entities: [
        CorridorMap,
        MapPiece,
        MapSlot,
        PieceCorner,
        PieceOwnership,
        Player,
      ],
      synchronize: true,
    }),
    MapPieceModule,
    PlayerModule,
    MapModule,
    MapSlotModule],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BungieAuthMiddleware)
      .forRoutes('/map-piece/import');
  }
 }
