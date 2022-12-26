import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuardLocal } from '../../auth/auth.guard';
import { AuthService } from '../../auth/auth.service';
import { AchievementsService } from '../services/achievements.service';

@UseGuards(AuthGuardLocal)
@Controller('api/achievements')
export class AchievementsController {

    constructor (
        private achievement : AchievementsService,
        private auth: AuthService
    ) {}

    // @Get()
    // getAll() {
    //     // return [1, 2, 3];
    //     return this.achievement.findAll();
    // }

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

    @Get('/:intra')
    @HttpCode(200)
    @Header('Access-Control-Allow-Origin', 'https://gilee.click')
    @Header('Access-Control-Allow-Credentials', 'true')
    findMyAchi(@Req() req: Request, @Param('intra') intra:string) // : Promise<Game[]>
    {
        // console.log('fdfads');
        // const name = this.auth.getIntra(this.auth.extractToken(req, 'http'));
        // console.log(name);

        // this.achievement.findAchi(intra).then((a) => {
        //     for (const [key, value] of Object.entries(a)) {
        //         return (value.achievements);
                // 이렇게 하면 받아오긴함
        //     }       
        // });
        return this.achievement.findAchi(intra);
    }



}
