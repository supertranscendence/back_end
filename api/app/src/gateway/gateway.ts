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
import { throwIfEmpty } from 'rxjs';
import { LoggingInterceptor } from '../logger.Interceptor';
import { AuthService } from '../auth/auth.service';

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
    // private auth: AuthService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  @WebSocketServer()
  server: Server;

  //  socket 객체는 개별 클라이언트와의 interacting을 위한 기본적인 객체
  handleConnection(client: any) {
    const intra = this.room.getIntraAtToken(client);
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
    }[] = [];

    this.room.getAllRoom().forEach((value, element, _) => {
      const temp: { roomName: string; isPublic: boolean; currNum: number } = {
        roomName: value.name,
        isPublic: value.isPublic,
        currNum: value.users.size,
      };
      returnRoom.push(temp);
    });

    // this.room.getPublicRooms(client).forEach((str:string) => {
    //   returnRoom.push({roomName:str, a.idPublic, a.users.size})
    //   this.room.
    // })

    // roomName : string, isPublic : boolean, currNum : number
    // this.room.showRooms();
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
    let muted: string[] = [];
    let ban: string[] = [];
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
  SetPWD(client : Socket, roomInfo : {roomName : string, pw : string, gottaPublic : boolean}) {

    this.logger.log(`Function Name : SetPWD room :${roomInfo.roomName}, clientid : ${client.id}, name : ${roomInfo.pw} , public : ${roomInfo.gottaPublic}`)
    const intra = this.room.getIntraAtToken(client);
    // client가 두명에 해당이 되는지
    if (intra == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, intra)) {
      if (roomInfo.gottaPublic == true) { // 공개 방으로 해주세요
        if (this.room.getPublic(roomInfo.roomName)) { // 공개방 아무것도 안해도 됨
        }
        else { // 비번방을 공개방으로 > 비번 지우고, pulic true
          this.logger.log(' 비번방을 공개방으로 ');
          this.room.setPublic(roomInfo.roomName, true);
          this.room.setPW(roomInfo.roomName, null);
        }
      }
      else { // 비번방으로 해주세요
        if (this.room.getPublic(roomInfo.roomName)) { // 공개방을 비번방, 비번 생성
          this.logger.log(' 공개방을 비번방으로 ');
          this.room.setPublic(roomInfo.roomName, false);
          this.room.setPW(roomInfo.roomName, roomInfo.pw);
        }
        else { // 비번방을 비번방으로 > 비번 change
          this.logger.log(' 비번방을 비번방으로 ');
          this.room.setPW(roomInfo.roomName, roomInfo.pw);
        }
      }
    }
    return;
  }


//   kickUser
// 주는 객체: {roomName:string , kickUser :string}
// 내부 동작 : 해당 방에서 kickUser가 어드민이나 오너가 아니면 방에서 내보냄
// 반환 : return ;

@SubscribeMessage('kickUser') // 방 쫓아내기
kickUser(client: Socket, roomInfo: {roomName:string , kickUser :string})
{
  const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
  let test = "x1";
  if (roomInfo.kickUser == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, roomInfo.kickUser))
    return "x2";
  if (intra == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, intra)){
    this.room.rmRoomUser(roomInfo.roomName, roomInfo.kickUser);
    // test = this.room.findIDbyIntraId(roomInfo.roomName, roomInfo.kickUser);
    this.room.getRoom(roomInfo.roomName).users.forEach((ele)=>{if (ele.intra === intra)
      test =  ele.client_id;
  })
    client.to(test).emit('kicked');
  }
  return test;
}

// banUser : {roomName:string , banUser :string}
// 내부 동작 : 해당 방에서 banUser가 어드민이나 오너가 아니면 방에서 내보냄 + 해당 방의 밴 유저목록에 저장
// 반환 : return ;
// 추가사항: 엔터룸 : 해당 방 밴 목록확인 후 밴이면 못들어오게 false반환 조인 됐다면 true 반환

@SubscribeMessage('banUser')
banUser(client:Socket, roomInfo: {roomName:string , banUser :string})
{
  let test = "x1";
  const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
  if (roomInfo.banUser == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, roomInfo.banUser))
    return ;

  // 오너랑 어드민은 뮤트 할 수 있게
  if (intra == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, intra)){
    this.room.addBanUser(roomInfo.roomName, roomInfo.banUser);
    this.room.getRoom(roomInfo.roomName).users.forEach((ele)=>{if (ele.intra === intra)
      test =  ele.client_id;
    });
    client.to(test).emit('kicked');
  }
  return {};
}

  @SubscribeMessage('muteUser') // 방 나갔다가 들어와도 mute가 된 상태
  muteUser(client: Socket, roomInfo: {roomName:string , muteUser :string})
  {
    this.logger.log(`Function Name : muteUser room :${roomInfo.roomName}, clientid : ${client.id}, roomInfo ${roomInfo.muteUser}`);
    //관리자랑 주인은 뮤트 못시키게
    const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
    if (roomInfo.muteUser == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, roomInfo.muteUser))
      return [];
    if (intra == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, intra)){
      if (!this.room.getRoom(roomInfo.roomName).muted.includes(roomInfo.muteUser)) {
        //방의 오너 어드민이 뮤트의 대상? 불가능
        // 오너랑 어드민은 뮤트 할 수 있게
        this.room.addMuteUser(roomInfo.roomName, roomInfo.muteUser);
      }
      else
      {
        this.room.rmMuteUser(roomInfo.roomName, roomInfo.muteUser);
      }
    }
      return this.room.getAllRoom().get(roomInfo.roomName).muted;
    // 다른 사람들은 불가능
  }

  @SubscribeMessage('setAdmin') // 해당 방에서 adminUser 목록에 추가
  setAdmin(client: Socket, roomInfo : {roomName:string , adminUser :string})
  {
    this.logger.log(`Function Name : setAdmin room :${roomInfo.roomName}, clientid : ${client.id}, roomInfo ${roomInfo.adminUser}`);
    const intra = this.room.getIntraAtToken(client); // 인트라 아이디가 나온다
    // 오너는 admin에 추가하면 안됨
    if (intra != this.room.getOwenr(roomInfo.roomName)) {
      this.room.setAdmin(roomInfo.roomName, roomInfo.adminUser);
    }
    return ;
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
    
    const temp : { room: string; user: string; msg: string } = {room : newMsgObj.room, user : intra, msg : newMsgObj.msg};

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
    if (this.room.getRoom(joinInfo.room).ban.includes(intra)) // 
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
