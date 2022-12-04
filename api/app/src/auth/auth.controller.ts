import {
  Controller,
  Get,
  Res,
  HttpCode,
  UseGuards,
  Req,
  Header,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthGuardLocal } from './auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/auth')
export class AuthController {
  readonly frontend_url;
  readonly domain;

  constructor(private auth: AuthService, private config: ConfigService) {
    this.frontend_url = this.config.get('FRONTEND_URL');
    this.domain = this.config.get('DOMAIN');
  }

  @Get('/ft/redirect')
  @UseGuards(AuthGuard('42'))
  @HttpCode(302)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  async ftLoginCallback(@Req() req: Request, @Res() res) {
    console.log(req['user']);
    const date: Date = new Date();
    date.setDate(date.getTime() + 1000 * 10);
    res.cookie('accessToken', req['user']['ac'], {
      domain: this.domain,
      expire: date.toUTCString(),
      sameSite: 'Strict',
    });
    res.cookie('refreshToken', req['user']['re'], {
      domain: this.domain,
      expire: date.toUTCString(),
      sameSite: 'Strict',
    });
    console.log(this.frontend_url);
    res.redirect(this.frontend_url);
  }

  @UseGuards(AuthGuardLocal)
  @Get('/ft/refresh')
  ftLoginRefresh(@Req() req: Request) {
    return this.auth.refreshJWT(req);
  }

  @UseGuards(AuthGuardLocal)
  @Get('/ft/revoke')
  async ftLoginRevoke(@Req() req: Request, @Res() res) {
    await this.auth.revokeJWT(req);
    res.status(302).redirect(this.frontend_url);
  }
}
