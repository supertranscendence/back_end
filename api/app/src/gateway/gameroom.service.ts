import { Injectable } from '@nestjs/common';
import { IGameRoom } from '../types/types';
import { Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@Injectable()
export class GameroomService {
  private readonly gameRooms: Map<string, IGameRoom>;

  constructor() {
    this.gameRooms = new Map<string, IGameRoom>();
  }

  createGameRoom(owner: string, client: Socket) {
    console.log(
      this.gameRooms.set(
        owner,
        new (class implements IGameRoom {
          readonly observers: Socket[];
          readonly players: Socket[];

          constructor() {
            this.players = [];
            this.observers = [];
          }
        })(),
      ),
    );
  }

  setPlayer(owner: string, client: Socket) {
    this.gameRooms.get(owner).players.push(client);
  }

  getPlayers(owner: string) {
    return this.gameRooms.get(owner).players;
  }
}
