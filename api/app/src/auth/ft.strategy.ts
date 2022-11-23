import { Strategy } from "passport-42";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/services/users.service";
import { faker } from '@faker-js/faker';
import { Users } from "../entities/Users";
import { AuthService } from "./auth.service";

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UsersService, private authService: AuthService) {
        super({
            clientID: process.env.AID,
            clientSecret: process.env.APW,
            callbackURL: process.env.URL
        });
    }

    async validate(accessToken, refreshToken, profile, cb) {
        const act: string = this.authService.makeAccess(profile.username);
        let ref: string;
        let isNewbie: boolean = false;
        const user: Users = await this.userService.findByIntra(profile.username).then(
            async (success):Promise<Users>=>{
                if (!success) {
                    isNewbie = true;
                    return await this.userService.create({
                        intra: profile.username,
                        nickname: faker.name.firstName() + '_' + profile.username,
                        level: 0
                    }).then((success)=>{console.log(`created ${success.intra}`); return success});
                }
                return success;
            });

        if (isNewbie)
            ref = this.authService.makeRefresh(profile.username);
        else {
            await this.authService.findOneById(user.id).then((success) => {
                console.log(`update ${user.intra}'s access token`);
                ref = success.res;
            });
        }
        await this.authService.register(user.id, act, ref);
        console.log({ac: act});
        cb(null, {ac: act, re: ref});
    }
}