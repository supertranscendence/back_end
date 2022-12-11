import { OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';
import {
  MessageBody,
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
import { IUser, UserStatus } from '../types/types';
import { IsUppercase } from 'class-validator';

@UseGuards(AuthGuardLocal)
@UseFilters(JWTExceptionFilter)
@WebSocketGateway({
  namespace: 'api/socket',
})
export class MyGateway implements OnModuleInit, OnGatewayDisconnect {
  constructor(
    private room: RoomService,
    private user: SUserService
  ) {}

  @WebSocketServer()
  server: Server;

  //  socket 객체는 개별 클라이언트와의 interacting을 위한 기본적인 객체
  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('onModuleInit');

      console.log('socket.id', socket.id); // 자기 자신
      
      let avatar : string = 'avatar_copy';
      let nickname : string = 'jjjjjjjj';
      let intra : string = 'jji_copy';
      let status : UserStatus = 1;  // 상태로 추가하면 오류!
      let user_copy : IUser = {client :socket.client, avatar, nickname, intra, status}

      this.user.addUser(socket.id, user_copy);
      this.user.getUser(socket.id);
      this.user.getUsers();
    });
  }

  handleDisconnect(client: any) {
    console.log(client.id);
    console.log('Dissconnected start');
    //유저를 제거하고 방에서도 제거
    this.user.removeUser(client.id);
    console.log('Dissconnected');
  }

  // @SubscribeMessage('getChatRoomInfo')
  // letAllUsers(client: Socket) {
  //   const event = 'events';
  //   console.log('getChatRoomINfo~~~');
  //   // fx(this.publicRooms(client)); // 여기 부분을 어떻게 고치지 >> return으로!
  //   // return this.publicRooms(client) ; // fx랑 this.publicRooms(clients)를 보내야 될거 같은데
  //   this.room.showRooms()
  //   return this.room.publicRooms(client); // return이 callback이다 fx를 보낼 필요가 없다!
  // }

  // //   // 방 생성
  //   @SubscribeMessage('create-room')
  //   createroom(client: Socket, room: string) {
  //       console.log('create-room');
        
  //       let host : string = 'host';
  //       let name : string = room;
  //       let users : SUserService[] = [];
  //       let room_dev: { host: string; name: string, users }  = {host, name, users};
  //       console.log('before addRoom');
  //       this.room.showRooms();
  //       this.room.addRoom(room_dev);
  //       console.log('before afterRoom');
  //       this.room.showRooms();

  //       let avatar : string = 'room_avatar_copy';
  //       let nickname : string = 'room_jjjjjjjj';
  //       let intra : string = 'room_jji_copy';
  //       //여기서 user찾는 로직으로 user찾아서 리턴받아서 room에 뿌리기

  //       let a = {avatar, nickname, intra};;
  //       this.room.getRoom(name).users.push(<IUser>a);

  //       this.room.showRooms();        
  //       client.join(room);
  //       // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
  //       client.emit("new-room-created", room); // 다른 이벤트 보내기!
  //       return {}; // 인자 없는 콜백          
  //   };

  // // // @SubscribeMessage('newMsg')
  // // // sentMsg(client : Socket, room: string) {
  // // //     // console.log(typeof(fx));
  // // //     console.log('newMsg');
  // // //     client.join(room);
  // // //     // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
  // // //     client.emit("new-room-created"); // 다른 이벤트 보내기!
  // // //     return {}; // 인자 없는 콜백
  // // // };

  // @SubscribeMessage('newMsg')
  // newmsg(
  //   socket: Socket,
  //   newMsgObj: { room: string; user: string; msg: string },
  // ) {
  //   console.log('newMsg getto', newMsgObj);
  //   socket.to(newMsgObj.room).emit('newMsg', newMsgObj);
  //   return {};
  // }

  // @SubscribeMessage('enterRoom')
  // enterRoom(socket: Socket, joinInfo: { name: string; room: string }) {
  //   socket.join(joinInfo.room);
  //   console.log('jjjjoooin', joinInfo);
  //   // socket.to(joinInfo.room).emit("welcoome" , joinInfo.name);
  //   //룸정보 바꼇어요해줘야함
  //   // socket.emit("new-room-created");
  //   return {};
  // }

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

  // @SubscribeMessage('leaveRoom')
  // leaveRoom(socket: Socket,roomInfo :{room: string}) {
  //   socket.leave(roomInfo.room);
  //   console.log('leave', roomInfo);
  //  여기서 room에서 제거하는 로직
  //   return {};
  // }
  
  // @SubscribeMessage('clearRoom')
  // clearRoom(socket: Socket) {
  //   console.log('clear');
  //   socket.rooms.forEach((ele:any) =>{
  //     if (ele != socket.id)
  //       socket.leave(ele);
  //   })
  // }
}
