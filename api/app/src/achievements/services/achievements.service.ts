import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievements } from '../../entities/Achievements';
import { Users } from '../../entities/Users';
import { UsersRepository } from '../../users/repository/users.repository';

// import { Repository } from 'typeorm';
// import { Achievements } from '../../entities/Achievements';
import { AchievementsRepository } from '../repository/achievements.repository';

@Injectable()
export class AchievementsService {
    constructor(
        // @InjectRepository(Achievements)
        // private achieveRepository: Repository<Achievements>,
        private usersRepository: UsersRepository,
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

    async findAchi(intra: string) : Promise<Achievements[]>{
        // let findName = intra + '|';
        const my = (await this.usersRepository.findOneBy({ intra: intra })).id;
        

    //     let a = this.usersRepository
    //   .createQueryBuilder('m')
    //   .leftJoinAndSelect('m.achievements', 't')
    //   .where('m.id = :id', { id: myid })
    //   .getMany();

    return this.achieveRepository.findBy({id : my})
        // user에서 join을 해서 achievement를 찾자
    }

    async delete(id: number) {
        await this.achieveRepository.delete(id);
        return true;
    }
}
