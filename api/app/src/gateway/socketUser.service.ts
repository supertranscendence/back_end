import { Injectable } from '@nestjs/common';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser, UserStatus } from '../types/types';

@Injectable()
export class SUserService {
  private readonly users: Map<string, IUser>;
  constructor() {
    this.users = new Map();
  }

  addUser(socketid: string, user: IUser): void {
    this.users.set(socketid, user);
  }

  getUsers(): void {
    console.log('getUsers');
    this.users.forEach((value, id) => {
      console.log(`user : ${value.intra}, id: ${id} 입니다`);
      //console.log(value);
    });
    console.log('getUsers End');
  }

  getUser(socketid: string): IUser {
    console.log('getUser............');
    // console.log(this.users.get(socketid));
    console.log('getUser............');
    return this.users.get(socketid);
  }

  removeUser(id: string) {
    console.log('removeUser');
    console.log(id);
    this.users.delete(id);
  }
}
