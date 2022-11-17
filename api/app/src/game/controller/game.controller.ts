import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Game } from '../../entities/Game';
import { GameService } from '../services/game.service';


@Controller('api/game')
export class GameController {
    
    constructor (
        private gameService : GameService // service 불러오기
    ) {}
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
    getOne(@Param('id') id : number): Promise<Game>{
        return this.gameService.findOne(id);
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
