import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BungieAuthMiddleware } from './bungie-auth.middleware';
import { CorridorMap } from './entity/corridor-map.entity';
import { MapPiece } from './entity/map-piece.entity';
import { PieceCorner } from './entity/piece-corner.entity';
import { PieceOwnership } from './entity/piece-ownership.entity';
import { Player } from './entity/player.entity';
import { MapModule } from './map/map.module';
import { PlayerModule } from './player/player.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(
      { isGlobal: true, }
    ),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          CorridorMap,
          MapPiece,
          PieceCorner,
          PieceOwnership,
          Player,
        ],
        synchronize: false,
      }),
      inject:[ConfigService]
    }),
    PlayerModule,
    MapModule],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(BungieAuthMiddleware)
    //   .forRoutes('/map-piece/import');
    consumer
      .apply(BungieAuthMiddleware)
      .forRoutes('/map-piece/create');
  }
}
