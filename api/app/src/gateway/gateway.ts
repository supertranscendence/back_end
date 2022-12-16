import {
  Inject,
  LoggerService,
  Logger,
  OnModuleInit,
  UseFilters,
  UseGuards,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthGuardLocal } from '../auth/auth.guard';
import { UsersService } from '../users/services/users.service';
import { JWTExceptionFilter } from '../exception/jwt.filter';
import { RoomService } from './room.service';
import { SUserService } from './socketUser.service';
import { IChatRoom, IUser, UserStatus } from '../types/types';
import { IsUppercase } from 'class-validator';
import { map, throwIfEmpty } from 'rxjs';
import { LoggingInterceptor } from '../logger.Interceptor';
import { AuthService } from '../auth/auth.service';
import { SGameService } from './sgame.service';
import { GameroomService } from './gameroom.service';

@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuardLocal)
@UseFilters(JWTExceptionFilter)
@WebSocketGateway({
  namespace: 'api/socket',
})
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private room: RoomService,
    private user: SUserService,
    private game: SGameService,
    private auth: AuthService,
    private gameroom: GameroomService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  @WebSocketServer()
  server: Server;

  //  socket 객체는 개별 클라이언트와의 interacting을 위한 기본적인 객체
  handleConnection(client: any) {
    const intra = this.auth.getIntra(this.auth.extractToken(client, 'ws'));
    // console.log(intra);
    // console.log(this.room.getIntraAtToken(client));
    const client_id = client.id;
    const avatar = 'avatar_copy';
    const nickname = intra;
    const status: UserStatus = 1; // 상태로 추가하면 오류!
    this.logger.log(
      `Function Name : connection Intra: ${intra}, clientid : ${client.id}`,
    );

    const user_copy: IUser = {
      client: client,
      client_id,
      avatar,
      nickname,
      intra,
      status,
    };

    this.logger.log(
      `Function Name : connection in addUser Intra: ${intra}, clientid : ${client.id}`,
    );
    this.user.addUser(client.id, user_copy); // 사람을 추가해서 user에 넣기
    this.user.getUser(client.id);
    this.user.getUsers();
  }

  handleDisconnect(client: any) {
    // const extraToken = this.auth.extractToken(client, 'ws');
    // const intra = this.auth.getIntra(extraToken);
    const intra = this.room.getIntraAtToken(client);
    this.logger.log(
      `Function Name : handleDisconnect Intra : ${intra}, clientid : ${client.id}`,
    );
    //유저를 제거하고 방에서도 제거 >> 방에서 제거하는 것은 어떻게 하지?, 방도 추가를 해주어야 하나? 싶은데

    this.room.getAllRoom().forEach((element) => {
      this.room.deleteUserBysocketId(client.id, element.name);
      this.room.roomHowManyPeople(element.name);
    });

    // 방에서 제거 하고, mute에 있으면 제거하고, block에 있으면 제거하고, admin에서 제거하고, ban에서 제거하고

    this.room.deleteUser(client.id);
    this.user.removeUser(client.id);
    console.log('Dissconnected');
  }

  // get > 놉
  // crea > 방생성
  // chat room getchatroom

  // // 방 정보 호출
  // 방 생성

  // sids와 room과의 비교를 통해 퍼블릭 룸 나타내기! 임의의 chatroomlist

  // 방 정보 호출 roomType(public) 현재 인원,
  @SubscribeMessage('getChatRoomInfo')
  getChatRoomInfo(client: Socket) {
    // const extraToken = this.auth.extractToken(client, 'ws');
    // const intra = this.auth.getIntra(extraToken);

    // todo 방에서 탈출 시키기? 썅?

    //방에서 나가는 로직이 없으니까

    const intra = this.room.getIntraAtToken(client);
    this.logger.log(
      `Function Name : getChatRoomInfo Intra : ${intra}, clientid : ${client.id}`,
    );

    const returnRoom: {
      roomName: string;
      isPublic: boolean;
      currNum: number;
      // member: string[];
    }[] = [];

    this.room.getAllRoom().forEach((value, element, _) => {
      const temp: { roomName: string; isPublic: boolean; currNum: number } = {
        roomName: value.name,
        isPublic: value.isPublic,
        currNum: value.users.size,
        // member: arrr
      };
      returnRoom.push(temp);
    });

    // this.room.getPublicRooms(client).forEach((str:string) => {
    //   returnRoom.push({roomName:str, a.idPublic, a.users.size})
    //   this.room.
    // })

    // roomName : string, isPublic : boolean, currNum : number
    this.room.showRooms();
    // this.room.getPublicRooms(client).forEach((str :string )=>{
    //   [{},{}]

    // }) // return이 callback이다 fx를 보낼 필요가 없다!

    // return this.room.getPublicRooms(client); // return이 callback이다 fx를 보낼 필요가 없다!
    return returnRoom;
  }

  // 방 생성
  @SubscribeMessage('create-room')
  createroom(
    client: Socket,
    roomInfo: { room: string; isPublic: boolean; pwd?: string },
  ) {
    // roomname public 유무, 비밀번호,
    // const extraToken = this.auth.extractToken(client, 'ws');
    // const intra = this.auth.getIntra(extraToken);
    const intra = this.room.getIntraAtToken(client);
    this.logger.log(
      `Function Name : create-room room :${roomInfo.room}, Intra : ${intra} clientid : ${client.id}`,
    );

    const id = 0;
    const name: string = roomInfo.room;
    const isPublic = roomInfo.isPublic;
    const pw = roomInfo.pwd;
    const users: Map<string, IUser> = new Map();
    const muted: string[] = [];
    const ban: string[] = [];
    const owner = intra;
    // 방을 만든 사람은 오너 저장
    const admin: string[] = [];

    const chatRoom_copy: IChatRoom = {
      id,
      name,
      pw,
      isPublic,
      users,
      muted,
      ban,
      owner,
      admin,
    };

    this.room.addRoom(roomInfo.room, chatRoom_copy);
    this.room.showRooms();

    const userTemp: IUser = this.user.getUser(client.id); // 현재 클라이언트와 같은 사람 찾아와
    this.logger.log(`Add User socket id : ${client.id}, intra :${intra}`);

    this.room.addUser(roomInfo.room, userTemp, client); // 방에 사람 추가
    this.room.getInRoomUser(roomInfo.room); // 여기서는 방에 사람이 있는지

    this.room.showRooms(); // 사람 몇명있는지 확인

    client.join(roomInfo.room);
    client.emit('new-room-created', roomInfo.room); // 다른 이벤트 보내기!
    return {}; // 인자 없는 콜백
  }

  @SubscribeMessage('PWDCheck')
  PWDCheck(client: Socket, roomInfo: { roomName: string; pw: string }) {
    if (roomInfo.pw == this.room.getPW(roomInfo.roomName)) {
      this.logger.log(
        `Function Name : PWDCheck room :${roomInfo.roomName}, clientid : ${client.id} name : ${roomInfo.roomName} `,
      );
      client.join(roomInfo.roomName);
      const intra = this.room.getIntraAtToken(client);
      // 여기는 상상으로 짜봄
      // 자신의 아이디로 유저정보 뽑고, 그 유저로 있는 방에 참가! 방의 user에도 인원을 추가 해 주어야함!
      const userTemp: IUser = this.user.getUser(client.id);
      //room에 참가
      this.room.addUser(roomInfo.roomName, userTemp, client); // 방에 사람 추가하기
      this.room.getInRoomUser(roomInfo.roomName); // 여기서는 방에 사람이 있는지

      return true;
    } else {
      this.logger.log(`Function Name : PWDCheck room false`);
      return false;
    }
  }

  @SubscribeMessage('SetPWD')
  SetPWD(
    client: Socket,
    roomInfo: { roomName: string; pw: string; gottaPublic: boolean },
  ) {
    this.logger.log(
      `Function Name : SetPWD room :${roomInfo.roomName}, clientid : ${client.id}, name : ${roomInfo.pw} , public : ${roomInfo.gottaPublic}`,
    );
    const intra = this.room.getIntraAtToken(client);
    // client가 두명에 해당이 되는지
    if (
      intra == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, intra)
    ) {
      if (roomInfo.gottaPublic == true) {
        // 공개 방으로 해주세요
        if (this.room.getPublic(roomInfo.roomName)) {
          // 공개방 아무것도 안해도 됨
        } else {
          // 비번방을 공개방으로 > 비번 지우고, pulic true
          this.logger.log(' 비번방을 공개방으로 ');
          this.room.setPublic(roomInfo.roomName, true);
          this.room.setPW(roomInfo.roomName, null);
        }
      } else {
        // 비번방으로 해주세요
        if (this.room.getPublic(roomInfo.roomName)) {
          // 공개방을 비번방, 비번 생성
          this.logger.log(' 공개방을 비번방으로 ');
          this.room.setPublic(roomInfo.roomName, false);
          this.room.setPW(roomInfo.roomName, roomInfo.pw);
        } else {
          // 비번방을 비번방으로 > 비번 change
          this.logger.log(' 비번방을 비번방으로 ');
          this.room.setPW(roomInfo.roomName, roomInfo.pw);
        }
      }
    }
    return;
  }

  ///////////////////////////////

  //   kickUser
  // 주는 객체: {roomName:string , kickUser :string}
  // 내부 동작 : 해당 방에서 kickUser가 어드민이나 오너가 아니면 방에서 내보냄
  // 반환 : return ;

  @SubscribeMessage('kickUser') // 방 쫓아내기
  kickUser(client: Socket, roomInfo: { roomName: string; kickUser: string }) {
    const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
    let ret = '';
    if (
      roomInfo.kickUser == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, roomInfo.kickUser)
    )
      return ret;
    if (
      intra == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, intra)
    ) {
      this.room.getRoom(roomInfo.roomName).users.forEach((ele) => {
        if (ele.intra === roomInfo.kickUser) {
          this.room.rmRoomUser(roomInfo.roomName, roomInfo.kickUser);
          ret = ele.client_id;
        }
      });
      client.to(ret).emit('kicked'); // 다르게 유저객체에서 getuser kick대상을 찾아서
    }
    console.log('function kickUser');

    // user이름으로 socketid 찾기
    // this.room.deleteUserBysocketId(this.room.findIDbyIntraId(roomInfo.roomName, roomInfo.kickUser), roomInfo.roomName);
    this.room.showRooms();
    return ret;
  }

  // kick이랑 ban

  // banUser : {roomName:string , banUser :string}
  // 내부 동작 : 해당 방에서 banUser가 어드민이나 오너가 아니면 방에서 내보냄 + 해당 방의 밴 유저목록에 저장
  // 반환 : return ;
  // 추가사항: 엔터룸 : 해당 방 밴 목록확인 후 밴이면 못들어오게 false반환 조인 됐다면 true 반환

  @SubscribeMessage('banUser')
  banUser(client: Socket, roomInfo: { roomName: string; banUser: string }) {
    let ret = '';
    const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
    if (
      roomInfo.banUser == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, roomInfo.banUser)
    )
      return ret;
    // 오너랑 어드민은 뮤트 할 수 있게
    if (
      intra == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, intra)
    ) {
      this.room.addBanUser(roomInfo.roomName, roomInfo.banUser);
      this.room.getRoom(roomInfo.roomName).users.forEach((ele) => {
        if (ele.intra === roomInfo.banUser)
          this.room.rmRoomUser(roomInfo.roomName, roomInfo.banUser);
        ret = ele.client_id;
      });
      client.to(ret).emit('kicked');
    }
    console.log('function banUser');
    // this.room.deleteUserBysocketId(this.room.findIDbyIntraId(roomInfo.roomName, roomInfo.banUser), roomInfo.roomName);
    this.room.showRooms();
    return this.room.getAllRoom().get(roomInfo.roomName).ban;
  }

  // 관리자인데 들어가 있는데 ban kick mute 다됨
  // ban에 사람이 있는데 계속들어가

  // 관리자 권한에도 계속 들어가

  @SubscribeMessage('muteUser') // 방 나갔다가 들어와도 mute가 된 상태
  muteUser(client: Socket, roomInfo: { roomName: string; muteUser: string }) {
    this.logger.log(
      `Function Name : muteUser room :${roomInfo.roomName}, clientid : ${client.id}, roomInfo ${roomInfo.muteUser}`,
    );
    //관리자랑 주인은 뮤트 못시키게
    const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
    // 여기서 undefined가 될수가 있네?
    console.log('dkfalfjdaslfkjasd');
    console.log(this.room.getOwenr(roomInfo.roomName));
    console.log(this.room.getAllRoom().get(roomInfo.roomName).owner);
    console.log('dkfalfjdaslfkjasd');
    if (
      roomInfo.muteUser == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, roomInfo.muteUser)
    )
      return [];
    if (
      intra == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, intra)
    ) {
      if (
        !this.room.getRoom(roomInfo.roomName).muted.includes(roomInfo.muteUser)
      ) {
        //방의 오너 어드민이 뮤트의 대상? 불가능
        // 오너랑 어드민은 뮤트 할 수 있게
        this.room.addMuteUser(roomInfo.roomName, roomInfo.muteUser);
      } else {
        this.room.rmMuteUser(roomInfo.roomName, roomInfo.muteUser);
      }
    }
    this.room.showRooms();
    return this.room.getAllRoom().get(roomInfo.roomName).muted;
    // 다른 사람들은 불가능
  }

  @SubscribeMessage('setAdmin') // 해당 방에서 adminUser 목록에 추가
  setAdmin(client: Socket, roomInfo: { roomName: string; adminUser: string }) {
    this.logger.log(
      `Function Name : setAdmin room :${roomInfo.roomName}, clientid : ${client.id}, roomInfo ${roomInfo.adminUser}`,
    );
    const intra = this.room.getIntraAtToken(client); // 인트라 아이디가 나온다
    // 오너는 admin에 추가하면 안됨

    this.room.getAllRoom();
    if (intra == this.room.getOwenr(roomInfo.roomName)) {
      for (const admin of this.room.getRoom(roomInfo.roomName).admin) {
        if (admin == roomInfo.adminUser)
          // 있는 사람은 추가 x
          return;
      }
      // this.room.getRoom(roomInfo.roomName).admin.push(roomInfo.adminUser);
      // }
      // this.room.getRoom(roomInfo.roomName).admin.forof(element => {
      //   if (element == roomInfo.adminUser) // 있는 사람은 추가 x
      //     return f;
      // });
      this.room.getRoom(roomInfo.roomName).admin.push(roomInfo.adminUser);
    }
    console.log('function setAdmin');
    this.room.showRooms();
    return this.room.getAllRoom().get(roomInfo.roomName).admin;
  }

  // admin설정
  @SubscribeMessage('newMsg')
  newmsg(
    socket: Socket,
    newMsgObj: { room: string; user: string; msg: string },
  ) {
    // const extraToken = this.auth.extractToken(socket, 'ws');
    // const intra = this.auth.getIntra(extraToken);
    const intra = this.room.getIntraAtToken(socket);
    this.logger.log(
      `Function Name : newMsg room :${newMsgObj.room}, Intra : ${intra} clientid : ${socket.id}, ${newMsgObj.user} : ${newMsgObj.msg}`,
    );

    const temp: { room: string; user: string; msg: string } = {
      room: newMsgObj.room,
      user: intra,
      msg: newMsgObj.msg,
    };

    // 밴 된 대상은 제외
    // this.room.getRoom(newMsgObj.room).users.forEach((userEle) => {
    //   if (this.room.getRoom(newMsgObj.room).muted.includes(userEle.intra)) {

    //     socket.to(userEle.client_id).emit('newMsg', temp);
    //   }
    // })

    if (!this.room.getRoom(newMsgObj.room).muted.includes(intra)) {
      socket.to(newMsgObj.room).emit('newMsg', temp);
    }

    return {};
  }

  // 방 생성하지 않고 입장
  @SubscribeMessage('enterRoom') // 비밀번호유무
  enterRoom(client: Socket, joinInfo: { name: string; room: string }) {
    client.join(joinInfo.room);
    // const extraToken = this.auth.extractToken(client, 'ws');
    // const intra = this.auth.getIntra(extraToken);

    // 클라이언트가 벤유저면 emit kick

    const intra = this.room.getIntraAtToken(client);
    if (this.room.getRoom(joinInfo.room).ban.includes(intra))
      //
      client.emit('kicked'); // intra));

    this.logger.log(
      `Function Name : enterRoom room :${joinInfo.room}, intra : ${intra} clientid : ${client.id} name : ${joinInfo.name} `,
    );

    // 여기는 상상으로 짜봄
    // 자신의 아이디로 유저정보 뽑고, 그 유저로 있는 방에 참가! 방의 user에도 인원을 추가 해 주어야함!
    const userTemp: IUser = this.user.getUser(client.id);
    //room에 참가
    this.room.addUser(joinInfo.room, userTemp, client); // 방에 사람 추가하기
    this.room.getInRoomUser(joinInfo.room); // 여기서는 방에 사람이 있는지

    console.log('function enterRoom');
    this.room.showRooms();
    return {};
  }

  // 방 나가기 버튼
  @SubscribeMessage('leaveRoom')
  leaveRoom(socket: Socket, roomInfo: { room: string }) {
    this.logger.log(
      `Function Name : leaveRoom room :${roomInfo.room}, intra : ??? clientid : ${socket.id}`,
    );
    socket.leave(roomInfo.room);

    // this.logger.log('leaveRoom Before');
    // console.log('leaveRoom Before')
    // this.room.showRooms();

    // 여기는 추가
    this.room.deleteUserBysocketId(socket.id, roomInfo.room);
    this.room.showRooms();

    // 방에 아무도 없으면 방제거
    this.room.roomHowManyPeople(roomInfo.room);

    // this.logger.log('leaveRoom After');
    // console.log('leaveRoom After')
    // this.room.showRooms();

    return {};
  }

  // 다른방 눌렀다가 오기
  @SubscribeMessage('clearRoom')
  clearRoom(socket: Socket) {
    // this.logger.log('clearRoom Before');
    // console.log('clearRoom Before')
    // this.room.showRooms();
    this.logger.log(`Function Name : clearRoom clientid : ${socket.id}`);

    socket.rooms.forEach((ele: any) => {
      if (ele != socket.id) {
        socket.leave(ele);
        this.room.deleteUserBysocketId(socket.id, ele);
        // 방에 아무도 없으면 방제거
        this.room.roomHowManyPeople(ele);
      }
      // this.logger.log('clearRoom After');
      // console.log('clearRoom After')
      // this.room.showRooms();
    });
  }

  // 내부동작: shellWeDmUser에게 shellWeDm 이벤트 emit날림 ({user1:string, user2:string}
  // 넣어서 보내주기 user1 : shellWeDm이벤트 보낸사람, user2:보내준 shellWeDmUser)

  @SubscribeMessage('shellWeDm') // 초대를 한사람
  shellWeDm(
    socket: Socket,
    roomInfo: { roomName: string; shellWeDmUser: string },
  ) {
    const sendIntraId: string = this.room.getIntraAtToken(socket); // 내가 보내꺼야 shellWeDmUser에게

    let ret = '';
    // 방에 있으면 그 사람 뽑아내기
    if (this.room.isInRoomUser(roomInfo.roomName, roomInfo.shellWeDmUser)) {
      // this.room.getRoom(roomInfo.roomName).users.forEach((ele)=>{
      //   if (ele.intra === roomInfo.shellWeDmUser ) {
      //     this.room.rmRoomUser(roomInfo.roomName, roomInfo.shellWeDmUser);
      //     ret =  ele.client_id;
      //   }
      // })

      for (let [key, value] of this.room
        .getRoom(roomInfo.roomName)
        .users.entries()) {
        if (value.intra === roomInfo.shellWeDmUser) {
          ret = value.client_id;
        }
      }

      const roomName = sendIntraId + ' ' + roomInfo.shellWeDmUser;
      socket.join(roomName);
      socket.to(ret).emit('shellWeDm', {
        recvIntraId: roomInfo.shellWeDmUser,
        sendIntraId: sendIntraId,
      });
      // return {};
    }
    return {};
  }

  //   goDm
  // 주는 객체: {user1:string, user2:string}
  // 내부동작: 유저 1, 2 각각 방에 들어가있으면 각각 방에서 조인된거 풀기 + (킥할필요?) + 둘에게만 goDm 이벤트 emit (조인된 방 이름 (아마도 유저가 가지고있는 고유 방이름일거임 해쉬로 도있는 ))+ 서로 쪼인
  // 반환 return;
  @SubscribeMessage('goDm') // 최종 수락을 해서 채팅으로간다 초대 받은사람 // 초대 한사람
  goDm(socket: Socket, roomInfo: { roomName: string; user: string }) {
    //join된거 풀기
    const sendClientid = this.room.findIDbyIntraId(
      roomInfo.roomName,
      roomInfo.user,
    );
    const recvUser = this.room
      .getAllRoom()
      .get(socket.id)
      .users.get(socket.id).intra;
    // const user2Clientid = this.room.getAllRoom().get(socket.id).users.get(socket.id).client_id;

    // join된 방에서 조인 풀기
    for (const [key, value] of this.room
      .getRoom(roomInfo.roomName)
      .users.entries()) {
      if (key == sendClientid) {
        // this.room.deleteUserBysocketId(user1Clientid, roomInfo.roomName);
        this.room.rmRoomUser(roomInfo.roomName, roomInfo.user);
      } else if (key == recvUser) {
        // this.room.deleteUserBysocketId(user2Clientid, roomInfo.roomName); // 방에서 제거
        this.room.rmRoomUser(roomInfo.roomName, recvUser); // 방에서 제거
      }
    }

    const roomName = roomInfo.user + ' ' + recvUser;

    this.room.roomHowManyPeople(roomInfo.roomName);

    socket.join(roomName);

    socket.to(sendClientid).emit('joinedRoom');
    socket.to(socket.id).emit('joinedRoom');
    // 채팅방으로 보낸다

    //방에서 제거하는 로직
    return roomName;
  }

  @SubscribeMessage('createGameRoom')
  createGameRoom(client: Socket, gameInfo: { owner: string }) {
    this.gameroom.createGameRoom(gameInfo.owner, client);
  }

  @SubscribeMessage('setPlayer')
  setPlayer(client: Socket, gameInfo: { owner: string }) {
    this.gameroom.setPlayer(gameInfo.owner, client);
  }

  @SubscribeMessage('startGame')
  startGame(client: Socket, gameInfo: { owner: string }) {
    this.game.startGame(this.gameroom.getPlayers(gameInfo.owner));
  }

  @SubscribeMessage('setLocation')
  setLocation(
    client: Socket,
    gameInfo: { gameId: number; player: string; location: number },
  ) {
    this.game.setLocation(gameInfo);
  }

  // // // @SubscribeMessage('newMsg')
  // // // sentMsg(client : Socket, room: string) {
  // // //     // console.log(typeof(fx));
  // // //     console.log('newMsg');
  // // //     client.join(room);
  // // //     // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
  // // //     client.emit("new-room-created"); // 다른 이벤트 보내기!
  // // //     return {}; // 인자 없는 콜백
  // // // };
  // // 이것을 기반으로 callback 해결을 해보자 그리고 case 정리해두기!

  // // socket.leave('방이름');
  // // 방 나갈때 제거가 안됨
  // @SubscribeMessage('disconnecting')
  // leftRoom(socket: Socket) {
  //   // socket.rooms.forEach((room) =>
  //     // socket.to(room).emit("bye", socket.id));

  //     }
  //     // 본인 소켓이 조인 되어있는 방 string
  //     @SubscribeMessage('joinedRoom')
  //     joinedRoom(socket: Socket) {
  //       let ret: string;
  //       socket.rooms.forEach((idx) => {
  //         ret += idx + ' ';
  //       })
  //       console.log('===');
  //       console.log(ret);
  //       console.log('===');
  //       return ret;
  // }
  /////////////////////////////////////////////////////////////////////////
  // 본인 소켓이 조인 되어있는 방

  // this.server.on("create-room", (socket, room,fx) => {
  // socket.on("create-room", (room,fx) => {
  //     console.log('create-room');
  //     socket.join(room);
  //     console.log(this.publicRooms(socket).length);
  //     fx();
  //     socket.emit("new-room-created");
  // }); // 방에 참가, 새방 생성 되었다

  // socket에서 data가져오기
  //   @UseGuards(AuthGuardLocal)
  //   @SubscribeMessage('letAllUsers')
  //   async AllUsers(@MessageBody() intra: string) {
  //     console.log(intra);
  //     console.log(await this.users.findAll());
  //     this.server.emit('emitUsers', {
  //       msg: intra,
  //       content: await this.users.findAll(),
  //     });
  //   }
}
