import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CorridorMap } from '../entity/corridor-map.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

@Injectable()
export class MapService{
    constructor(@InjectRepository(CorridorMap) private repo:Repository<CorridorMap>){
    }

    async createOne(data:DeepPartial<CorridorMap>){
        var map = this.repo.create(data);
        await this.save(map);
        return map;
    }

    save(map:CorridorMap){
        return this.repo.save(map);
    }

    get findOne():Repository<CorridorMap>['findOne'] {
        return this.repo.findOne.bind(this.repo);
    }

    get find():Repository<CorridorMap>['find'] {
        return this.repo.find.bind(this.repo);
    }
}
