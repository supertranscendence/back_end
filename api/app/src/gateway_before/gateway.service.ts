import { ConsoleLogger, Injectable } from '@nestjs/common';
import { IChatRoom, IUser } from '../types/types';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { of } from 'rxjs';

@Injectable()
export class gatewayService {
  private readonly rooms: IChatRoom[];
  private readonly users: IUser[];

  constructor() {
    this.rooms = []; // 방
    this.users = []; // 소켓
  }

  publicRooms(socket: any, publicRoom: any) {
    // const publicRoom = [];
    publicRoom = [];
    const sids = socket.adapter.sids;
    const rooms = socket.adapter.rooms;
    console.log('rorororoorooom', rooms);
    rooms.forEach((_: any, key: any) => {
      if (sids.get(key) === undefined) {
        publicRoom.push(key);
        // publicRoom = [...publicRoom, key];
      }
    });
    //   console.log('hello');
    return publicRoom;
  }
}
