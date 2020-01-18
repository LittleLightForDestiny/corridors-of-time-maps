import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapSlot } from 'src/entity/map-slot.entity';
import { Repository, DeepPartial, FindOneOptions } from 'typeorm';

@Injectable()
export class MapSlotService {
    constructor(@InjectRepository(MapSlot) private repo: Repository<MapSlot>) {
    }
    get findOne():Repository<MapSlot>['findOne'] {
        return this.repo.findOne.bind(this.repo);
    }

    get findAndCount():Repository<MapSlot>['findAndCount'] {
        return this.repo.findAndCount.bind(this.repo);
    }
    async createOne(input:DeepPartial<MapSlot>) {
        var slot = this.repo.create(input);
        await this.repo.save(slot);
        return slot;
    }
    
}
