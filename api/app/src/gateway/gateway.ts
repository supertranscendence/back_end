import {
  Inject,
  LoggerService,
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthGuardLocal } from '../auth/auth.guard';
import { JWTExceptionFilter } from '../exception/jwt.filter';
import { RoomService } from './room.service';
import { SUserService } from './socketUser.service';
import { IChatRoom, IGameRoom, IUser, UserStatus } from '../types/types';
import { LoggingInterceptor } from '../logger.Interceptor';
import { AuthService } from '../auth/auth.service';
import { SGameService } from './sgame.service';
import { GameroomService } from './gameroom.service';
import { gameRoom, Room } from './Room';
import { User } from './User';
import { UsersService } from '../users/services/users.service';
import { InsertValuesMissingError } from 'typeorm';
import { GameService } from '../game/services/game.service';
import { RandomModule } from '@faker-js/faker';
import { Friends } from '../entities/Friends';
import { Users } from '../entities/Users';

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
    private game: GameService,
    private auth: AuthService,
    private gameroom: GameroomService,
    private users: UsersService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  @WebSocketServer()
  server: Server;

  //  socket 객체는 개별 클라이언트와의 interacting을 위한 기본적인 객체
  handleConnection(client: any) {
    const intra = this.auth.getIntra(this.auth.extractToken(client, 'ws'));
    this.user.addUser(client.id, new User(client, intra)); // 사람을 추가해서 user에 넣기
    
    // **********************
    // 여기서 login emit을 보내기!
    // **********************
    client.emit('changeState');

    this.logger.log(this.user.getUsers());
  }

  handleDisconnect(client: any) {
    this.room.getAllRoom().forEach((element) => {
      this.room.deleteUserBysocketId(client.id, element.name);
      this.room.deleteEmptyRoom(element.name);
    });
    this.room.deleteUser(client.id);
    this.user.removeUser(client.id); // TODO 방 나가기 콜백 보내기

      // **********************
    // 여기서 logout emit을 보내기!
    // **********************

    client.emit('changeState');

    for (const [key, value] of this.gameroom.allGameRoom()) {
      // this.gameroom.deleteUser(key, client.id);
      if (this.gameroom.isPlayerA(client.id, key)) {
        // a인지 확
        client.to(key).emit('kickAll'); // 다른 사람 다 내보내기
        client.emit('kickAll'); // 자기 나가기
        this.gameroom.deleteRoom(key);
  
      } else if (this.gameroom.isPlayerB(client.id, key)) {
        // b인지 확인
        this.gameroom.deletePlayer(key);
      } else {
        // 관전자
        if (this.gameroom.allGameRoom().get(key).observers)
          this.gameroom
            .allGameRoom()
            .get(key)
            .observers.delete(client.id);
      }

    }
    // 다 끊어주기,, cleargame룸 (다른 버튼을 눌렀을 때)
    this.gameroom.getQueue().delete(client.id);


    
  }

  @SubscribeMessage('getChatRoomInfo')
  getChatRoomInfo() {
    return this.room.getChatRooms();
  }

  @SubscribeMessage('create-room')
  createRoom(
    client: Socket,
    roomInfo: { room: string; isPublic: boolean; pwd?: string },
  ) {
    const intra = this.room.getIntraAtToken(client);
    if (
      this.room.addRoom(
        roomInfo.room,
        new Room(roomInfo.room, intra, roomInfo.isPublic, roomInfo.pwd),
      )
    )
      return {};
    //this.room.showRooms();  //TODO 간단하게 보여주기

    const userTemp: IUser = this.user.getUser(client.id); // 현재 클라이언트와 같은 사람 찾아와
    this.room.addUser(roomInfo.room, userTemp, client); // 방에 사람 추가
    client.join(roomInfo.room);
    client.emit('new-room-created', roomInfo.room); // 다른 이벤트 보내기!
    const chatRoomInfo = this.room.getChatRoomInfo(roomInfo.room);
    client.emit('roomInfo', chatRoomInfo); // join leave할때
    client.emit('countInRoom', chatRoomInfo.length);
    return {}; // 인자 없는 콜백
  }

  @SubscribeMessage('PWDCheck')
  PWDCheck(client: Socket, roomInfo: { roomName: string; pw: string }) {
    if (roomInfo.pw == this.room.getPW(roomInfo.roomName)) {
      client.join(roomInfo.roomName);
      const userTemp: IUser = this.user.getUser(client.id);
      this.room.addUser(roomInfo.roomName, userTemp, client); // 방에 사람 추가하기
      client
        .to(roomInfo.roomName)
        .emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // join leave할때
      // client.emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // 방 안의 사람 정보 갱신
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
  ///////////////////////////////

  //   kickUser
  // 주는 객체: {roomName:string , kickUser :string}
  // 내부 동작 : 해당 방에서 kickUser가 어드민이나 오너가 아니면 방에서 내보냄
  // 반환 : return ;

  // ban mute

  //Owner 는 admin을 킥할 수 있어야 한다.

  // ban mute

  //Owner 는 admin을 킥할 수 있어야 한다.
  @SubscribeMessage('kickUser') // 방 쫓아내기
  kickUser(client: Socket, roomInfo: { roomName: string; kickUser: string }) {
    const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
    let ret = '';
    if (
      roomInfo.kickUser == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, roomInfo.kickUser)
    ) {
      if (
        intra == this.room.getOwenr(roomInfo.roomName) &&
        this.room.checkAdmin(roomInfo.roomName, roomInfo.kickUser)
      ) {
        for (const [clientId, user] of this.room.getRoom(roomInfo.roomName)
          .users) {
          if (user.intra == roomInfo.kickUser) {
            this.room.rmRoomUser(roomInfo.roomName, roomInfo.kickUser);
            ret = clientId;
          }
        }
        client.to(ret).emit('kicked'); // 다르게 유저객체에서 getuser kick대상을 찾아서
        client.emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // join leave할때
      }
      return ret;
    } else if (
      intra == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, intra)
    ) {
      for (const [clientId, user] of this.room.getRoom(roomInfo.roomName)
        .users) {
        if (user.intra == roomInfo.kickUser) {
          this.room.rmRoomUser(roomInfo.roomName, roomInfo.kickUser);
          ret = clientId;
        }
      }
      //client.leave(roomInfo.roomName);
      client.to(ret).emit('kicked'); // 다르게 유저객체에서 getuser kick대상을 찾아서
      client.emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // join leave할때
    }
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
    ) {
      if (
        intra == this.room.getOwenr(roomInfo.roomName) &&
        this.room.checkAdmin(roomInfo.roomName, roomInfo.banUser)
      ) {
        this.room.addBanUser(roomInfo.roomName, roomInfo.banUser);
        for (const [clientId, user] of this.room.getRoom(roomInfo.roomName)
          .users) {
          if (user.intra == roomInfo.banUser) {
            this.room.rmRoomUser(roomInfo.roomName, roomInfo.banUser);
            ret = clientId;
          }
        }
        client.to(ret).emit('kicked'); // 다르게 유저객체에서 getuser kick대상을 찾아서
        client.emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // join leave할때
        return this.room.getAllRoom().get(roomInfo.roomName).ban;
      }
      return ret;
    } else if (
      intra == this.room.getOwenr(roomInfo.roomName) ||
      this.room.checkAdmin(roomInfo.roomName, intra)
    ) {
      this.room.addBanUser(roomInfo.roomName, roomInfo.banUser);
      for (const [clientId, user] of this.room.getRoom(roomInfo.roomName)
        .users) {
        if (user.intra == roomInfo.banUser) {
          this.room.rmRoomUser(roomInfo.roomName, roomInfo.banUser);
          ret = clientId;
        }
      }
      //client.leave(roomInfo.roomName);
      client.to(ret).emit('kicked');
      client.emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // join leave할때
      return this.room.getAllRoom().get(roomInfo.roomName).ban;
    }
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
    ) {
      if (
        intra == this.room.getOwenr(roomInfo.roomName) &&
        this.room.checkAdmin(roomInfo.roomName, roomInfo.muteUser)
      ) {
        if (
          !this.room
            .getRoom(roomInfo.roomName)
            .muted.includes(roomInfo.muteUser)
        ) {
          //방의 오너 어드민이 뮤트의 대상? 불가능
          // 오너랑 어드민은 뮤트 할 수 있게
          this.room.addMuteUser(roomInfo.roomName, roomInfo.muteUser);
        } else {
          this.room.rmMuteUser(roomInfo.roomName, roomInfo.muteUser);
        }
        return this.room.getAllRoom().get(roomInfo.roomName).muted;
      }
      return [];
    } else if (
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
    newMsgObj: { room: string; user: string; msg: string; msgType?: string },
  ) {
    const intra = this.room.getIntraAtToken(socket); // 나
    this.logger.log(
      `Function Name : newMsg room :${newMsgObj.room}, Intra : ${intra} clientid : ${socket.id}, ${newMsgObj.user} : ${newMsgObj.msg}`,
    );

    const temp: { room: string; user: string; msg: string } = {
      room: newMsgObj.room,
      user: intra,
      msg: newMsgObj.msg,
    };

    this.room.getAllRoom().get(newMsgObj.room).users.forEach(element => {
      this.users.IsBlock(element.intra, intra).then(
        (res) => {
          if (res) {}
          else {
            if (newMsgObj.msgType && newMsgObj.msgType == 'Dm')
            socket.to(element.client.id).emit('newMsg', temp);
          else {
            if (!this.room.getRoom(newMsgObj.room).muted.includes(intra)) {
              socket.to(element.client.id).emit('newMsg', temp);
            }
         }
          }
        }
      )
    });

    // this.users.IsBlock(newMsgObj.user, intra).then( // 내가 이사람 블락?
    //   (res) => {
    //     if (res) { }
    //     else{
    //       if (newMsgObj.msgType && newMsgObj.msgType == 'Dm')
    //         socket.to(newMsgObj.room).emit('newMsg', temp);
    //       else {
    //         if (!this.room.getRoom(newMsgObj.room).muted.includes(intra)) {
    //           socket.to(newMsgObj.room).emit('newMsg', temp);
    //         }
    //      }
    //     }
    //   }
    // );
    return {};
  }

  // 방 생성하지 않고 입장
  @SubscribeMessage('enterRoom') // 비밀번호유무
  enterRoom(client: Socket, joinInfo: { name: string; room: string }) {
    const intra = this.room.getIntraAtToken(client);
    if (this.room.getRoom(joinInfo.room).ban.includes(intra))
      client.emit('kicked'); // intra));
    else {
      client.join(joinInfo.room);
      const userTemp: IUser = this.user.getUser(client.id);
      this.room.addUser(joinInfo.room, userTemp, client); // 방에 사람 추가하기
      this.room.getInRoomUser(joinInfo.room); // 여기서는 방에 사람이 있는지
    }

    client
      .to(joinInfo.room)
      .emit('roomInfo', this.room.getChatRoomInfo(joinInfo.room)); // join leave할때
    return {};
  }

  @SubscribeMessage('roomInfo')
  roomInfo(socket: Socket, roomInfo: { roomName: string }) {
    const tmpArr: string[] = [];
    this.room
      .getAllRoom()
      .get(roomInfo.roomName)
      .users.forEach((ele) => {
        tmpArr.push(ele.intra);
      });
    return tmpArr;
  }

  // 방 나가기 버튼
  @SubscribeMessage('leaveRoom')
  leaveRoom(socket: Socket, roomInfo: { room: string }) {
    this.room.deleteUserBysocketId(socket.id, roomInfo.room);
    socket.leave(roomInfo.room);
    socket
      .to(roomInfo.room)
      .emit('roomInfo', this.room.getChatRoomInfo(roomInfo.room)); // join leave할때
    this.room.deleteEmptyRoom(roomInfo.room);
    return {};
  }

  // 다른방 눌렀다가 오기
  @SubscribeMessage('clearRoom')
  clearRoom(socket: Socket) {
    socket.rooms.forEach((ele: any) => {
      if (ele != socket.id) {
        socket.leave(ele);
      }
    });

    for (const [key, value] of this.room.getAllRoom()) {
      this.room.deleteUserBysocketId(socket.id, key);
      socket.to(key).emit('roomInfo', this.room.getChatRoomInfo(key)); // join leave할때
      this.room.deleteEmptyRoom(key);
    }
  }

  // 내부동작: shellWeDmUser에게 shellWeDm 이벤트 emit날림 ({user1:string, user2:string}
  // 넣어서 보내주기 user1 : shellWeDm이벤트 보낸사람, user2:보내준 shellWeDmUser)

  // shellWeDM >> 원래 방에서 쫓아내고 >> roomInfo다시보내주기
  // reJoin >> 원래방에 다시 합체 >> roomInfo다시보내주기
  // GoDm >> 하나 쫓아냄 >> roomInfo다시보내주기

  @SubscribeMessage('shellWeDm') // 초대를 한사람
  shellWeDm(
    socket: Socket,
    roomInfo: { roomName: string; shellWeDmUser: string },
  ) {
    const sendIntraId: string = this.room.getIntraAtToken(socket); // 내가 보내꺼야 shellWeDmUser에게

    let ret = '';
    // 방에 있으면 그 사람 뽑아내기
    if (this.room.isInRoomUser(roomInfo.roomName, roomInfo.shellWeDmUser)) {
      for (const [key, value] of this.room
        .getRoom(roomInfo.roomName)
        .users.entries()) {
        if (value.intra === roomInfo.shellWeDmUser) {
          ret = key;
        }
      }

      socket.leave(roomInfo.roomName);
      // socket.emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName)); // join leave할때

      this.users.IsBlock(roomInfo.shellWeDmUser, sendIntraId).then(
        (res) => {
          if (res) {
          }
          else{
            //                보내는 사람             받는 사람
            const roomName = sendIntraId + ' ' + roomInfo.shellWeDmUser;
            socket.join(roomName);
            // socket.emit('roomInfo', this.room.getAllRoom().get(roomInfo.roomName).users); // join leave할때
            socket.to(ret).emit('shellWeDm', {
              recvIntraId: roomInfo.shellWeDmUser,
              sendIntraId: sendIntraId,
            });
          }
        }
      );
    }
    return {};
  }

  // reJoin이면 다시 연결하기

  @SubscribeMessage('reJoin')
  reJoinRoom(socket: Socket, roomInfo: string) {
    socket.join(roomInfo);
    // socket.emit('roomInfo', this.room.getChatRoomInfo(roomInfo));
  }

  //   goDm
  // 주는 객체: {user1:string, user2:string}
  // 내부동작: 유저 1, 2 각각 방에 들어가있으면 각각 방에서 조인된거 풀기 + (킥할필요?) + 둘에게만 goDm 이벤트 emit (조인된 방 이름 (아마도 유저가 가지고있는 고유 방이름일거임 해쉬로 도있는 ))+ 서로 쪼인
  // 반환 return;
  @SubscribeMessage('goDm') // 최종 수락을 해서 채팅으로간다 초대 받은사람 // 초대 한사람
  goDm(socket: Socket, roomInfo: { roomName: string; user: string }) {
    //join된거 풀기
    this.logger.log(
      `Function Name goDm ${roomInfo.roomName}, ${roomInfo.user}`,
    );

    let sendClientid;
    for (const [key, value] of this.room.getAllRoom().get(roomInfo.roomName)
      .users) {
      if (value.intra === roomInfo.user) {
        sendClientid = key;
      }
    }

    this.logger.log(`Function Name recv ${sendClientid}`);

    const recvUser = this.room
      .getAllRoom()
      .get(roomInfo.roomName)
      .users.get(socket.id).intra;
    this.logger.log(`Function Name recv ${recvUser}`);
    // const user2Clientid = this.room.getAllRoom().get(socket.id).users.get(socket.id).client_id;

    this.logger.log(`Function Name goDm join unlock`);
    // join된 방에서 조인 풀기
    for (const [key, value] of this.room.getAllRoom().get(roomInfo.roomName)
      .users) {
      if (key == sendClientid) {
        this.logger.log(
          `Function Name goDm join unlock sendClientId ${key}, ${sendClientid} ${value.intra}`,
        );
        // this.room.deleteUserBysocketId(user1Clientid, roomInfo.roomName);
        this.room.rmRoomUser(roomInfo.roomName, roomInfo.user);

        //방에서 연결을 끊어주는 역할을 하는게 필요하다
      } else if (key == socket.id) {
        this.logger.log(
          `Function Name goDm join unlock recvUser ${key}, ${socket.id} ${value.intra}`,
        );
        // this.room.deleteUserBysocketId(user2Clientid, roomInfo.roomName); // 방에서 제거
        this.room.rmRoomUser(roomInfo.roomName, recvUser); // 방에서 제거
        socket.leave(roomInfo.roomName);
        socket
          .to(roomInfo.roomName)
          .emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName));
      }
    }

    this.logger.log(`Function Name goDm join unlock success`);

    //              초대한 사람                 받는 사람
    const roomName = roomInfo.user + ' ' + recvUser;

    this.logger.log(`Function Name goDm End : ${roomName}`);
    this.room.deleteEmptyRoom(roomInfo.roomName);

    socket.join(roomName);
    // socket.emit('roomInfo', this.room.getAllRoom().get(joinInfo.room).users); // join leave할때

    socket
      .to(sendClientid)
      .emit('joinedRoom', { roomName: roomName, roomType: 'Dm' });
    socket.emit('joinedRoom', { roomName: roomName, roomType: 'Dm' });
    // 채팅방으로 보낸다

    //방에서 제거하는 로직
    this.logger.log(
      `Function Name goDm sendid : ${roomInfo.user}, ${sendClientid} socket.id : ${recvUser}, ${socket.id}`,
    );
    return roomName;
  }

  /////////////////////////////////////////////////////////////////////////////////
  @SubscribeMessage('createGameRoom')
  createGameRoom(client: Socket, roomName: string) {
    const userTemp: IUser = this.user.getUser(client.id); // 현재 클라이언트와 같은 사람 찾아와
    // userTemp.status = 3;
    // console.log(roomName);
    if (this.gameroom.createGameRoom(roomName, new gameRoom(userTemp)))
      return {};
    client.join(roomName);
    client.emit('newGameRoomCreated', roomName);
    // console.log('newGameRoomCreated', client.rooms);

    console.log(userTemp.intra);
    client.emit('gameRoomInfo', {
      playerA: userTemp.intra,
      playerB: '',
      isA: this.gameroom.isPlayerA(userTemp.intra, roomName),
    });
    return {};
  }


//////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('enterGameRoom')
  enterGameRoom(client: Socket, room: string) {
    const userTemp: IUser = this.user.getUser(client.id);
    // userTemp.status = 3;
    const playerA: string = this.gameroom.allGameRoom().get(room).playerA.intra;
    let isB = false;

    if (this.gameroom.allGameRoom().get(room).roomState == true)
      return true;
    console.log('enterGameROom');
    if (this.gameroom.allGameRoom().get(room).playerB) {
      console.log('already');
      isB = true; //  방에 있어요
    }
    if (this.gameroom.setPlayerB(room, userTemp)) {
      console.log('not in');
      client.join(room);
    }
    // console.log(this.gameroom.allGameRoom().get(room).playerB);

    client.to(room).emit('gameRoomInfo', {
      playerA: playerA,
      playerB: this.gameroom.allGameRoom().get(room).playerB.intra,
      isA: this.gameroom.isPlayerA(userTemp.intra, room),
    });
    return isB;
  }

  @SubscribeMessage('gameRoomInfo')
  gameRoomInfo(client: Socket, roomName: string) {
    const player_A: string = this.gameroom.allGameRoom().get(roomName)
      .playerA.intra;
    let player_B: string = '';
    
    let isA : boolean;
    if (this.gameroom.allGameRoom().get(roomName).playerA.client.id == client.id)
      isA = true;
    else
      isA = false;

    if (this.gameroom.allGameRoom().get(roomName).playerB)
      player_B = this.gameroom.allGameRoom().get(roomName).playerB.intra;



    return { playerA: player_A, playerB: player_B , isA: isA,};
  }

  @SubscribeMessage('enterGameRoomOBS')
  enterGameRoomOBS(client: Socket, room: string) {
    const userTemp: IUser = this.user.getUser(client.id);
    // userTemp.status = 3;
    this.gameroom
      .allGameRoom()
      .get(room)
      .observers.set(userTemp.client.id, userTemp);
    client.join(room);

    const player_A: string = this.gameroom.allGameRoom().get(room)
      .playerA.intra;
    let player_B: string = '';
    
    if (this.gameroom.allGameRoom().get(room).playerB) 
      player_B = this.gameroom.allGameRoom().get(room).playerB.intra;

    client.to(room).emit('gameRoomInfo', {
      playerA: player_A,
      playerB: player_B,
      isA: this.gameroom.isPlayerA(userTemp.intra, room),
    });
    return {};
  }

  /////////////////////////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('clearGameRoom')
  clearGameRoom(client: Socket) {
    client.rooms.forEach((ele: any) => {
      if (ele != client.id) {
        client.leave(ele);
      }
    });
    this.gameroom.getQueue().delete(client.id);
    for (const [key, value] of this.gameroom.allGameRoom()) {
      let a = value.playerA
      let b = value.playerB
      let is_A = this.gameroom.isPlayerA(a.intra, key);
      if (this.gameroom.isPlayerA(client.id, key)) {
        client.to(key).emit('kickAll'); // 다른 사람 다 내보내기
        client.emit('kickAll'); // 자기 나가기let
        
        this.gameroom.deleteRoom(key);
        // db에다 상대가 이기는 저장하는 로직이 있어야 된다. // 강종에서 상대
      } else if (this.gameroom.isPlayerB(client.id, key)) {
        
        // b인지 확인
        this.gameroom.deletePlayer(key);
        // db에다 상대가 이기는 저장하는 로직이 있어야 된다. 게임 중이라면 // 강종에서 상대
      } else {
        // 관전자
        if (this.gameroom.allGameRoom().get(key).observers)
          this.gameroom.allGameRoom().get(key).observers.delete(client.id);
      }

      let player_B: string = '';
      if (b)
        player_B = b.intra;

      console.log(a ,",", b)

      client.to(key).emit('gameRoomInfo', {
        playerA: a.intra,
        playerB: player_B,
        isA: is_A,
      });
    }
  }

  @SubscribeMessage('leaveGameRoom') // 게임 방에서 방나가기 버튼을 눌렀을 때
  leaveGameRoom(client: Socket, gameRoom: { room: string }) {
  // leaveGameRoom(client: Socket, gameRoom: { room: string }) {
    this.gameroom.getQueue().delete(client.id);
    let a = this.gameroom.allGameRoom().get(gameRoom.room).playerA;
    let b = this.gameroom.allGameRoom().get(gameRoom.room).playerB;
      let is_A = this.gameroom.isPlayerA(a.intra, gameRoom.room);
    if (this.gameroom.isPlayerA(client.id, gameRoom.room)) {
      // a인지 확
      client.to(gameRoom.room).emit('kickAll'); // 다른 사람 다 내보내기
      client.emit('kickAll'); // 자기 나가기
      this.gameroom.deleteRoom(gameRoom.room);

    } else if (this.gameroom.isPlayerB(client.id, gameRoom.room)) {
      // b인지 확인
      this.gameroom.deletePlayer(gameRoom.room);
    } else {
      // 관전자
      if (this.gameroom.allGameRoom().get(gameRoom.room).observers)
        this.gameroom
          .allGameRoom()
          .get(gameRoom.room)
          .observers.delete(client.id);
    }

    let player_B: string = '';
      if (b)
        player_B = b.intra;
    
    client.to(gameRoom.room).emit('gameRoomInfo', {
      playerA: a.intra,
      playerB: player_B,
      isA: is_A,
    });
    return {};
  }

  //////////////////////////////////////////////////////////////

  @SubscribeMessage('findMatch')
  findMatch(client: Socket) {
    const userTemp: IUser = this.user.getUser(client.id);
    //유저에서 있으면 아래실행

    // 시작하고 head, tail, size 확인하고,
    // 방나가고 head, tail, size 확인하고,
    // 게임 시작하고 head, tail, size 확인하고,
    // 한명이 시작하고 나가고 다른 한명이 들어오고 head, tail, size 확인하고,

    // console.log('startMatch');
    // this.gameroom.getQueue().data();
    if (this.gameroom.getQueue().equal(userTemp)) {
      
      // console.log('deletequeue before');
      // this.gameroom.getQueue().data();
      
      
      // delete가 안됨! 이것만 수정을 하면 됨!
      this.gameroom.getQueue().delete(client.id); //소켓 디스커넥트가
      
      // console.log('deletequeue after');
      // this.gameroom.getQueue().data();

      return this.gameroom.getQueue().getSize();
    }


    this.gameroom.getQueue().enqueue(userTemp); //소켓 디스커넥트가
    // console.log('enqueue before');
    // console.log('enqueue after');
    // this.gameroom.getQueue().data();

    if (this.gameroom.getQueue().getSize()>= 2) {
      const userBefore: IUser = this.gameroom.getQueue().dequeue(); // b이여된다!
      const tempAfter: IUser = this.gameroom.getQueue().dequeue(); // a여야된다! 

      const roomName =  userBefore.intra + ' ' + tempAfter.intra;
      // this.gameroom.createGameRoom(roomName, new gameRoom(userBefore)); // a
      // this.gameroom.setPlayerB(roomName, tempAfter); // b


      // 내가 생성하는 방 creategameroom
      if (this.gameroom.createGameRoom(roomName, new gameRoom(tempAfter)))
        return {};
      client.join(roomName);
    // gameroomInfo도 emit을 보낼 수도 있다!
    // 뒤에 들어온 애를 A 앞에 들어온 애를 B로!

      // console.log('----------' + roomName);
      client.emit('findMatch', {roomName:roomName, isA : true}); // a
      client.to(userBefore.client.id).emit('findMatch', {roomName :roomName, isA :false}); // b
    }
    return this.gameroom.getQueue().getSize();
  }

  @SubscribeMessage('shellWeGame')
  shellWeGame(
    socket: Socket,
    roomInfo: { roomName: string; shellWeGameUser: string },
  ) {
    const sendIntraId: string = this.room.getIntraAtToken(socket); // 내가 보내꺼야 shellWeDmUser에게

    let ret = '';
    if (this.room.isInRoomUser(roomInfo.roomName, roomInfo.shellWeGameUser)) {
      for (const [key, value] of this.room
        .getRoom(roomInfo.roomName)
        .users.entries()) {
        if (value.intra === roomInfo.shellWeGameUser) {
          ret = key;
        }
      }
      socket.leave(roomInfo.roomName);
      //                보내는 사람             받는 사람
      const roomName = sendIntraId + ' ' + roomInfo.shellWeGameUser;

      socket.join(roomName);
      socket.to(ret).emit('shellWeGame', {
        recvIntraId: roomInfo.shellWeGameUser,
        sendIntraId: sendIntraId,
        type: 'Game',
      });
    }
    return {};
  }

  @SubscribeMessage('goGame') // 최종 수락을 해서 채팅으로간다 초대 받은사람 // 초대 한사람
  goGame(socket: Socket, roomInfo: { roomName: string; user: string }) {
    //join된거 풀기
    let sendClientid;
    for (const [key, value] of this.room.getAllRoom().get(roomInfo.roomName)
      .users) {
      if (value.intra === roomInfo.user) {
        sendClientid = key;
      }
    }
    const recvUser = this.room
      .getAllRoom()
      .get(roomInfo.roomName)
      .users.get(socket.id).intra;
    const recvU = this.room
      .getAllRoom()
      .get(roomInfo.roomName)
      .users.get(socket.id);
    const sendU = this.room
      .getAllRoom()
      .get(roomInfo.roomName)
      .users.get(sendClientid);

    for (const [key, value] of this.room.getAllRoom().get(roomInfo.roomName)
      .users) {
      if (key == sendClientid) {
        this.room.rmRoomUser(roomInfo.roomName, roomInfo.user);
      } else if (key == socket.id) {
        this.room.rmRoomUser(roomInfo.roomName, recvUser); // 방에서 제거
        socket.leave(roomInfo.roomName);
      }
    }
    const roomName = roomInfo.user + ' ' + recvUser;
    this.room.deleteEmptyRoom(roomInfo.roomName);

    this.gameroom.createGameRoom(roomName, new gameRoom(recvU)); // a
    this.gameroom.setPlayerB(roomName, sendU); // b

    socket.join(roomName);
    socket
      .to(sendClientid)
      .emit('joinedRoom', { roomName: roomName, roomType: 'Game' });
    socket.emit('joinedRoom', { roomName: roomName, roomType: 'Game' });
    // 게임방으로 보내는거고

    return roomName;
  }

  ////////////////

  //a의 이름
  @SubscribeMessage('getGameRoomInfo')
  getGameRoomInfo(client: Socket) {
    return this.gameroom.getGameRooms();
  }

  // @SubscribeMessage('collision')
  // collision(client: Socket, roomInfo : {gameRoom, x, y, xv, yv}) {
  //   // client.emit('collision', {x : roomInfo.x, y : roomInfo.y, xv :roomInfo.xv, yv: roomInfo.yv});
  //   if (this.gameroom.isPlayerA(client.id, roomInfo.gameRoom))
  //     client.to(this.gameroom.allGameRoom().get(roomInfo.gameRoom).playerB.client.id).emit('collision', {x : roomInfo.x, y : roomInfo.y, xv :roomInfo.xv, yv: roomInfo.yv})
  //   else if (this.gameroom.isPlayerB(client.id, roomInfo.gameRoom))
  //     client.to(this.gameroom.allGameRoom().get(roomInfo.gameRoom).playerA.client.id).emit('collision', {x : roomInfo.x, y : roomInfo.y, xv :roomInfo.xv, yv: roomInfo.yv})
  // }

///////////////////////////////

  // @SubscribeMessage('down') // 이 소켓이 a인지 b인지 observer ,, a면 true, b면 false emit은 room
  // down(client: Socket, gameRoom: { gameRoom }) {
  //   if (this.gameroom.isPlayerA(client.id, gameRoom.gameRoom)) {
  //     client.emit('down'); //플레이어 에이인지 아닌지
  //     client.to(gameRoom.gameRoom).emit('down'); //플레이어 에이인지 아닌지
  //   } else {
  //     client.emit('down'); //플레이어 에이인지 아닌지
  //     client.to(gameRoom.gameRoom).emit('down'); //플레이어 에이인지 아닌지
  //   }
  //   return {};
  // }

  @SubscribeMessage('down') // 이 소켓이 a인지 b인지 observer ,, a면 true, b면 false emit은 room
  down(client: Socket, gameRoom: { name : string, isA : boolean | undefined, yPos: number}) {
  
    if (gameRoom.isA !== undefined) {
      if (gameRoom.isA) {
        client.emit('down', {isA : gameRoom.isA, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
        client.to(gameRoom.name).emit('down', {isA : gameRoom.isA, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
      }
      else {
        client.emit('down', {isA : gameRoom.isA, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
        client.to(gameRoom.name).emit('down', {isA : false, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
      }
    }
  }


  @SubscribeMessage('up') // 이 소켓이 a인지 b인지 observer ,, a면 true, b면 false emit은 room
  up(client: Socket, gameRoom: { name : string, isA : boolean | undefined, yPos: number}) {
  
    if (gameRoom.isA !== undefined) {
      if (gameRoom.isA) {
        client.emit('up', {isA : gameRoom.isA, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
        client.to(gameRoom.name).emit('up', {isA : gameRoom.isA, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
      }
      else {
        client.emit('up', {isA : gameRoom.isA, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
        client.to(gameRoom.name).emit('up', {isA : false, yPos: gameRoom.yPos}); //플레이어 에이인지 아닌지
      }
    }
  }

  @SubscribeMessage('collision')
  collision(client: Socket, ball: {name: string,x: number, y:number, radius:number, velocityX:number, velocityY:number, speed:number, color:string}) {
    client.emit('collision', {x : ball.x, y :ball.y, radius : ball.radius, velocityX : ball.velocityX, velocityY : ball.velocityY,
      speed: ball.speed, color: ball.color})
    client.to(ball.name).emit('collision', {x : ball.x, y :ball.y, radius : ball.radius, velocityX : ball.velocityX, velocityY : ball.velocityY,
    speed: ball.speed, color: ball.color})
  }

// 이벤트 받은 백엔드가 처리해줄 일: 그대로 모든 방 유저들, 소켓 본인에게 그대로 볼 정보 보내주기!
  // @SubscribeMessage('up')
  // up(client: Socket, gameRoom: { gameRoom }) {
  //   if (this.gameroom.isPlayerA(client.id, gameRoom.gameRoom)) {
  //     client.emit('up');
  //     client.to(gameRoom.gameRoom).emit('up'); //플레이어 에이인지 아닌지
  //   } else {
  //     client.emit('up'); //플레이어 에이인지 아닌지
  //     client.to(gameRoom.gameRoom).emit('up'); //플레이어 에이인지 아닌지
  //   }
  //   return {};
  // }

  // @SubscribeMessage('up')
  // up(client: Socket, gameRoom: { name : string, isA : boolean | undefined}) {
  //   if (this.gameroom.isPlayerA(client.id, gameRoom.gameRoom)) {
  //     client.emit('up');
  //     client.to(gameRoom.gameRoom).emit('up'); //플레이어 에이인지 아닌지
  //   } else {
  //     client.emit('up'); //플레이어 에이인지 아닌지
  //     client.to(gameRoom.gameRoom).emit('up'); //플레이어 에이인지 아닌지
  //   }
  //   return {};
  // }

  //////////////////////////////


  @SubscribeMessage('gameStart')
  gameStart(client: Socket, roomInfo : {room: string, mode : boolean}) { // 모드 이면 true
    
      if (this.gameroom.allGameRoom().get(roomInfo.room).playerB) {
        // a가 뭔지 user에서 찾고
        // b가 뭔지 user에서 찾고
        // user에서 상태 변화!
        // **********************
        // 여기서 game a, b 로 보내기!
        // **********************
        
        // 설정하고
        // emit
        
        if (this.gameroom.isPlayerA(client.id, roomInfo.room)) {
          // 사람들 게임중인 상태 
          this.gameroom.allGameRoom().get(roomInfo.room).roomState = true;
          client.to(roomInfo.room).emit('gameStart', {start : true, mode :roomInfo.mode});
          client.emit('gameStart', {start : true, mode :roomInfo.mode});
          
          this.user.getUsers().get(this.gameroom.allGameRoom().get(roomInfo.room).playerA.intra).status = 2;
          this.user.getUsers().get(this.gameroom.allGameRoom().get(roomInfo.room).playerB.intra).status = 2;
          client.emit('changeState');
          // return {};
        } else {
          // client.to(roomInfo.room).emit('gameStart', {start: false, mode : roomInfo.mode});
          // client.emit('gameStart', {start: false, mode : roomInfo.mode});
        }
      }
      
      return {};
  }

  @SubscribeMessage('gameSet')
  gameSet(
    client: Socket,
    User: { userA: number; userB: number; name: string; mode: boolean },
  ) {
    let intra: string;
    const a = this.gameroom.allGameRoom().get(User.name).playerA; // 여기가 설정이 안되어있음! 그래서 게임이 안끝남!
    const b = this.gameroom.allGameRoom().get(User.name).playerB;
    if (User.userA >= 3) {
      intra = this.gameroom.allGameRoom().get(User.name).playerA.intra;
      client.to(User.name).emit('gameDone', intra);
      client.emit('gameDone', intra);
      this.gameroom.deleteRoom(User.name);
    
      this.users.update(a.intra);
      this.game.create(a.intra + '|' + b.intra ,User.userA + '|' + User.userB)
      this.game.create(b.intra + '|' + a.intra ,User.userB + '|' + User.userA)
      
    } else if (User.userB >= 3) {
      intra = this.gameroom.allGameRoom().get(User.name).playerB.intra;
      client.to(User.name).emit('gameDone', intra);
      client.emit('gameDone', intra);
      this.gameroom.deleteRoom(User.name);

      this.users.update(b.intra);
      this.game.create(a.intra + '|' + b.intra ,User.userA + '|' + User.userB)
      this.game.create(b.intra + '|' + a.intra ,User.userB + '|' + User.userA)
    }
    else {
      for (const [key, value] of this.gameroom.allGameRoom().get(User.name)
        .observers) {
        client.to(value.client.id).emit('gameSet', {
          userA: User.userA,
          userB: User.userB,
          mode: User.mode,
        });
      }
    }
    // **********************
        // 여기서 a, b 게임 끝으로
    // ********************** 
        // a, b 로그인으로
      this.user.getUsers().get(this.gameroom.allGameRoom().get(User.name).playerA.intra).status = 1;
      this.user.getUsers().get(this.gameroom.allGameRoom().get(User.name).playerB.intra).status = 1;
      client.emit('changeState');

    return {};
  }

  //////////////////////////////////////////////////////////////////////////////////////////////

  // 서버에서 해줄일 : 옵저버들한테 gameSet 이벤트 emit 해주기 (
  //   객체 :{userA: number, userB:userB.number} 담아서
  // )

  //a인지 확인 모든 방에 gamestart

  // @SubscribeMessage('setPlayer')
  // setPlayer(client: Socket, gameInfo: { owner: string }) {
  //   this.gameroom.setPlayer(gameInfo.owner, client);
  // }

  // @SubscribeMessage('startGame')
  // startGame(client: Socket, gameInfo: { owner: string }) {
  //   this.game.startGame(this.gameroom.getPlayers(gameInfo.owner));
  // }

  // @SubscribeMessage('setLocation')
  // setLocation(
  //   client: Socket,
  //   gameInfo: { gameId: number; player: string; location: number },
  // ) {
  //   this.game.setLocation(gameInfo);
  // }

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



  // @SubscribeMessage('unBlock')
  // unBlock(client: Socket, friendName : string) {
  //   const my = this.user.getUsers().get(client.id).intra;
  //     this.users.deleteBlock(my, friendName)
  // }

  @SubscribeMessage('Block')
  Block(client: Socket, friendName : string) {
    const my = this.user.getUsers().get(client.id).intra;
    
    //  비동기는 이렇게 처리합니다 then 내부에서 처리를 한다!
    this.users.IsBlock(my, friendName).then(
      (res) => {
        let chk = res;
        console.log(chk, res);
        if (chk) {
          console.log('delete');
          this.users.deleteBlock(my,friendName);
        }
        else{
          console.log('block');
          this.users.blockFriend(my, friendName)
        }
      }
    );
  }

  //friend 로직 friend가 없어요!!!
  @SubscribeMessage('myFriend')
  myFriend(client: Socket) {
    return this.user.myFriend(client)
  }
  //   const intra = this.room.getIntraAtToken(client);
    
  //   // const stateFriend: {
  //   //   friend: string; state: UserStatus; avatar: string; blocked: boolean;
  //   // }[] = [];
    
  //   // 아바타를 변경할때 마다, 로그인을 할 때 마다 로그아웃을 할 때마다, 게임 방에 들어갈 때 마다!
  //   // emit을 보내주어야 한다!

  //   const ret = this.users.findFriend(intra).then((res) => {
  //     for (const [key, values] of res.entries()) {
  //       let ava : string = "";
  //       this.users.findByIntra(values.friend).then((res) => {
  //         if (res && res.avatar)
  //           ava = res.avatar;
  //       });
  //       const temp: { friend: string; state: UserStatus; blocked: boolean; avatar : string} = {
  //         friend: values.friend, state: 0, blocked: values.block, avatar: ava,
  //       };
  //       // if (this.user.isUserName(values.friend)) {
  //       //   temp.state = 1; //login
  //       // } 
  //       // else {
  //       //   temp.state = 2; // logout
  //       // }
  //       // this.gameroom.allGameRoom().forEach((e) => {
  //       //   if (e.playerA.intra == values.friend)
  //       //     temp.state = 3;
  //       //   else if  (e.playerB.intra == values.friend)
  //       //     temp.state = 3;
  //       //   e.observers.forEach((a) => {
  //       //     if (a.intra == values.friend)
  //       //       temp.state = 3;
  //       //   })
  //       // }); 
  //       stateFriend.push(temp); // 친구
  //     }
  //     // console.log(stateFriend);
  //     return JSON.stringify(stateFriend);
  //   });
  //   return ret
  // }


}
