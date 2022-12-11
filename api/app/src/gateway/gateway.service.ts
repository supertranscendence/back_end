// import { ConsoleLogger, Injectable } from '@nestjs/common';
// import { IChatRoom, IUser } from '../types/types';
// import { Client } from 'socket.io/dist/client';
// import { DefaultEventsMap } from 'socket.io/dist/typed-events';
// import { of } from 'rxjs';

// @Injectable()
// export class gatewayService {
//   private readonly rooms: IChatRoom[];
//   private readonly users: IUser[];

//   constructor() {
//     this.rooms = []; // 방
//     this.users = []; // 소켓
//   }

//   getRooms(): IChatRoom[] {
//     return this.rooms;
//   }

//   getRoom(intra: string): IChatRoom | null {
//     for (const room of this.rooms) {
//       if (room.host == intra) return room;
//     }
//     return null;
//   }

//   addRoom(room: { host: string; name: string }): void {
    
//     console.log('before push');
//     console.log(this.getRooms());

//     this.rooms.push(<IChatRoom>room);
    
//     console.log('afterRoom');
//     console.log(this.getRooms());


//     // id: number;
//     // name: string;
//     // pw: string;
//     // isPublic: boolean;
//     // users: IUser[];
//     // muted: IUser[];
//     // ban: IUser[];
//     // host: string;
//   }

//   addUser(user: {
//     client: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
//   }): void {
//     console.log('addUser');
//     console.log(user.client['id']); // 한사람의 정보
//     this.users.push(<IUser>user);
//     console.log('====');
//     console.log(this.getUsers());
//     console.log('====');
//   }

//   removeUser(id: string) {
//     console.log(id);
//     this.users.forEach((value, index, array) => {
//       if (value.client['id'] == id) delete array[index];
//     });
//   }

//   getUsers(): IUser[] {
//     return this.users;
//   }

//   publicRooms(socket: any, publicRoom: any) {
//     // const publicRoom = [];
//     publicRoom = [];
//     const sids = socket.adapter.sids;
//     const rooms = socket.adapter.rooms;
//     console.log('rorororoorooom', rooms);
//     rooms.forEach((_: any, key: any) => {
//       if (sids.get(key) === undefined) {
//         publicRoom.push(key);
//         // publicRoom = [...publicRoom, key];
//       }
//     });
//     //   console.log('hello');
//     return publicRoom;
//   }
// }
