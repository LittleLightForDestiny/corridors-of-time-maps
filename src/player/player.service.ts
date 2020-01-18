import { Injectable } from '@nestjs/common';
import { Player } from '../entity/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

@Injectable()
export class PlayerService {
    constructor(@InjectRepository(Player) private repo: Repository<Player>) {
    }

    get find(): Repository<Player>['find'] {
        return this.repo.find.bind(this.repo);
    }

    get findOne(): Repository<Player>['findOne'] {
        return this.repo.findOne.bind(this.repo);
    }

    create(entityLike:DeepPartial<Player>): Player {
        var player = this.repo.create(entityLike);
        this.repo.save(player);
        return player;
    }
}
