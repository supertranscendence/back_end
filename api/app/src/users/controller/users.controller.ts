import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthGuardLocal } from '../../auth/auth.guard';
import { JWTExceptionFilter } from '../../exception/jwt.filter';

@UseGuards(AuthGuardLocal)
@SetMetadata('roles', ['admin'])
@Controller('api/users')
export class UsersController {
  constructor(private users: UsersService) {}

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

  @Get(':id')
  getOne(@Param('id') tid : string) {
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
