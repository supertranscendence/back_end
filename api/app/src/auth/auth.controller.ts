import {
    Controller,
    Get,
    Res, HttpCode, UseGuards, Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from "@nestjs/passport";

@Controller('api/auth')
export class AuthController {

    constructor (
        private auth : AuthService
    ) {}
    @Get('/ft/redirect')
    @HttpCode(200)
    @UseGuards(AuthGuard('42'))
    async ftLoginCallback(@Req() req, @Res() res){
        return res.send(req.user);
    }
}
