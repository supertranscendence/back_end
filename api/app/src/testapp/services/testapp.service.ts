import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { testapp } from '../entities/testapp.entity';

@Injectable()
export class TestappService {

    // 위에서 repository를 모듈에 등록해뒀다면, 해당 Service provider에서 @InjectRepositoy를 통해 inject할 수 있게 됩니다. 주입!
    constructor(
        @InjectRepository(testapp)
        private testRepo: Repository<testapp>
    ) {}

    findAll() {
        return this.testRepo.find();
    }

    findOne(id: number) {
        return this.testRepo.findOne(id);
    }

    create(body: any) {
        // const newTest = new testapp();
        // newTest.name = body.name;
        const newTest = this.testRepo.create(body);
        return this.testRepo.save(newTest);
    }

    async update(id: number, body: any) {
        const test = await this.testRepo.findOne(id);
        // test.completed = true;
        this.testRepo.merge(test, body);
        return this.testRepo.save(test);
    }

    async delete(id: number) {
        await this.testRepo.delete(id);
        return true;
    }
}