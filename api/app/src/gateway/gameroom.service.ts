import { Injectable } from '@nestjs/common';
import { IGameRoom, IUser } from '../types/types';
import { Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { gameRoom } from './Room';
import { Queue } from './Queue';

@Injectable()
export class GameroomService {
  private readonly gameRooms: Map<string, IGameRoom>;
  private readonly queue: Queue;

  constructor() {
    this.gameRooms = new Map<string, IGameRoom>();
    this.queue = new Queue();
  }

  getQueue(): Queue {
    return this.queue;
  }

  allGameRoom(): Map<string, IGameRoom> {
    return this.gameRooms;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////
  createGameRoom(roomName: string, gameRoom: IGameRoom): boolean {
    if (this.gameRooms.has(roomName)) {
      return true;
    } else {
      this.gameRooms.set(roomName, gameRoom);
      return false;
    }
  }

  setPlayerB(roomName: string, user: IUser): boolean {
    if (!this.gameRooms.get(roomName).playerB) { // 방에 없어요
      this.gameRooms.get(roomName).playerB = user;
      return true;
    } else return false;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////

  getGameRooms(): { roomName: string; userAname: string }[] {
    const returnGameRoom: {
      roomName: string;
      userAname: string;
    }[] = [];

    for (const [key, value] of this.gameRooms.entries()) {
      const tmp = {
        roomName: key,
        userAname: value.playerA.intra,
      };
      returnGameRoom.push(tmp);
    }
    return returnGameRoom;
  }

  getPlayerAId(room: string): string {
    if (this.gameRooms.get(room).playerA == null) return '';
    else return this.gameRooms.get(room).playerA.client.id;
  }

  isPlayerA(playerA: string, room: string): boolean {
    if (this.getPlayerAId(room) == playerA) return true;
    else return false;
  }

  getPlayerBId(room: string): string {
    if (this.gameRooms.get(room).playerB == null) return '';
    else return this.gameRooms.get(room).playerB.client.id;
  }

  isPlayerB(playerB: string, room: string): boolean {
    if (this.getPlayerBId(room) == playerB) return true;
    else return false;
  }

  deleteRoom(room: string): void {
    
    this.gameRooms.get(room).playerA = null;
    this.gameRooms.get(room).playerB = null;
    this.gameRooms.get(room).observers.forEach(element => {
      element = null;
    })
    this.gameRooms.get(room).observers = null;
    this.gameRooms.delete(room);
  }

  deletePlayer(room: string): void {
    this.gameRooms.get(room).playerB = null;
  }
}
