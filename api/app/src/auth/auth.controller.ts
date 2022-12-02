import {
    Controller,
    Get,
    Res, HttpCode, UseGuards, Req, Headers, Header, UseFilters
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from "@nestjs/passport";
import {ConfigService} from "@nestjs/config";
import {JWTExceptionFilter} from "../exception/jwt.filter";

@Controller('api/auth')
export class AuthController {
    readonly frontend_url;
    readonly domain;
    constructor (
        private auth : AuthService,
        private config: ConfigService
    ) {
        this.frontend_url = this.config.get('FRONTEND_URL');
        this.domain = this.config.get('DOMAIN');
    }
    @Get('/ft/redirect')
    @UseGuards(AuthGuard('42'))
    @HttpCode(302)
    @Header('Access-Control-Allow-Origin', 'https://gilee.click')
    @Header('Access-Control-Allow-Credentials', 'true')
    async ftLoginCallback(@Req() req, @Res() res){
        console.log(req.user);
        let date: Date = new Date();
        date.setDate(date.getTime() + 1000 * 10);
        res.cookie('accessToken', req.user.ac, {domain: this.domain, expire: date.toUTCString(), sameSite: 'Strict'});
        res.cookie('refreshToken', req.user.re, {domain: this.domain, expire: date.toUTCString(), sameSite: 'Strict'});
        //res.redirect(this.config.get(FRONTEND_URL + '/login');
        console.log(this.frontend_url);
        res.redirect(this.frontend_url);
    }

    @Get('/ft/refresh')
    ftLoginRefresh(){

    }
    @Get('/ft/revoke')
    ftLoginRevoke(){

    }
}
