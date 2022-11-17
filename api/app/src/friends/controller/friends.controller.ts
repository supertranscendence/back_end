import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { FriendsService } from '../services/friends.service';

@Controller('friends')
export class FriendsController {

    constructor (
        private friends : FriendsService
    ) {}

    @Get()
    getAll() {
        // return [1, 2, 3];
        return this.friends.findAll();
    }

    // @Get(':id')
    // getOne(@Param('id') tid : number) {
    //     return this.friends.findOne(tid);
    // }

    @Post()
    create(@Body() body: any) {
        // return body;
        return this.friends.create(body);
    }

    // @Put(':id')
    // update(@Param('id') tid:number, @Body() body: any) {
    //     // return body;
    //     return this.friends.update(tid, body);
    // }

    @Delete(':id')
    delete(@Param('id') tid : number) {
        // return true;
        return this.friends.delete(tid);
    }

}
