import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TestappService } from '../services/testapp.service';

@Controller('api/testapp')
export class TestappController {
    
    constructor (
        private testappService : TestappService // service 불러오기
    ) {}

    @Get()
    getAll() {
        // return [1, 2, 3];
        return this.testappService.findAll();
    }

    @Get(':id')
    getOne(@Param('id') id: number){
        // return id;
        return this.testappService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        // return body;
        return this.testappService.create(body);
    }

    @Put(':id')
    update(@Param('id') id:number, @Body() body: any) {
        // return body;
        return this.testappService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id : number) {
        // return true;
        return this.testappService.delete(id);
    }
}
