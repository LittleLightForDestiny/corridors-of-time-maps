import { Injectable, NestMiddleware, HttpException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { UserMembershipData } from 'bungie-api-ts/user/index';
import { PlayerService } from './player/player.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class BungieAuthMiddleware implements NestMiddleware {
  constructor(private playerService: PlayerService, private readonly configService: ConfigService) {
  }
  async use(req: Request, res: any, next: () => void) {
    var token = req.headers['authorization'];
    var membershipId;
    var name;
    if (token) {
      try {
        var response = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/`,
          {
            headers: {
              'X-API-Key': this.configService.get('BUNGIE_API_KEY'),
              'Authorization': token
            }
          }
        );
        var data: UserMembershipData = response.data?.Response;
        membershipId = data.bungieNetUser.membershipId;
        name = data.bungieNetUser.displayName;
      } catch (e) {
        throw new HttpException('Login Failed.', 401);
      }
      var player = await this.playerService.findOne({ membershipId: membershipId });
      if (!player) {
        player = this.playerService.create({
          membershipId: membershipId,
          name: name
        });
      }
      if (player.blocked) {
        throw new HttpException('User blocked.', 403);
      }
      res.locals.authUser = player;
      next();
    }

  }
}