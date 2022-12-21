import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, In, Like, Repository } from 'typeorm';
import { threadId } from 'worker_threads';
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
    findOne(idx: number): Promise<Game> {
        const g = new Game();
        g.id = idx;
        return this.gameRepository.findOneBy(g);
    }

    async findbyname(intra: string) : Promise<Game[]>{
        let findName = intra + '|';
        return await this.gameRepository.findBy({
        player: Like(`${intra}|%`),
        })
    }

    create(names: string, score: string) {
        return this.gameRepository.save({
            player : names,
            score : score,
        });
    }

    update(names: string, score: string) {
        return this.gameRepository.save({
            player : names,
            score : score,
        });
    }

    // async update(id: number, body: any) {
    //     const test = await this.gameRepository.getId(new Game);
    //     this.gameRepository.merge(test, body);
    //     return this.gameRepository.save(test);
    // }

    // async delete(id: number) {
    //     await this.gameRepository.delete(id);
    //     return true;
    // }
}
