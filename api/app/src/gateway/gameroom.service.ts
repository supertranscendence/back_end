import { Injectable } from '@nestjs/common';
import { IGameRoom, IUser } from '../types/types';
import { Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@Injectable()
export class GameroomService {
  private readonly gameRooms: Map<string, IGameRoom>;

  constructor() {
    this.gameRooms = new Map<string, IGameRoom>();
  }

  createGameRoom(roomName: string, userA: IUser) :boolean{
      if (this.gameRooms.has(roomName)) {
        return (true);
      }
      else {
        this.gameRooms.set(
          roomName = roomName,
          new (class implements IGameRoom {
            readonly observers: Map<string, IUser>;
            readonly playerA: IUser;
            constructor() {
              this.observers = new Map<string, IUser>();
              this.playerA = userA;
            }
          })(), 
        )
        return (false);
      }
  }

  setPlayerB(roomName: string, user: IUser) : boolean {
    if (this.gameRooms.get(roomName).playerB == null) {
      this.gameRooms.get(roomName).playerB = user;
      return true;
    }
    else
      return false;
  }

  getGameRooms(): { roomName: string; userAname : string }[] {
    const returnGameRoom: {
      roomName: string;
      userAname : string;
    }[] = [];

    for (const [key, value] of this.gameRooms.entries()) {
      const tmp = {
        roomName: key,
        userAname: value.playerA.intra
      };
      returnGameRoom.push(tmp);
    }
    return returnGameRoom;
  }
  // getPlayers(owner: string) {
  //   return this.gameRooms.get(owner).players;
  // }


}
