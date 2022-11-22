import { Strategy } from "passport-42";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import {UsersService} from "../users/services/users.service";
import { faker } from '@faker-js/faker';
import {Users} from "../entities/Users";
import {AuthService} from "./auth.service";

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
        // let user: Users = await this.userService.findByIntra(profile.username);
        // //console.log(user);
        // /////
        // if (!user) {
        //     await this.userService.create({
        //         intra: profile.username,
        //         nickname: faker.name.firstName() + '_' + profile.username,
        //         level: 0
        //     });
        //     user = await this.userService.findByIntra(profile.username);
        //     console.log(user);
        //     await this.authService.register(user.id, this.authService.makeAccess(profile.username), this.authService.makeRefresh(profile.username));
        // }
        // ////
        // const auth = await this.authService.findOneById(user.id);
        // auth.act = this.authService.makeAccess(profile.username);
        // await this.authService.register(user.id, auth.act, auth.res);
        // cb(null, {ac: auth.act, re: auth.res});
        cb(null, null);
    }
}