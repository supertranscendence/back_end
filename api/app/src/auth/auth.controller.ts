import {
    Controller,
    Get,
    Res, HttpCode, UseGuards, Req, Headers, Header
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from "@nestjs/passport";

@Controller('api/auth')
export class AuthController {

    constructor (
        private auth : AuthService
    ) {}
    @Get('/ft/redirect')
    @UseGuards(AuthGuard('42'))
    @HttpCode(302)
    @Header('Access-Control-Allow-Origin', '*')
    @Header('Access-Control-Allow-Credentials', 'true')
    async ftLoginCallback(@Req() req, @Res() res){
        console.log(req.user);
        res.cookie('accessToken', req.user.ac, {maxAge: 10000, httpOnly: true, sameSite: 'None', secure: true});
        res.cookie('refreshToken', req.user.re, {maxAge: 10000, httpOnly: true, sameSite: 'None', secure: true});
        //res.redirect(process.env.FRONTEND_URL + '/login');
        console.log(process.env.FRONTEND_URL);
        res.redirect(process.env.FRONTEND_URL);
    }
}
