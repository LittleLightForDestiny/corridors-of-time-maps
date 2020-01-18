import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapPiece } from '../entity/map-piece.entity';
import { CreateMapPieceDto } from './dto/create-map-piece.dto';
import { Repository, DeepPartial, FindOneOptions } from 'typeorm';

import { PieceCorner } from 'src/entity/piece-corner.entity';
import { PieceOwnership } from '../entity/piece-ownership.entity';
import { PlayerService } from '../player/player.service';

@Injectable()
export class MapPieceService {
  constructor(@InjectRepository(MapPiece) private repo: Repository<MapPiece>, private player: PlayerService) {
  }

  get find(): Repository<MapPiece>['find'] {
    return this.repo.find.bind(this.repo);
  }

  get findOne(): Repository<MapPiece>['findOne'] {
    return this.repo.findOne.bind(this.repo);
  }

  async updateOrNew(input: CreateMapPieceDto) {
    const identifier = this.generateIdentifier(input.center, input.sides);
    var piece = await this.repo.findOne({
      identifier: identifier
    }, { loadEagerRelations: true });
    if (!piece) {
      piece = this.repo.create({
        center: input.center,
        walls: input.walls,
        identifier: identifier,
        corners: input.sides.map((value, index): DeepPartial<PieceCorner> => {
          console.log(value);
          return {
            code: value,
            order: index
          };
        }),
        owners: [],
      });
    }
    var ownerAlreadyAdded = piece.owners?.find((ownership) => ownership.owner.membershipId == input.membershipId);
    if (ownerAlreadyAdded) {
      ownerAlreadyAdded.evidenceImage = input.evidenceUrl;
    } else {
      const player = await this.player.findOne({ membershipId: input.membershipId });
      console.log(input.membershipId);
      if (player) {
        piece.owners.push({
          evidenceImage: input.evidenceUrl,
          owner: player,
          piece: piece,
          id: null
        });
      }
    }

    this.repo.save(piece);
  }

  private generateIdentifier(center: String, sides: String[]) {
    return `${center}_${sides.join('_')}`;
  }
}
