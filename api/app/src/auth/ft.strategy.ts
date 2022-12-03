import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { faker } from '@faker-js/faker';
import { Users } from '../entities/Users';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    config: ConfigService,
  ) {
    super({
      clientID: config.get('AID'),
      clientSecret: config.get('APW'),
      callbackURL: config.get('URL'),
    });
  }

  async validate(accessToken, refreshToken, profile, cb) {
    const act: string = this.authService.makeAccess(profile.username);
    console.log(accessToken);
    let ref: string;
    let isNewbie = false;
    const user: Users = await this.userService
      .findByIntra(profile.username)
      .then(async (success): Promise<Users> => {
        if (!success) {
          isNewbie = true;
          return await this.userService
            .create({
              intra: profile.username,
              nickname: faker.name.firstName() + '_' + profile.username,
              level: 0,
            })
            .then((success) => {
              console.log(`created ${success.intra}`);
              return success;
            });
        }
        return success;
      });

    if (isNewbie) ref = this.authService.makeRefresh(profile.username);
    else {
      await this.authService
        .findOneById(user.id)
        .then((success) => {
          console.log(`update ${user.intra}'s access token`);
          ref = success.res;
        })
        .catch(() => {
          console.log(`revoke ${user.intra}'s access token`);
          ref = this.authService.makeRefresh(user.intra);
        });
    }
    await this.authService.register(user.id, act, ref);
    cb(null, { ac: act, re: ref });
  }
}
