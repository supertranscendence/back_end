import {Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Put, Req, UseGuards} from '@nestjs/common';
import { Game } from '../../entities/Game';
import { GameService } from '../services/game.service';
import {AuthGuardLocal} from "../../auth/auth.guard";
import {BaseController} from "../../base.controller";
import { AuthService } from '../../auth/auth.service';

@UseGuards(AuthGuardLocal)
@Controller('/api/game')
export class GameController extends BaseController<Game>{

    constructor (
        private gameService : GameService, // service 불러오기
        private auth: AuthService
    ) {super();}
    // @Get()
    // @HttpCode(200)
    // // @Header('Access-Control-Allow-Origin', 'https://gilee.click')
    // // @Header('Access-Control-Allow-Credentials', 'true')
    // getAll() {
    //     console.log('fafdsdsa');
    //     return this.gameService.findAll();
    // }

    // @Get(':id')
    // getOne(@Param('id') id : number) {
    //     return this.gameService.findOne(id);
    // }

///

// --김이 들어가는 시작하는 사원 조회
// SELECT * FROM My_Talbe WHERE Nm_Kor LIKE '%김%'

    @Get('/:intra')
    @HttpCode(200)
    @Header('Access-Control-Allow-Origin', 'https://gilee.click')
    @Header('Access-Control-Allow-Credentials', 'true')
    findMyData(@Req() req: Request, @Param('intra') intra : string) // : Promise<Game[]>
    {
        // console.log('fdfads');
        const name = this.auth.getIntra(this.auth.extractToken(req, 'http'));
        console.log(name);

        return this.gameService.findbyname(name);
    }

///

    // @Get(':id')
    // async getOne(@Req() req, @Param('id') id : number): Promise<Game>{
    //     //return Object.assign(await this.gameService.findOne(id) , {accessToken: req.auth});
    //     return this.keyAssignedData(await this.gameService.findOne(id) , req.auth);
    // }


    // @Post()
    // create(@Body() body: any) {
    //     // return body;
    //     return this.gameService.create(body);
    // }

    // @Put(':id')
    // update(@Param('id') id:number, @Body() body: any) {
    //     // return body;
    //     return this.gameService.update(id, body);
    // }

    // @Delete(':id')
    // delete(@Param('id') id : number) {
    //     // return true;
    //     return this.gameService.delete(id);
    // }

}
