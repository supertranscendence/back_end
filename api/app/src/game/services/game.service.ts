import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../entities/Game';
import { GameRepository } from '../repository/game.repository';

@Injectable()
export class GameService {
    constructor(
        
        // @InjectRepository(Game)
        // private gameRepository: Repository<Game>,
        private gameRepository: GameRepository
    ) {}

    findAll() {
        return this.gameRepository.find();
    }

    // findOne(id : number) {
    //     return this.gameRepository.findOne(id);
    // }
    async findOne(id: number): Promise<Game> {
        return await this.gameRepository.getId(new Game);
    }

    create(body: any) {
        const newTest = this.gameRepository.create(body);
        return this.gameRepository.save(newTest);
    }

    async update(id: number, body: any) {
        const test = await this.gameRepository.getId(new Game);
        this.gameRepository.merge(test, body);
        return this.gameRepository.save(test);
    }

    async delete(id: number) {
        await this.gameRepository.delete(id);
        return true;
    }
}
