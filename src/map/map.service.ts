import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CorridorMap } from '../entity/corridor-map.entity';
import { MapPiece } from '../entity/map-piece.entity';

@Injectable()
export class MapService {
    constructor(@InjectRepository(CorridorMap) private repo: Repository<CorridorMap>) {
    }

    async createOne(data: DeepPartial<CorridorMap>) {
        var map = this.repo.create(data);
        await this.save(map);
        return map;
    }

    async updateCount(map: CorridorMap): Promise<CorridorMap> {
        map = await this.repo.findOne({ id: map.id },
            { relations: ['pieces'] });
        map.totalPieces = map.pieces.length;
        if(map.totalPieces == 0){
            await this.repo.delete(map);
            return null;
        }else{
            map = await this.repo.save(map, { reload: true });
        }
        return map;
    }

    save(map: CorridorMap) {
        return this.repo.save(map);
    }

    get findOne(): Repository<CorridorMap>['findOne'] {
        return this.repo.findOne.bind(this.repo);
    }

    get find(): Repository<CorridorMap>['find'] {
        return this.repo.find.bind(this.repo);
    }

    async addPieceToMap(map: CorridorMap, piece: MapPiece, [x, y]: number[]) {
        piece.map = map;
        piece.x = x;
        piece.y = y;
        map.pieces.push(piece);
        await this.repo.save(map);
        return map;
    }

    async updatePieceCounts(){
        let maps = await this.repo.find({
            relations: ['pieces'],
        });
        for(var i in maps){
            let map = maps[i];
            map.totalPieces = map.pieces.length;
            if(map.totalPieces > 0){
                await this.repo.save(map);
            }else{
                await this.repo.delete(map);
            }
        }
    }
}
