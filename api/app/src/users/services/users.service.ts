import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { stringify } from 'querystring';


import { getManager, Repository, SelectQueryBuilder } from 'typeorm';
import { Users } from '../../entities/Users';
import { FriendsRepository } from '../../friends/repository/friends.repository';
import { UsersRepository } from '../repository/users.repository';


@Injectable()
export class UsersService {
    constructor(
        // @InjectRepository(Users)
        // private usersRepository : Repository<Users>,
        private usersRepository : UsersRepository,
        private friendsRepository : FriendsRepository
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

    async findByIntra(intra: string): Promise<Users> {
        return await this.usersRepository.findOneBy({intra: intra});
    }

    public async findFriend(intra: string): Promise<Users> {

        const id =  await (await this.usersRepository.findOneBy({intra: intra})).id;
        const member = await this.usersRepository.createQueryBuilder('m')
        .leftJoinAndSelect('m.friends', 't')
        .where('m.id = :id', { id: id })
        .getOne();
        return member;
    }

    // public async register(intra: string): Promise<Users> {
    //     // First check if account exist
    //     const account = await this.usersRepository.createQueryBuilder()
    //     .whereInIds(intra).getOne();

    //     return account;

    //     if (isNil(account)) {
    //         const accountToSave = this.accountRepository.create({
    //             name: dto.accountName,
    //         });
    //         accountToSaveWithUser = await this.accountRepository.save(accountToSave);
    //     } else {
    //         accountToSaveWithUser = account;
    //     }

    //     await this.friendsRepository.save({
            
    //         email: dto.email,
    //         password: hash(dto.password), // Use your package for hash password
    //         name: accountToSaveWithUser.name,
    //     });
    // }


    // async findJoin() {
    //     const entityManager = getManager();
    //
    //     let data = await entityManager
    //     .getRepository(Users)
    //     // .createQueryBuilder("friends")
    //     .createQueryBuilder("achie") // table에 대한 별칭
    //     .leftJoinAndSelect("achie.friends", "new_alias") // " table에 대한 별칭에서 . friends라는 colum을 찾아서 이건 (user.ts의 friends 변수 Friends의 ManyToOne), 새 alias"
    //     .getMany();
    //
    //     // leftJoinAndSelect(subQueryFactory: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>, alias: string, condition?: string, parameters?: ObjectLiteral): this;
    //
    //     // const data = this.usersRepository.find({
    //     //     join: {
    //     //         alias: "friends",
    //     //         leftJoinAndSelect: {
    //     //             friends: "friends.friends",
    //     //             abc : "friends.intra"
    //     //         }
    //     //     }
    //     // });
    //
    //     // console.log(data);
    //     return (data);
    // }

    create(body: any) {
        //const newTest = this.usersRepository.create(body);
        const user = new Users();
        user.intra = body.intra;
        user.nickname = body.nickname;
        user.avatar = body.avatar;
        user.level = body.level;
        console.log(body);
        console.log(user);
        return this.usersRepository.save(user);
    }

    async update(id: number, body: any) {
        // const test = await this.usersRepository.findOne(id);
        const test = await this.usersRepository.getById(id);
        this.usersRepository.merge(test, body);
        console.log(body);
        return this.usersRepository.save(test);
    }

    async delete(id: number) {
        await this.usersRepository.delete(id);
        return true;
    }
}
