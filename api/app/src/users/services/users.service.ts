import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AchievementsRepository } from '../../achievements/repository/achievements.repository';
import { Achievements } from '../../entities/Achievements';
import { Friends } from '../../entities/Friends';
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
    private achiev :AchievementsRepository,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }


  async update(name : string) {
    let a = (await this.usersRepository.findOneBy({ intra: name })).level;

    this.usersRepository.update({ intra : name}, {level :  a + 30});
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
  // 친구

  //비동기를 동기적으로 어떻게 처리를 해야되는 걸까?
  async chkBlock(myintra: string, friendIntra: string) : Promise<boolean> {
    let chk :boolean = false;
    await (await this.friendsRepository.findBy({intra: myintra})).forEach(element => {
      if (element.intra == myintra && element.friend == friendIntra && element.block === true) {
        chk = true;
      }
    });
      return chk;
  }
  ///////////////

  async ListBlock(myintra: string) : Promise<Friends[]>{
    // const id = (await this.usersRepository.findOneBy({ intra: myintra })).id;
    return await this.friendsRepository.findBy({ intra: myintra, block : true });
  }

  async IsBlock(myintra: string, friendIntra: string) : Promise<boolean>{
    // const id = (await this.usersRepository.findOneBy({ intra: myintra })).id;

    let friends = await this.friendsRepository.findBy({ intra: myintra });
    for (const f of friends) {
      if (f.intra == myintra && f.friend == friendIntra && f.block == true)
        return true;
    }
    return false;
  }

  async deleteBlock(myintra: string, friendIntra: string){
    const id = (await this.usersRepository.findOneBy({ intra: myintra })).id;
    this.friendsRepository
    .update({id: id, friend: friendIntra}, {block : false})    
  }

  async blockFriend(myintra: string, friendIntra: string){
    const id = (await this.usersRepository.findOneBy({ intra: myintra })).id;
    this.friendsRepository
    .update({id: id, friend: friendIntra}, {block : true})    
  }

  async BlockFriendsList(myintra: string) : Promise<Users[]>{
    return await this.usersRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.friends', 't')
      .where('m.intra = :intra', { intra: myintra })
      .getMany();
  }

  public async findFriend(intra: string): Promise<Friends[]> {
    // const id = (await this.usersRepository.findOneBy({ intra: intra })).id;
    
    return await this.friendsRepository.findBy({ intra: intra })

  }


  public async findUserFriend(intra: string): Promise<Users> {
    const id = (await this.usersRepository.findOneBy({ intra: intra })).id;
    return await this.usersRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.friends', 't')
      .where('m.id = :id', { id: id })
      .getOne();
    // return await this.friendsRepository.findBy({ intra: intra })

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
    const myid = (await this.usersRepository.findOneBy({ intra: intra })).id;
    const member = await this.friendsRepository
      .createQueryBuilder('m')
      .where('m.id = :id AND m.friend = :friend', {
        id: myid,
        friend: addFriend,
      })
      .getOne();
      if (member != null) {
        await this.friendsRepository.save({
          id: myid,
          intra: intra,
          friend: addFriend,
          block: false,
        });
      }

    // }
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

  async findOneByVerify(verify: string) {
    return await this.usersRepository.findOneBy({ verify: verify });
  }

  async delete(id: number) {
    await this.usersRepository.delete(id);
    return true;
  }

/////////////////////////////////////////////////////////

  //post
  public async addAchiev(intra: string, num : number): Promise<void> {
    const myid = (await this.usersRepository.findOneBy({ intra: intra })).id;
    const member = await this.achiev
      .createQueryBuilder('m')
      .where('m.id = :id ANDm.achievement = :achievement', {
        id :myid,
        achievement: num,
      })
      .getOne();

    if (member != null) {
      await this.achiev.save({
        id : myid,
        achievement : num,
      });
    }
  }

  // 다른 방법의 
  // const member = await this.achiev
  //     .createQueryBuilder('m')
  //     .where('m.id = :id AND m.achievement = :achievement', {
  //       id: myid,
  //       achievement: num,
  //     })
  //     .getOne();

  //     const newAchiev = new Achievements();
  //     newAchiev.userid = my;
  //     newAchiev.achievement = num;
  //     newAchiev.tid = myid;

  //   if (member == null) {
  //     await this.achiev.save(newAchiev);
  //   }
  



  //get
  // public async findAchiev(intra: string): Promise<Users> {
  //   const id = (await this.usersRepository.findOneBy({ intra: intra })).id;
  //   return await this.usersRepository
  //     .createQueryBuilder('m')
  //     .leftJoinAndSelect('m.achievement', 't')
  //     .where('m.id = :id', { id: id })
  //     .getOne();
  //   // return await this.friendsRepository.findBy({ intra: intra })

  // }


/////////////////////////////////////////////////////////

}
