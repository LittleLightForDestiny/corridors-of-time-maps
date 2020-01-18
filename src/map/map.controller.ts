import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DeepPartial, getRepository } from 'typeorm';
import { CorridorMap } from '../entity/corridor-map.entity';
import { PieceCorner } from '../entity/piece-corner.entity';
import { MapPieceService } from '../map-piece/map-piece.service';
import { MapSlotService } from '../map-slot/map-slot.service';
import { CreateMapForPieceDto } from './dto/create-map-for-piece.dto';
import { MapService } from './map.service';
import { MapPiece } from '../entity/map-piece.entity';

@Controller('map')
export class MapController {
    constructor(private service: MapService, private slotService: MapSlotService, private pieceService: MapPieceService) {
    }

    @Post('create-missing-maps')
    async createMissingMaps() {
        var all = await this.pieceService.find();
        var maps:CorridorMap[] = [];
        for(var i in all){
            var piece = all[i];
            var slot = await this.slotService.findOne({piece:piece});
            if(!slot){
                var map = await this.createMapWithInitialPiece(piece);
                maps.push(map);
            }
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
        var mapSlot = await this.slotService.findOne({
            piece: piece
        }, {
            relations: ['map']
        });
        var map: CorridorMap;
        if (mapSlot) {
            map = mapSlot.map;
        } else {
            map = await this.service.createOne({
                slots: [
                    {
                        piece: piece,
                    }
                ]
            });
        }
        await this.createNeighbours(map, [mapSlot?.x ?? 0, mapSlot?.y ?? 0], []);
        map = await this.service.findOne(map.id);
        map.totalPieces = map.slots.length;
        this.service.save(map);
        return map;
    }

    @Get('get-map')
    async getMap(@Query('id') mapId: number) {
        return this.service.findOne({
            order:{
                totalPieces:'DESC'
            }
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
        var slot = await this.slotService.findOne({ map: map, x: x, y: y });
        if (!slot) {
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
                    slot = await this.slotService.createOne({
                        x: x,
                        y: y,
                        map: map,
                        piece: piece,
                    });
                }
            }
        }
        if (slot) {
            await this.createNeighbours(map, [slot.x, slot.y], testedSlots);
        }
    }

    async findSideRequirements(map: CorridorMap, center: number[]) {
        var requirements: DeepPartial<PieceCorner>[] = [];
        for (var i = 0; i <= 5; i++) {
            var [x, y] = this.getCoordinate(center, i);
            var slot = await this.slotService.findOne({
                map: map,
                x: x,
                y: y
            }, {
                relations: ['piece']
            });
            var piece = slot?.piece;
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
