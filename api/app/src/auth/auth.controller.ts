import {
    Controller,
    Get,
    Res, HttpCode, UseGuards, Req, Headers, Header
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from "@nestjs/passport";
import {ConfigService} from "@nestjs/config";

@Controller('api/auth')
export class AuthController {

    constructor (
        private auth : AuthService,
        private config: ConfigService
    ) {}
    @Get('/ft/redirect')
    @UseGuards(AuthGuard('42'))
    @HttpCode(302)
    @Header('Access-Control-Allow-Origin', '*')
    @Header('Access-Control-Allow-Credentials', 'true')
    async ftLoginCallback(@Req() req, @Res() res){
        console.log(req.user);
        let date: Date = new Date();
        date.setDate(date.getTime() + 1000 * 10);
        res.cookie('accessToken', req.user.ac, {domain: this.config.get('DOMAIN'), expire: date.toUTCString(), sameSite: 'Strict'});
        res.cookie('refreshToken', req.user.re, {domain: this.config.get('DOMAIN'), expire: date.toUTCString(), sameSite: 'Strict'});
        //res.redirect(this.config.get(FRONTEND_URL + '/login');
        console.log(this.config.get('FRONTEND_URL'));
        res.redirect(this.config.get('FRONTEND_URL'));
    }
}
