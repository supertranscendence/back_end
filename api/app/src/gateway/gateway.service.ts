import { Injectable } from '@nestjs/common';
import { IChatRoom, IUser } from '../types/types';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { of } from 'rxjs';

@Injectable()
export class gatewayService {
  private readonly rooms: IChatRoom[];
  private readonly users: IUser[];

  constructor() {
    this.rooms = [];
    this.users = [];
  }

  getRooms(): IChatRoom[] {
    return this.rooms;
  }

  getRoom(intra: string): IChatRoom | null {
    for (const room of this.rooms) {
      if (room.host == intra) return room;
    }
    return null;
  }

  addRoom(room: { host: string; name: string }): void {
    console.log(room);
    this.rooms.push(<IChatRoom>room);
  }

  addUser(user: {
    client: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  }): void {
    console.log(user.client['id']);
    this.users.push(<IUser>user);
  }

  removeUser(id: string) {
    console.log(id);
    this.users.forEach((value, index, array) => {
      if (value.client['id'] == id) delete array[index];
    });
  }

  getUsers(): IUser[] {
    return this.users;
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
