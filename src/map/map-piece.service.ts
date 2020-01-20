import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapPiece } from '../entity/map-piece.entity';
import { CreateMapPieceDto } from './dto/create-map-piece.dto';
import { Repository, DeepPartial, getRepository } from 'typeorm';

import { PieceCorner } from 'src/entity/piece-corner.entity';
import { PlayerService } from '../player/player.service';
import { CorridorMap } from '../entity/corridor-map.entity';
import { MapService } from './map.service';
import { threadId } from 'worker_threads';

@Injectable()
export class MapPieceService {
  constructor(
    @InjectRepository(MapPiece) private repo: Repository<MapPiece>, 
    private player: PlayerService,
    private mapService: MapService) {
  }

  get find(): Repository<MapPiece>['find'] {
    return this.repo.find.bind(this.repo);
  }

  get findOne(): Repository<MapPiece>['findOne'] {
    return this.repo.findOne.bind(this.repo);
  }

  async updateOrNew(input: CreateMapPieceDto) {
    const identifier = this.generateIdentifier(input.center, input.corners);
    let piece = await this.repo.findOne({
      identifier: identifier
    }, { 
      join:{
        alias:'piece',
        leftJoinAndSelect:{
          ownerships:'piece.owners',
          owner:'ownerships.owner'
        }
      }
     });
    if (!piece) {
      piece = this.repo.create({
        center: input.center,
        walls: input.walls,
        identifier: identifier,
        corners: input.corners.map((value, index): DeepPartial<PieceCorner> => {
          return {
            code: value,
            order: index
          };
        }),
        owners: [],
      });
    }
    console.log(piece);
    let ownerAlreadyAdded = piece.owners?.find((ownership) => ownership.owner?.membershipId == input.membershipId);
    if (ownerAlreadyAdded) {
      ownerAlreadyAdded.evidenceImage = input.evidenceUrl;
    } else {
      const player = await this.player.findOne({ membershipId: input.membershipId });
      if (player) {
        piece.owners.push({
          evidenceImage: input.evidenceUrl,
          owner: player,
          piece: piece,
          id: null
        });
      }
    }
    piece = await this.repo.save(piece, {reload:true});
    await this.addToMap(piece);
  }

  private async addToMap(piece: MapPiece, createMapIfNotFound:boolean = true, testedSlots:number[][] = []) {
    let possibleNeighbours:PieceCorner[] = await this.findNeighbourCandidates(piece);
    let map: CorridorMap;
    let oldMap: CorridorMap;
    for (let i in possibleNeighbours) {
      let neighbour = possibleNeighbours[i];
      map = neighbour.piece?.map;
      oldMap = piece.map;
      if (map) {
        let [posx, posy]: number[] = this.findPositionOffset([neighbour.piece?.x, neighbour.piece?.y], neighbour?.order);
        let eligible:boolean = await this.isEligibleForSlot(map, piece, [posx, posy]);
        var existing = await this.repo.findOne({map:map, x:posx, y:posy});
        if(existing){
          // await this.addNeighbours(map, existing, testedSlots);
          return;
        };

        console.log(map?.id, piece?.map?.id, posx, posy, piece.identifier, piece.map?.totalPieces, map?.totalPieces, eligible);
        
        if((piece?.map?.totalPieces ?? 0) > map?.totalPieces){  
          this.addToMap(neighbour.piece, false, testedSlots);
          return;
        }
        if (eligible) {
          piece.x = posx;
          piece.y = posy;
          piece.map = map;
          break;
        }
      }
    }
    console.log('save', piece.identifier, piece.x, piece.y);
    if (!piece.map && createMapIfNotFound) {
      map = await this.mapService.createOne({});
      piece.x = 0;
      piece.y = 0;
      piece.map = map;
    }
    
    if(!piece) return;
    piece = await this.repo.save(piece, {reload:true, });
    map = await this.mapService.updateCount(piece.map);
    if(oldMap){
      await this.mapService.updateCount(oldMap);
    }
    testedSlots.push([piece.x, piece.y]);
    await this.addNeighbours(map, piece, testedSlots);
  }

  async addNeighbours( map:CorridorMap, piece:MapPiece, testedSlots:number[][]){
    let candidates:PieceCorner[] = await this.findNeighbourCandidates(piece);
    for (let i in piece.corners){
      let corner = piece.corners[i];
      let pos = this.findPositionOffset([piece.x, piece.y], corner.order);      
      let alreadyTested = testedSlots.find((p)=>p.toString() == pos.toString());
      if(alreadyTested) continue;
      testedSlots.push(pos);
      var candidate:PieceCorner = candidates.find((c)=>c.code == corner.code); 
      if(candidate){
        await this.addToMap(candidate.piece, false, testedSlots);
      }
    }
  }

  private async isEligibleForSlot(map: CorridorMap, piece: MapPiece, [x, y]: number[]): Promise<boolean> {
    if (!map) return false;
    for (let i in piece.corners) {
      let corner = piece.corners[i];
      let [nx, ny]: number[] = this.findPositionOffset([x, y], corner.order);
      let neighbour = await this.repo.findOne({map:map, x:nx, y:ny});
      let opposingOrder = (corner.order + 3) % 6;
      let nCorner = neighbour?.corners?.find((nc) => nc.order == opposingOrder);
      if (nCorner && nCorner.code != corner.code) {
        return false;
      }
      if (nCorner?.code == "BBBBBBB" || corner.code == "BBBBBBB") {
        return false;
      }
    }
    return true;
  }

  findPositionOffset([x, y]: number[], direction: number): number[] {
    switch (direction) {
      case 0: return [x + 1, y - 1];
      case 1: return [x + 1, y + 1];
      case 2: return [x, y + 2];
      case 3: return [x - 1, y + 1];
      case 4: return [x - 1, y - 1];
      case 5: return [x, y - 2];
    }
  }

  private async findNeighbourCandidates(piece: MapPiece): Promise<PieceCorner[]> {
    let candidates: PieceCorner[] = [];
    for (let i in piece.corners) {
      let corner = piece.corners[i];
      let oppositeCornerOrder = (corner.order + 3) % 6;
      let oppositeCorners = await getRepository(PieceCorner)
        .find({
          where: { code: corner.code, order: oppositeCornerOrder },
          loadEagerRelations:false,
          relations: ["piece", "piece.map"]
        });
      candidates = candidates.concat(oppositeCorners);
    }
    candidates.filter((c) => c.piece?.map?.id != piece?.map?.id && c.code != "BBBBBBB");

    return candidates.sort((ca, cb) => (cb.piece?.map?.totalPieces ?? 0) - (ca.piece?.map?.totalPieces ?? 0));
  }

  private generateIdentifier(center: String, sides: String[]) {
    return `${center}_${sides.join('_')}`;
  }
}
