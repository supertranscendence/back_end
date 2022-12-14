import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthGuardLocal } from '../../auth/auth.guard';
import { JWTExceptionFilter } from '../../exception/jwt.filter';
import { AuthService } from '../../auth/auth.service';

@UseGuards(AuthGuardLocal)
@SetMetadata('roles', ['admin'])
@Controller('api/users')
export class UsersController {
  constructor(private users: UsersService,
    private auth: AuthService) {}

  @Get()
  findOne() {
    return this.users.findAll();
  }

  // getJoin() {
  //     // return [1, 2, 3];
  //     return this.users.findJoin();
  // }

  @Get()
  getAll() {
    // return [1, 2, 3];
    return this.users.findAll();
  }

  //분리 ???
  @Get('/my')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  getOne(@Req() request : Request, @Param('id') tid : string) {
    const intra = this.auth.getIntra(this.auth.extractToken(request, 'http'));
    return this.users.findByIntra(intra);
  }

  @Get('/:id')
  @HttpCode(200)
  @Header('Access-Control-Allow-Origin', 'https://gilee.click')
  @Header('Access-Control-Allow-Credentials', 'true')
  getOther( @Param('id') tid : string) {
    // const intra = this.auth.getIntra(this.auth.extractToken(request, 'http'));
    return this.users.findByIntra(tid);
  }

  // @Get('')
  // getJoin(@Param('id') tid : number) {
  //     return this.users.findJoin(tid);
  // }

  @Post()
  create(@Body() body: any) {
    // return body;
    return this.users.create(body);
  }

  @Put(':id')
  update(@Param('id') tid: number, @Body() body: any) {
    // return body;
    return this.users.update(tid, body);
  }

  @Delete(':id')
  delete(@Param('id') tid: number) {
    // return true;
    return this.users.delete(tid);
  }
}
