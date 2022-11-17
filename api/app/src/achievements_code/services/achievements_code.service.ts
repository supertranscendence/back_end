import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { AchievementsCode } from '../../entities/AchievementsCode';
import { AchievementsCodeRepository } from '../repository/achievements_code.repository';

@Injectable()
export class AchievementsCodeService {

    constructor(
        // @InjectRepository(AchievementsCode)
        // private achievemtsCodeRepository : Repository<AchievementsCode>,
        private achievemtsCodeRepository: AchievementsCodeRepository
    ) {}

    findAll() {
        return this.achievemtsCodeRepository.find();
    }


    // findOne(id : number) {
    //     return this.achievemtsCodeRepository.findOne(id);
    // }

    create(body: any) {
        const newTest = this.achievemtsCodeRepository.create(body);
        return this.achievemtsCodeRepository.save(newTest);
    }

    // async update(id: number, body: any) {
    //     const test = await this.achievemtsCodeRepository.findOne(id);
    //     this.achievemtsCodeRepository.merge(test, body);
    //     return this.achievemtsCodeRepository.save(test);
    // }

    async delete(id: number) {
        await this.achievemtsCodeRepository.delete(id);
        return true;
    }
}
