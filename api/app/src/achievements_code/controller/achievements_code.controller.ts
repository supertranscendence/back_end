import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AchievementsCodeService } from '../services/achievements_code.service';

@Controller('achievements-code')
export class AchievementsCodeController {

    constructor (
        private achievement : AchievementsCodeService
    ) {}

    @Get()
    getAll() {
        // return [1, 2, 3];
        return this.achievement.findAll();
    }

    // @Get(':id')
    // getOne(@Param('id') tid : number) {
    //     return this.achievement.findOne(tid);
    // }

    @Post()
    create(@Body() body: any) {
        // return body;
        return this.achievement.create(body);
    }

    // @Put(':id')
    // update(@Param('id') tid:number, @Body() body: any) {
    //     // return body;
    //     return this.achievement.update(tid, body);
    // }

    @Delete(':id')
    delete(@Param('id') tid : number) {
        // return true;
        return this.achievement.delete(tid);
    }
}
