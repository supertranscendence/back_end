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

  addUser(socketId: string, user: IUser): void {
    this.users.set(socketId, user);
  }

  getUsers(): Map<string, IUser> {
    return this.users;
  }

  getUser(socketId: string): IUser {
    return this.users.get(socketId);
  }

  isUser(socketId: string): boolean {
    for (const [key, _] of this.users) {
      if (socketId == key) return true;
    }
    return false;
  }

  removeUser(id: string) {
    console.log('removeUser');
    console.log(id);
    this.users.delete(id);
  }
}
