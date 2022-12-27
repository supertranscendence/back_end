import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser, UserStatus } from '../types/types';
import { UsersService } from '../users/services/users.service';
import { GameroomService } from './gameroom.service';
import { RoomService } from './room.service';

@Injectable()
export class SUserService {
  private readonly users: Map<string, IUser>;

  constructor(
    private userService: UsersService,
    private room: RoomService,
  ) {
    this.users = new Map();
  }

  addUser(socketId: string, user: IUser): void {
    user.status = 1 // login
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

  isUserName(name: string): boolean {
    for (const [key, values] of this.users) {
      if (values.intra == name) return true;
    }
    return false;
  }


  removeUser(id: string) {
    console.log('removeUser');
    console.log(id);
    this.users.delete(id);
  }

  myFriend(client :Socket) : Promise<string> {
    const intra = this.room.getIntraAtToken(client);
    const stateFriend: {
      friend: string; state: UserStatus; avatar: string; blocked: boolean;
    }[] = [];

    const ret = this.userService.findFriend(intra).then((res) => {
      for (const [key, values] of res.entries()) {
        let ava : string = "";
        this.userService.findByIntra(values.friend).then((res) => {
          if (res && res.avatar)
            ava = res.avatar;
        });
        const temp: { friend: string; state: UserStatus; blocked: boolean; avatar : string} = {
          friend: values.friend, state: 0, blocked: values.block, avatar: ava,
        };
        if (this.isUserName(values.friend)) {
          temp.state = temp.state; //login
        } 
        else {
          temp.state = 2; // logout
        }
        stateFriend.push(temp); // 친구   
      }
      return JSON.stringify(stateFriend);
    });
    return ret;
  }
}
