import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DeepPartial, getRepository } from 'typeorm';
import { CorridorMap } from '../entity/corridor-map.entity';
import { PieceCorner } from '../entity/piece-corner.entity';
import { MapPieceService } from './map-piece.service';
import { CreateMapForPieceDto } from './dto/create-map-for-piece.dto';
import { MapService } from './map.service';
import { MapPiece } from '../entity/map-piece.entity';

@Controller('map')
export class MapController {
    constructor(private service: MapService, private pieceService: MapPieceService) {
    }

    @Post('create-missing-maps')
    async createMissingMaps() {
        var all = await this.pieceService.find();
        var maps:CorridorMap[] = [];
        for(var i in all){
            var piece = all[i];
            var map = await this.createMapWithInitialPiece(piece);
            maps.push(map);
        }
        return maps;
    }

    @Post('create-map-for-piece')
    async createMapForPiece(@Body() input: CreateMapForPieceDto) {
        var piece = await this.pieceService.findOne(input.pieceId);
        return this.createMapWithInitialPiece(piece);
    }

    @Post('process-biggest-maps')
    async processBiggestMaps() {
        
    }

    async createMapWithInitialPiece(piece: MapPiece) {
        var map: CorridorMap;
        if (piece.map) {
            map = piece.map;
        } else {
            map = await this.service.createOne({
            });
        }
        await this.createNeighbours(map, [piece?.x ?? 0, piece?.y ?? 0], []);
        map = await this.service.findOne(map.id);
        map.totalPieces = map.pieces.length;
        this.service.save(map);
        return map;
    }

    @Get('get-map')
    async getMap(@Query('id') mapId: number) {
        let maps = await this.service.find({
            relations:['pieces'],
            order:{
                totalPieces:'DESC'
            },
            skip:mapId,
            take:1
        });
        return maps[0];
    }

    @Get('reprocess-map')
    async reprocessMap(@Query('id') mapId:number){
        let maps = await this.service.find({
            relations:['pieces'],
            order:{
                totalPieces:'DESC'
            },
            skip:mapId,
            take:1
        });
        let map = maps[0];
        let centralPiece = await map.pieces.find((p)=>p.x == 0 && p.y == 0);
        await this.pieceService.addNeighbours(map, centralPiece, []);
        return await this.service.findOne(map.id);
    }

    @Post('update-counts')
    async updateCounts(){
        await this.service.updatePieceCounts();
        return await this.service.find({
            order:{
                totalPieces:'DESC'
            },
            loadEagerRelations:false,
        });
    }

    async createNeighbours(map: CorridorMap, [x, y]: number[], testedSlots: string[]) {
        for (var i = 0; i <= 5; i++) {
            var coordinate = this.getCoordinate([x, y], i);
            var coordinateId = coordinate.join('_');
            if (testedSlots.indexOf(coordinateId) < 0) {
                testedSlots.push(coordinateId);
                await this.addPiece(map, coordinate, testedSlots);
            }
        }
    }

    getCoordinate([x, y]: number[], direction: number): number[] {
        switch (direction) {
            case 0: return [x + 1, y - 1];
            case 1: return [x + 1, y + 1];
            case 2: return [x, y + 2];
            case 3: return [x - 1, y + 1];
            case 4: return [x - 1, y - 1];
            case 5: return [x, y - 2];
        }
    }

    async addPiece(map: CorridorMap, [x, y]: number[], testedSlots: string[]) {
        var piece = await this.pieceService.findOne({ map: map, x: x, y: y });
        if (!piece) {
            var requirements = await this.findSideRequirements(map, [x, y]);
            if (requirements.length > 0) {
                var candidates = new Map<string, number>();
                for (var i in requirements) {
                    var corners = await getRepository(PieceCorner)
                        .find({
                            where: requirements[i],
                            relations: ['piece']
                        });
                    for (var j in corners) {
                        var identifier = corners[j]?.piece?.identifier;
                        if(!identifier) console.log(corners[j]);
                        candidates[identifier] = candidates[identifier] ?? 0;
                        candidates[identifier]++;
                    }
                }
                var pieceId;
                for (var i in candidates) {
                    if (candidates[i] == requirements.length) {
                        pieceId = i;
                    }
                }
                var piece = await this.pieceService.findOne({ identifier: pieceId });
                if (piece) {
                    piece.x = x;
                    piece.y = y;
                    piece.map = map;
                }
            }
        }
        if (piece) {
            await this.createNeighbours(map, [piece.x, piece.y], testedSlots);
        }
    }

    async findSideRequirements(map: CorridorMap, center: number[]) {
        var requirements: DeepPartial<PieceCorner>[] = [];
        for (var i = 0; i <= 5; i++) {
            var [x, y] = this.getCoordinate(center, i);
            var piece = await this.pieceService.findOne({
                map: map,
                x: x,
                y: y
            }, {
                relations: ['piece']
            });
            var order = (i + 3) % 6;
            var corner = piece?.corners?.find((corner) => corner.order == order);
            if (corner && corner.code.toUpperCase() != 'BBBBBBB') {
                requirements.push({
                    code: corner.code,
                    order: i
                });
            }
        }
        return requirements;
    }
}
