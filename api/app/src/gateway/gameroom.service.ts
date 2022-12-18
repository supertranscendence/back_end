import { Injectable } from '@nestjs/common';
import { IGameRoom, IUser } from '../types/types';
import { Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { gameRoom } from './Room';

@Injectable()
export class GameroomService {
  private readonly gameRooms: Map<string, IGameRoom>;

  constructor() {
    this.gameRooms = new Map<string, IGameRoom>();
  }

  allGameRoom() : Map<string, IGameRoom>{
    return this.gameRooms;
  }

  createGameRoom(roomName: string, gameRoom : IGameRoom) :boolean{
      if (this.gameRooms.has(roomName)) {
        return (true);
      }
      else {
        this.gameRooms.set(roomName, gameRoom); 
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
  
  getPlayerAId(room : string) : string {
    if(this.gameRooms.get(room).playerA == null)
      return ""
    else
      return (this.gameRooms.get(room).playerA.client.id);
  } 

  isPlayerA(playerA : string, room : string) : boolean {
    if (this.getPlayerAId(room) == playerA)
      return true;
    else 
      return false;
  }
}
