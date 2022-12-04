import { OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthGuardLocal } from '../auth/auth.guard';
import { UsersService } from '../users/services/users.service';
import { gatewayService } from './gateway.service';
import { from, map, Observable } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';
import { JWTExceptionFilter } from '../exception/jwt.filter';

@UseGuards(AuthGuardLocal)
@UseFilters(JWTExceptionFilter)
@ApiTags('ws')
@WebSocketGateway({
  namespace: 'api/socket',
})
export class MyGateway implements OnModuleInit, OnGatewayDisconnect {
  constructor(
    private users: UsersService,
    private gatewayService: gatewayService,
  ) {}

  @WebSocketServer()
  server: Server;

  publicRoom = [];

  // handleConnection(client: any) {
  //   console.log('Connected');
  //   console.log(client.id);
  // }

  onModuleInit() {
    // console.log(this.server);
    this.server.on('connection', (socket) => {
      console.log('onModuleInit');
      console.log('socket.id', socket.id);
      console.log(socket.client.request.headers.authorization);
    });
  }

  handleDisconnect(client: any) {
    console.log(client.id);
    console.log('Dissconnected');
  }

  @SubscribeMessage('getChatRoomInfo')
  letAllUsers(client: Socket) {
    const event = 'events';
    // fx(this.publicRooms(client)); // 여기 부분을 어떻게 고치지 >> return으로!
    // return this.publicRooms(client) ; // fx랑 this.publicRooms(clients)를 보내야 될거 같은데
    return this.gatewayService.publicRooms(client, this.publicRoom); // return이 callback이다 fx를 보낼 필요가 없다!
  }

  @SubscribeMessage('create-room')
  createroom(client: Socket, room: string) {
    // console.log(typeof(fx));
    console.log('create-room');
    client.join(room);
    // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
    client.emit('new-room-created'); // 다른 이벤트 보내기!
    return {}; // 인자 없는 콜백
  }

  @SubscribeMessage('newMsg')
  sentMsg(client: Socket, room: string) {
    // console.log(typeof(fx));
    console.log('newMsg');
    client.join(room);
    // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
    client.emit('new-room-created'); // 다른 이벤트 보내기!
    return {}; // 인자 없는 콜백
  }

  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    console.log('take');
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  // socket에서 data가져오기
  @UseGuards(AuthGuardLocal)
  @SubscribeMessage('letAllUsers')
  async AllUsers(@MessageBody() intra: string) {
    console.log(intra);
    console.log(await this.users.findAll());
    this.server.emit('emitUsers', {
      msg: intra,
      content: await this.users.findAll(),
    });
  }
}
