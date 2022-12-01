import { OnModuleInit, UseGuards } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server  } from 'socket.io'
import { AuthGuardLocal } from "../auth/auth.guard";
import { UsersService } from "../users/services/users.service";
// import { io } from "socket.io-client";

@WebSocketGateway()
export class MyGateway implements OnModuleInit, OnGatewayDisconnect
{

    constructor (
        private users : UsersService
    ) {}
    @WebSocketServer()
    server: Server;

    onModuleInit() {
        // console.log(this.server);
        this.server.on('connection', (socket) => {
            console.log(socket.id);
            console.log('Connected');
        })
    }


    // handleConnection(client: any) {
    //     console.log('Connected');
    //     console.log(client.id);
    // }

    handleDisconnect(client: any) {
        console.log(client.id);
        console.log('Dissconnected');
    }

    // @UseGuards(AuthGuard)
    // @SubscribeMessage('events')
    // handleEvent(client: Client, data: unknown): WsResponse<unknown> {
    //   const event = 'events';
    //   return { event, data };
    // }

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

    // @SubscribeMessage('yourRoute')
    // async saveUser(client: any, data: any) {
    //     console.log("enter user");
    //     let auth_token = client.handshake.headers.authorization;
    //     // get the token itself without "Bearer"
    //     //   auth_token = auth_token.split(' ')[1];
    //     console.log(auth_token);
    // }
    
    // entity
    // @UseGuards(AuthGuardLocal)
    // @SubscribeMessage('newMessage')
    // async onNewMessage(@MessageBody() intra: string) {
    //     console.log('==========');
    //     console.log(intra);
    //     console.log('==========');
    //     const text = await this.users.findByIntra(intra);

    //     console.log(text);
    //     console.log('==========');
    //     this.server.emit('onMessage', {
    //         msg: 'New Message',
    //         content: intra + 'add database',
    //     })
    // }

    @UseGuards(AuthGuardLocal)
    @SubscribeMessage('sendMessage')
    async sendNewMessage(@MessageBody() intra: string) {
        // const text = await this.users.findByIntra(intra);
        console.log(intra); // body로 받을 수 있다.
        this.server.on('onMessage', (payload : any) => { // 서버의 emit여기서 받아서 출력
            console.log(payload + 'abc'); //여기 부분만 어떻게 하면 좀 될 듯
        })
    }
    // on 은 서버에서 쓸일이 있을까?

    @UseGuards(AuthGuardLocal)
    @SubscribeMessage('letMessage')
    async letNewMessage(@MessageBody() intra: string) {
        // console.log(intra);
        // const text = await this.users.findByIntra(intra);
        // console.log(text);
        // this.server.on('onMessage',(payload : any) => {
        //     console.log(payload);
        // })
        console.log('-----');
        console.log(intra);
        console.log('-----');
        this.server.emit('emitMessage', {
            msg: 'New Message',
            content: await this.users.findByIntra(intra),
        })
    }
}