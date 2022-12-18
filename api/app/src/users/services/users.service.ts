import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Users } from '../../entities/Users';
import { FriendsRepository } from '../../friends/repository/friends.repository';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    // @InjectRepository(Users)
    // private usersRepository : Repository<Users>,
    private usersRepository: UsersRepository,
    private friendsRepository: FriendsRepository,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  // findOne(id : number) {
  //     return this.usersRepository.findOne(id);
  // }
  async findOne(id: number): Promise<Users> {
    return await this.usersRepository.getId(new Users());
  }

  async findByIntra(intra: string): Promise<Users> {
    return await this.usersRepository.findOneBy({ intra: intra });
  }

  public async findFriend(intra: string): Promise<Users> {
    const id = (await this.usersRepository.findOneBy({ intra: intra })).id;
    return await this.usersRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.friends', 't')
      .where('m.id = :id', { id: id })
      .getOne();
  }

  public async editNick(intra: string, fixNick: string): Promise<Users> {
    const IsNick = await this.usersRepository.findOneBy({ nickname: fixNick });
    if (IsNick != null) {
      return IsNick;
    }
    const entity = await this.usersRepository.findOneBy({ intra: intra });
    const newUser = new Users();
    newUser.id = entity.id;
    newUser.intra = entity.intra;
    newUser.nickname = fixNick;
    newUser.avatar = entity.avatar;
    newUser.level = entity.level;

    const newEntity = {
      ...entity,
      ...newUser,
    };
    await this.usersRepository.save(newEntity);
    return newUser;
  }

  public async addmyfriend(intra: string, addFriend: string): Promise<void> {
    // let accountToSaveWithUser: Account;
    // First check if account exist

    // 있는지 확인하고, 없으면 추가, 있으면 무시하기
    const myid = (await this.usersRepository.findOneBy({ intra: intra })).id;
    // const add =  await (await this.usersRepository.findOneBy({intra: addFriend}));

    const member = await this.friendsRepository
      .createQueryBuilder('m')
      .where('m.id = :id AND m.friend = :friend', {
        id: myid,
        friend: addFriend,
      })
      .getMany();
    if (member.length == 0) {
      // const user = this.friendsRepository.create({});
      // *** 여기 부분이에오*** //
      await this.friendsRepository.save({
        id: myid,
        // userid : myid,
        intra: intra,
        friend: addFriend,
        block: false,
      });
      // const myPhoto = await this.usersRepository
      // .createQueryBuilder()
      // .insert()
      // .into(Friends)
      // .values({
      //     id :
      //     // user:{
      //     //     id: data.userId
      //     // }
      // })
      // .execute();
    }

    //     const account = await this.friendsRepository.findOneBy({intra: intra}).id
    //         where: {
    //             friend: dto.accountName,
    //         },
    //     });

    // if (isNil(account)) {
    //     const accountToSave = this.accountRepository.create({
    //         name: dto.accountName,
    //     });
    //     accountToSaveWithUser = await this.accountRepository.save(accountToSave);
    // } else {
    //     accountToSaveWithUser = account;
    // }

    // await this.userRepository.save({
    //     email: dto.email,
    //     password: hash(dto.password), // Use your package for hash password
    //     name: accountToSaveWithUser.name,
    // });
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

  async updateAvatarByIntra(intra: string, value: string) {
    await this.usersRepository
      .update({ intra: intra }, { avatar: value })
      .then((res) => {
        if (!res.affected) throw InternalServerErrorException;
        //this.logger.log(`${intra} avatar updated`);
      })
      .catch(/*this.logger.error(`${intra} avatar update failed`)*/);
  }

  async updateEmailByIntra(
    intra: string,
    value: { tf: boolean; email: string },
  ) {
    await this.usersRepository
      .update({ intra: intra }, value)
      .then((res) => {
        if (!res.affected) throw InternalServerErrorException;
        //this.logger.log(`${intra} avatar updated`);
      })
      .catch(/*this.logger.error(`${intra} avatar update failed`)*/);
  }

  async updateVerifyByIntra(intra: string, value: string) {
    await this.usersRepository
      .update({ intra: intra }, { verify: value })
      .then((res) => {
        if (!res.affected) throw InternalServerErrorException;
        //this.logger.log(`${intra} avatar updated`);
      })
      .catch(/*this.logger.error(`${intra} avatar update failed`)*/);
  }

  async delete(id: number) {
    await this.usersRepository.delete(id);
    return true;
  }
}
