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
import { IChatRoom, IUser, UserStatus } from '../types/types';
import { LoggingInterceptor } from '../logger.Interceptor';
import { AuthService } from '../auth/auth.service';
import { SGameService } from './sgame.service';
import { GameroomService } from './gameroom.service';
import { Room } from './Room';
import { User } from './User';

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
    this.user.addUser(client.id, new User(client, intra)); // 사람을 추가해서 user에 넣기
    this.logger.log(this.user.getUsers());
  }

  handleDisconnect(client: any) {
    this.room.getAllRoom().forEach((element) => {
      this.room.deleteUserBysocketId(client.id, element.name);
      this.room.deleteEmptyRoom(element.name);
    });
    this.room.deleteUser(client.id);
    this.user.removeUser(client.id); // TODO 방 나가기 콜백 보내기
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
    if (this.room.addRoom(
      roomInfo.room,
      new Room(roomInfo.room, intra, roomInfo.isPublic, roomInfo.pwd),
    ))
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

  // ban mute

  //Owner 는 admin을 킥할 수 있어야 한다.
  @SubscribeMessage('kickUser') // 방 쫓아내기
  kickUser(client: Socket, roomInfo: { roomName: string; kickUser: string }) {
    const intra = this.room.getIntraAtToken(client); //이사람이 어드민이나 오너이면 //muteuser를 할 수 있게, 어드민이나 오너는 뮤트 할 수 없게
    let ret = '';
    if (roomInfo.kickUser == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, roomInfo.kickUser)) {
      if ((intra == this.room.getOwenr(roomInfo.roomName)) && this.room.checkAdmin(roomInfo.roomName, roomInfo.kickUser)) {
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
    }
    else if (
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
    if ( roomInfo.banUser == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, roomInfo.banUser)) {
      if ((intra == this.room.getOwenr(roomInfo.roomName)) && this.room.checkAdmin(roomInfo.roomName, roomInfo.banUser)) {
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
    }
    else if (
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
    if (roomInfo.muteUser == this.room.getOwenr(roomInfo.roomName) || this.room.checkAdmin(roomInfo.roomName, roomInfo.muteUser)) {
        if ((intra == this.room.getOwenr(roomInfo.roomName)) && this.room.checkAdmin(roomInfo.roomName, roomInfo.muteUser)) {
          if (
            !this.room.getRoom(roomInfo.roomName).muted.includes(roomInfo.muteUser)
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
    }
    else if (
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
    if (newMsgObj.msgType && newMsgObj.msgType == 'Dm')
      socket.to(newMsgObj.room).emit('newMsg', temp);
    else {
      if (!this.room.getRoom(newMsgObj.room).muted.includes(intra)) {
        socket.to(newMsgObj.room).emit('newMsg', temp);
      }
    }

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
    let tmpArr: string[] = [];
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

    for(const [key, value] of this.room.getAllRoom()) {
      this.room.deleteUserBysocketId(socket.id, key);
      socket
      .to(key)
      .emit('roomInfo', this.room.getChatRoomInfo(key)); // join leave할때
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

      //                보내는 사람             받는 사람
      const roomName = sendIntraId + ' ' + roomInfo.shellWeDmUser;

      socket.join(roomName);
      // socket.emit('roomInfo', this.room.getAllRoom().get(roomInfo.roomName).users); // join leave할때
      socket.to(ret).emit('shellWeDm', {
        recvIntraId: roomInfo.shellWeDmUser,
        sendIntraId: sendIntraId,
      });
      // return {};
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
    for (let [key, value] of this.room.getAllRoom().get(roomInfo.roomName)
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
        socket.to(roomInfo.roomName).emit('roomInfo', this.room.getChatRoomInfo(roomInfo.roomName));

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

  @SubscribeMessage('createGameRoom')
  createGameRoom(client: Socket, roomName: string) {
    const userTemp: IUser = this.user.getUser(client.id); // 현재 클라이언트와 같은 사람 찾아와
    if (this.gameroom.createGameRoom(roomName, userTemp))
      return {};
    client.join(roomName);
    client.emit('new-room-created', roomName);
    return {};
  }

  @SubscribeMessage('enterGameRoom')
  enterGameRoom(client: Socket, room :string) {
    
    const userTemp: IUser = this.user.getUser(client.id);
    if (this.gameroom.setPlayerB(room, userTemp)) // 방에 사람 추가하기
      client.join(room);
      
    // client
    //   .to(room)
    //   .emit('roomInfo', this.room.getChatRoomInfo(room)); // join leave할때
    return {};
  }

  //a의 이름
  @SubscribeMessage('getGameRoomInfo')
  getGameRoomInfo(client: Socket) {
    return  this.gameroom.getGameRooms();
  }


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
}

// Game

//   getChatRoomInfo
// ->getGameRoomInfo


// enterRoom->
// enterGameRoom
// create-room->
// createGameRoom
// new-room-created
//  -> newGameRoomCreated
// clearRoom->
// clearGameRoom


// player 생성할때 a

// b가 있는 지 없는지
// 있으면 >> 실패 return false
// 없으면 b가 입장 return true

// 옵저버 입장

// 게임 a 만 실행을 할 수 있게! >> start누르면 a인지 확인 맞으면 