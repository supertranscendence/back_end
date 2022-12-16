import { Injectable } from '@nestjs/common';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IGame } from '../types/types';
import type { Socket as RawSocket } from 'engine.io';
import { Socket } from 'socket.io';

@Injectable()
export class SGameService {
  private readonly games: Map<number, IGame>;
  private gameId: number;

  constructor() {
    this.games = new Map();
    this.gameId = 1;
  }

  startGame(clients: Socket[]) {
    const [A, B] = clients;
    this.games[this.gameId] = { A: A, B: B };
    A.emit('getGameId', { gameId: this.gameId });
    B.emit('getGameId', { gameId: this.gameId });
    return this.gameId++;
  }

  setLocation(gameInfo: {
    gameId: number;
    player: string;
    location: number;
  }): void {
    const { gameId, player, location } = gameInfo;
    const target = player == 'A' ? this.games[gameId].B : this.games[gameId].A;
    target.emit('setLocation_' + player, { location: location });
  }
}
