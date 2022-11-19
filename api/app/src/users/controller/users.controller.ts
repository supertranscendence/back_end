import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('api/users')
export class UsersController {

    constructor (
        private users : UsersService
    ) {}


    @Get()
    getJoin() {
        // return [1, 2, 3];
        return this.users.findJoin();
    }

    // @Get()
    // getAll() {
    //     // return [1, 2, 3];
    //     return this.users.findAll();
    // }


    // @Get(':id')
    // getOne(@Param('id') tid : number) {
    //     return this.users.findOne(tid);
    // }

    // @Get('')
    // getJoin(@Param('id') tid : number) {
    //     return this.users.findJoin(tid);
    // }

    @Post()
    create(@Body() body: any) {
        // return body;
        return this.users.create(body);
    }

    // @Put(':id')
    // update(@Param('id') tid:number, @Body() body: any) {
    //     // return body;
    //     return this.users.update(tid, body);
    // }

    @Delete(':id')
    delete(@Param('id') tid : number) {
        // return true;
        return this.users.delete(tid);
    }

}
