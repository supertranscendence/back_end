import {Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards} from '@nestjs/common';
import { Game } from '../../entities/Game';
import { GameService } from '../services/game.service';
import {AuthGuardLocal} from "../../auth/auth.guard";
import {BaseController} from "../../base.controller";

@UseGuards(AuthGuardLocal)
@Controller('api/game')
export class GameController extends BaseController<Game>{

    constructor (
        private gameService : GameService // service 불러오기
    ) {super();}
    @Get()
    getAll() {
        // return [1, 2, 3];
        return this.gameService.findAll();
    }

    // @Get(':id')
    // getOne(@Param('id') id : number) {
    //     return this.gameService.findOne(id);
    // }


    @Get(':id')
    async getOne(@Req() req, @Param('id') id : number): Promise<Game>{
        //return Object.assign(await this.gameService.findOne(id) , {accessToken: req.auth});
        return this.keyAssignedData(await this.gameService.findOne(id) , req.auth);
    }

    @Post()
    create(@Body() body: any) {
        // return body;
        return this.gameService.create(body);
    }

    @Put(':id')
    update(@Param('id') id:number, @Body() body: any) {
        // return body;
        return this.gameService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id : number) {
        // return true;
        return this.gameService.delete(id);
    }

}
