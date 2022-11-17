import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// import { Repository } from 'typeorm';
// import { Achievements } from '../../entities/Achievements';
import { AchievementsRepository } from '../repository/achievements.repository';

@Injectable()
export class AchievementsService {
    constructor(
        // @InjectRepository(Achievements)
        // private achieveRepository: Repository<Achievements>,
        private achieveRepository: AchievementsRepository
    ) {}

    findAll() {
        return this.achieveRepository.find();
    }


    // findOne(id : number) {
    //     return this.achieveRepository.findOne(id);
    // }

    create(body: any) {
        const newTest = this.achieveRepository.create(body);
        return this.achieveRepository.save(newTest);
    }

    // async update(id: number, body: any) {
    //     const test = await this.achieveRepository.findOne(id);
    //     this.achieveRepository.merge(test, body);
    //     return this.achieveRepository.save(test);
    // }

    async delete(id: number) {
        await this.achieveRepository.delete(id);
        return true;
    }
}
