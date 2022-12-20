import {
  Controller,
  Get,
  Res,
  HttpCode,
  UseGuards,
  Req,
  Header,
  Logger,
  UseInterceptors,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthGuardLocal } from './auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorInterceptor } from './tfa.interceptor';
import { UsersService } from '../users/services/users.service';

@ApiBearerAuth()
@Controller('api/auth')
export class AuthController {
  readonly frontend_url;
  readonly domain;
  private readonly logger: Logger = new Logger();

  constructor(
    private auth: AuthService,
    private config: ConfigService,
    private user: UsersService,
  ) {
    this.frontend_url = this.config.get('FRONTEND_URL');
    this.domain = this.config.get('DOMAIN');
  }

  @Get('/ft/redirect')
  @UseGuards(AuthGuard('42'))
  @UseInterceptors(TwoFactorInterceptor)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  @HttpCode(302)
  async ftLoginCallback(@Req() req: Request, @Res() res) {
    this.logger.log(req['user']);
    const date: Date = new Date();
    date.setDate(date.getTime() + 1000 * 10);
    // res.header({
    //   'Access-Control-Allow-Origin': 'https://gilee.click',
    //   'Access-Control-Allow-Credentials': 'true',
    // });
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
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  @HttpCode(200)
  async ftLoginRefresh(@Req() req: Request) {
    return await this.auth.refreshJWT(req);
  }

  @UseGuards(AuthGuardLocal)
  @Get('/ft/revoke')
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  @HttpCode(200)
  async ftLoginRevoke(@Req() req: Request, @Res() res) {
    await this.auth.revokeJWT(req);
    res.status(302).redirect(this.frontend_url);
  }

  @Get('/ft/email')
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  ftSendCodeEmail(@Res() res) {
    res.status(302).redirect('https://gilee.click/logincheck');
  }

  @Get('/ft/verify_email')
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  async ftTakeCode(@Param('code') code: string, @Req() req, @Res() res) {
    if (await this.user.findOneByVerify(code))
      res.status(302).redirect('/api/auth/ft/redirect');
    else res.status(500);
  }
}
