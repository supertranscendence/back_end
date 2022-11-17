import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsRepository } from '../repository/friends.repository';

// import { Repository } from 'typeorm';
// import { Friends } from '../../entities/Friends';

@Injectable()
export class FriendsService {
    constructor(
        // @InjectRepository(Friends)
        // private friendsRepository : Repository<Friends>,
        private friendsRepository: FriendsRepository
    ) {}

    findAll() {
        return this.friendsRepository.find();
    }


    // findOne(id : number) {
    //     return this.friendsRepository.findOne(id);
    // }

    create(body: any) {
        const newTest = this.friendsRepository.create(body);
        return this.friendsRepository.save(newTest);
    }

    // async update(id: number, body: any) {
    //     const test = await this.friendsRepository.findOne(id);
    //     this.friendsRepository.merge(test, body);
    //     return this.friendsRepository.save(test);
    // }

    async delete(id: number) {
        await this.friendsRepository.delete(id);
        return true;
    }
}
