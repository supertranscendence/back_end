import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  LoggerService,
  Param,
  Post,
  Put,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthGuardLocal } from '../../auth/auth.guard';
import { JWTExceptionFilter } from '../../exception/jwt.filter';
import { AuthService } from '../../auth/auth.service';
import { add } from 'winston';

@UseGuards(AuthGuardLocal)
@SetMetadata('roles', ['admin'])
@Controller('api/users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private users: UsersService, private auth: AuthService) {
    this.logger = new Logger();
  }

  @Get('/my')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  getOne(@Req() request: Request, @Param('id') tid: string) {
    const intra = this.auth.getIntra(this.auth.extractToken(request, 'http'));
    // + achievement;
    return this.users.findByIntra(intra);
  }

  @Get('/my/friends')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  findFriend(@Req() request: Request) {
    const intra = this.auth.getIntra(this.auth.extractToken(request, 'http'));
    console.log(intra);
    return this.users.findUserFriend(intra);
  }

  @Post()
  @HttpCode(201)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  IsFriend(@Body('intra') addIntra: string, @Req() request: Request): string {
    const intra = this.auth.getIntra(this.auth.extractToken(request, 'http'));
    // return this.users.findByIntra(intra);
    this.users.addmyfriend(intra, addIntra);
    return addIntra;
  }

  @Post('email')
  @HttpCode(204)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  setEmail(@Body() body: { tf: boolean; email: string }, @Req() req: Request) {
    const intra = this.auth.getIntra(this.auth.extractToken(req));
    return this.users.updateEmailByIntra(intra, body);
  }

  @Put()
  @HttpCode(201)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  editMyNick(
    @Body('nick') editNick: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const intra = this.auth.getIntra(this.auth.extractToken(req, 'http'));
    return this.users.editNick(intra, editNick);
  }

  @Put('/avatar')
  @HttpCode(204)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  editMyAvatar(
    @Body('avatar') avatar: string,
    @Req()
    req: Request,
  ) {
    const intra = this.auth.getIntra(this.auth.extractToken(req, 'http'));
    return this.users.updateAvatarByIntra(intra, avatar);
  }

  @Get('/avatar')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  getMyAvatar(
    @Req()
    req: Request,
  ) {
    const intra = this.auth.getIntra(this.auth.extractToken(req, 'http'));
    return this.users
      .findByIntra(intra)
      .then((res) => res.avatar)
      .catch((err) => {
        this.logger.error(err.message);
        this.logger.debug(err);
        return 'default';
      });
  }

  @Get('/:id')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  getOther(@Param('id') tid: string) {
    // const intra = this.auth.getIntra(this.auth.extractToken(request, 'http'));
    
    return this.users.findByIntra(tid);
  }

  @Post('/achievement')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  addAchi(@Req() req: Request, @Body('achi') achi: number) {
    const intra = this.auth.getIntra(this.auth.extractToken(req, 'http'));
    this.users.addAchiev(intra, achi)
  }

}