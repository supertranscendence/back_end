import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


import { getManager, Repository } from 'typeorm';
import { Users } from '../../entities/Users';
import { UsersRepository } from '../repository/users.repository';


@Injectable()
export class UsersService {
    constructor(
        // @InjectRepository(Users)
        // private usersRepository : Repository<Users>,
        private usersRepository : UsersRepository
    ) {}


    findAll() {
        return this.usersRepository.find();
    }


    // findOne(id : number) {
    //     return this.usersRepository.findOne(id);
    // }
    async findOne(id: number): Promise<Users> {
        return await this.usersRepository.getId(new Users);
    }


    async findJoin() {
        const entityManager = getManager();
        
        let data = await entityManager
        .getRepository(Users)
        // .createQueryBuilder("friends")
        .createQueryBuilder("achie") // table에 대한 별칭
        .leftJoinAndSelect("achie.friends", "new_alias") // " table에 대한 별칭에서 . friends라는 colum을 찾아서 이건 (user.ts의 friends 변수 Friends의 ManyToOne), 새 alias"
        .getMany();

        // leftJoinAndSelect(subQueryFactory: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>, alias: string, condition?: string, parameters?: ObjectLiteral): this;

        // const data = this.usersRepository.find({
        //     join: {
        //         alias: "friends",
        //         leftJoinAndSelect: {
        //             friends: "friends.friends",
        //             abc : "friends.intra"
        //         }
        //     }
        // });

        // console.log(data);
        return (data);
    }

    create(body: any) {
        //const newTest = this.usersRepository.create(body);
        const user = new Users();
        user.intra = body.intra;
        user.nickname = body.nickname;
        user.avatar = body.avatar;
        user.level = body.level;
        return this.usersRepository.save(user);
    }

    async update(id: number, body: any) {
        // const test = await this.usersRepository.findOne(id);
        const test = await this.usersRepository.getId(new Users);
        this.usersRepository.merge(test, body);
        return this.usersRepository.save(test);
    }

    async delete(id: number) {
        await this.usersRepository.delete(id);
        return true;
    }
}
