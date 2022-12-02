import { OnModuleInit, UseGuards } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket  } from 'socket.io'
import { Client } from "socket.io/dist/client";
import { AuthGuardLocal } from "../auth/auth.guard";
import { UsersService } from "../users/services/users.service";
import { gatewayService } from "./gateway.service";
// import { io } from "socket.io-client";

@WebSocketGateway()
export class MyGateway implements OnModuleInit, OnGatewayDisconnect
{
    constructor (
        private users : UsersService,
        private gatewayService : gatewayService,
    ) {}
    @WebSocketServer()
    server: Server;

    publicRoom = []
    // 여기 방 만드는 부분 수정하기

    // 방 만드는 것 service
    
    // publicRooms(socket: any) {
    //     const publicRoom = [];
    //     const sids = socket.adapter.sids;
    //     const rooms = socket.adapter.rooms;
    //   console.log("rorororoorooom" ,rooms);
    //   rooms.forEach((_: any,key: any)=>{
    //     if (sids.get(key) === undefined){
    //       publicRoom.push(key)
    //     }
    //   });
    // //   console.log('hello');
    //   return publicRoom;
    // }

    // 호스트모듈(프로바이더나 컨트롤러와 같은 컴포넌트를 제공하는 모듈)

    // @UseGuards(AuthGuardLocal)
    onModuleInit() {
        // console.log(this.server);
        this.server.on('connection', (socket) => {
            console.log('onModuleInit');
            console.log("socket.id", socket.id);
        })
    }

    //// 1) ///////////////////////////

    // @SubscribeMessage('getChatRoomInfo')
    // chat(socket: Socket) {
    //     // console.log('aaaaa');
    //     // console.log(socket);
    //     // console.log('aaaaa');
    //      socket.on("getChatRoomInfo",(sr, fx) =>{
    //         console.log(fx);
    //             fx(this.publicRooms(socket)); // 출력
    //         });
    // }

    // // @UseGuards(AuthGuardLocal)
    // // @SubscribeMessage('getChatRoomInfo')
    // // getChatRoom(socket, fx) {
    // //         fx(this.publicRooms(socket));
    // // }

    // // @UseGuards(AuthGuardLocal)
    // @SubscribeMessage('create-room')
    // createRoom(socket: Socket) {
    //      socket.on("create-room", (room,fx) => {
    //             console.log("callll!");
    //             socket.join(room);
    //             console.log(this.publicRooms(socket).length);
    //             console.log(fx);
    //             fx();
    //             socket.emit("new-room-created");
    //         }); // 방에 참가, 새방 생성 되었다
    // }

    // 바보짓 이었다!
    /////////////////////////////////////////////

    // 여기까지
    handleConnection(client: any) {
        console.log('Connected');
        console.log(client.id);
    }

    handleDisconnect(client: any) {
        console.log(client.id);
        console.log('Dissconnected');
    
    }

    // 간단한 Auth
    // @UseGuards(AuthGuard())
    // @SubscribeMessage('events')
    // handleEvent(client: Socket, data: unknown): WsResponse<unknown> {
    //   const event = 'events';
    //   return { event, data };
    // }

    //  token 확인
    // @UseGuards(AuthGuard())
    // @SubscribeMessage('newMessage')
    // onNewMessage(client: any, data: unknown) :WsResponse<unknown> {
    //     console.log('==========');
    //     console.log(data);
    //     console.log('==========');
    //     console.log('==========');
    //     const event = 'onMessage';
    //     return { event, data };
    // }

    // Token 연결확인
    // @SubscribeMessage('yourRoute')
    // async saveUser(client: any, data: any) {
    //     console.log("enter user");
    //     let auth_token = client.handshake.headers.authorization;
    //     // get the token itself without "Bearer"
    //     //   auth_token = auth_token.split(' ')[1];
    //     console.log(auth_token);
    // }
    
    // entity 뽑기
    // @UseGuards(AuthGuardLocal)
    // @SubscribeMessage('newMessage')
    // async onNewMessage(@MessageBody() intra: string) {
    //     console.log('==========');
    //     console.log(intra);
    //     console.log('==========');
    //     const text = await this.users.findByIntra(intra);

    //     console.log(text);
    //     console.log('==========');
    //     this.server.emit('onMessage',{
    //         msg: 'New Message',
    //         content: intra + 'add database',
    //     })
    // }

    // 메세지 받기
    // @UseGuards(AuthGuardLocal)
    // @SubscribeMessage('sendMessage') // 연결과 event listen on과 같은 기능을 한다 emit을 하고 등록을한다
    // async sendNewMessage(@MessageBody() intra: string) {
    //     // const text = await this.users.findByIntra(intra);
    //     console.log(intra); // body로 받을 수 있다.
    //     this.server.on('onMessage', (payload : any) => { // 서버의 emit여기서 받아서 출력
    //         console.log(payload + 'abc'); //여기 부분만 어떻게 하면 좀 될 듯
    //     })
    // }

    // 메세지 받고 보내기
    // @UseGuards(AuthGuardLocal)
    // @SubscribeMessage('letMessage')
    // async letNewMessage(@MessageBody() intra: string) {
    //     // console.log(intra);
    //     // const text = await this.users.findByIntra(intra);
    //     // console.log(text);
    //     // this.server.on('onMessage',(payload : any) => {
    //     //     console.log(payload);
    //     // })
    //     console.log('-----');
    //     console.log(intra);
    //     console.log('-----');
    //     console.log('test');
    //     this.server.emit('emitMessage', {
    //         msg: 'New Message',
    //         content: await this.users.findByIntra(intra),
            
    //     })
    // }


    // 1/////////////////////////////////////////////////////////////

    // socket.on("getChatRoomInfo",(sr, fx) =>{
        // console.log(typeof(fx));
    //     fx(this.publicRooms(socket)); // 출력
    // });
    // socket.on("create-room", (room,fx) => {
    //     console.log(typeof(fx));
    //     console.log("callll!");
    //     socket.join(room);
    //     console.log(this.publicRooms(socket).length);
    //     fx();
    //     socket.emit("new-room-created");
    // }); // 방에 참가, 새방 생성 되었다

    // 2///////////////////////////

    // @SubscribeMessage 데코레이터는 chat 이라는 주소값으로 요청이 들어오면 동작하도록 하는 기능을 담당 합니다.

    // NestJS에서 Gateway로 만든 함수에선 return을 이용해서도 메시지를 전송할 수 있었다.
    // 여기서 return으로 처리가 가능하려면 Client측에서도 콜백함수를 열어줘야한다.
    // callback은 return으로 처리를 한다!

    // @UseGuards(AuthGuardLocal)
    @SubscribeMessage('getChatRoomInfo')
    letAllUsers(client: Socket) {
        const event = 'events';
        // fx(this.publicRooms(client)); // 여기 부분을 어떻게 고치지 >> return으로!
        // return this.publicRooms(client) ; // fx랑 this.publicRooms(clients)를 보내야 될거 같은데
        return (this.gatewayService.publicRooms(client, this.publicRoom)); // return이 callback이다 fx를 보낼 필요가 없다!
    }

    @SubscribeMessage('create-room')
    createroom(client: Socket, room: string) {
        // console.log(typeof(fx));
        console.log('create-room');
        client.join(room);
        // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
        client.emit("new-room-created"); // 다른 이벤트 보내기!
        return {}; // 인자 없는 콜백          
    };


    @SubscribeMessage('newMsg')
    sentMsg(client : Socket, room: string) {
        // console.log(typeof(fx));
        console.log('newMsg');
        client.join(room);
        // console.log(this.gatewayService.publicRooms(client, this.publicRoom).length);
        client.emit("new-room-created"); // 다른 이벤트 보내기!
        return {}; // 인자 없는 콜백          
    };
    // 이것을 기반으로 callback 해결을 해보자 그리고 case 정리해두기!

    /////////////////////////////////////////////////////////////////////////
    
    // this.server.on("create-room", (socket, room,fx) => {
    // socket.on("create-room", (room,fx) => {
    //     console.log('create-room');
    //     socket.join(room);
    //     console.log(this.publicRooms(socket).length);
    //     fx();
    //     socket.emit("new-room-created");
    // }); // 방에 참가, 새방 생성 되었다

    // socket에서 data가져오기
    @UseGuards(AuthGuardLocal)
    @SubscribeMessage('letAllUsers')
    async AllUsers(@MessageBody() intra: string) {
        console.log(intra);
        console.log(this.users.findAll());
        this.server.emit('emitUsers', {
            msg: intra,
            content: await this.users.findAll(),
        })
    }

}