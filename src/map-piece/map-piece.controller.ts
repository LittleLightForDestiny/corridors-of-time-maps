import * as CsvParser from '@fast-csv/parse';
import { Controller, Post, Res, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Player } from 'src/entity/player.entity';
import { MapPieceService } from './map-piece.service';
import { CreateMapPieceDto } from './dto/create-map-piece.dto';


@Controller('map-piece')
export class MapPieceController {
    constructor(public service: MapPieceService) {
    }


    @Post('/create')
    async create(
        @Res() res: any,
        @Body() body: CreateMapPieceDto
    ) {
        var player: Player = res.locals.authUser;

        
        var piece = await this.service.updateOrNew({
            center: body.center,
            walls: body.walls,
            evidenceUrl: body.evidenceUrl,
            sides: body.sides,
            membershipId: player.membershipId
        });

        res.send({
            "status": "success",
            "data": piece
        });
    }

    @UseInterceptors(FileInterceptor('file'))
    @Post('/import')
    createManyFromCSV(
        @Res() res: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        var player: Player = res.locals.authUser;
        var csv = file.buffer.toString();
        CsvParser
            .parseString(csv, {
                headers: true,
                ignoreEmpty: true,
            })
            .on('error', error => console.error(error))
            .on('data', async row => {
                const center = this.parseCenter(row.Center);
                const walls = this.parseWalls(row['Sides Open']);
                const evidence_url = row.URL;
                const sides = [
                    String(row['Side 1'])?.toUpperCase(),
                    String(row['Side 2'])?.toUpperCase(),
                    String(row['Side 3'])?.toUpperCase(),
                    String(row['Side 4'])?.toUpperCase(),
                    String(row['Side 5'])?.toUpperCase(),
                    String(row['Side 6'])?.toUpperCase(),
                ].filter((s) => s.length != 6);
                if (!center || sides.length != 6 || !walls) {
                    console.log(center, sides.length, walls);
                    return;
                }
                await this.service.updateOrNew({
                    center: center,
                    walls: walls,
                    evidenceUrl: evidence_url,
                    sides: sides,
                    membershipId: player.membershipId
                });
            })
            .on('end', rowCount => {
                console.log(`Parsed ${rowCount} rows`);
                res.send({
                    "status": "success",
                    "total": rowCount
                });
            });
    }

    parseWalls(open: String): string {
        const walls = [open.indexOf('1') < 0, open.indexOf('2') < 0, open.indexOf('3') < 0, open.indexOf('4') < 0, open.indexOf('5') < 0, open.indexOf('6') < 0,];
        const result = (walls.map((a) => a ? 1 : 0).join(""));
        return result;
    }

    parseCenter(value: String): string {
        switch (value.toLowerCase().trim()) {
            case "blank":
            case "b":
            case "none":
                return "B";

            case "hex":
            case "hexagon":
            case "h":
                return "H";

            case "snake":
            case "sneak":
            case "s":
                return "S";

            case "clover":
                return "C";

            case "plus":
            case "pluss":
                return "P";

            case "diamond":
            case "d":
                return "D";

            case "cauldron":
            case "T":
                return "T";
        }
        console.log(value);
        return null;
    }
}
