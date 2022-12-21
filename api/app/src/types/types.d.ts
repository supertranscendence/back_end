import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Client } from 'socket.io/dist/client';
import { Socket } from 'socket.io';

export enum UserStatus {
  me,
  login,  // 1
  logout, // 2
  ingame, // 3
}

export interface IUser {
  client: Socket;
  intra: string;
  nickname?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface IGameRoom {
  playerA: IUser;
  playerB: IUser;
  observers: Map<string, IUser>;
  roomState: boolean;
}

export interface IGame {
  A: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  B: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  score?: string;
  roomState: boolean;
}

export interface IChatRoom {
  id: number;
  name: string;
  pw?: string;
  isPublic: boolean;
  users: Map<string, IUser>;
  muted: string[];
  ban: string[];
  owner: string; // 방만든 사람 킥, 밴(킥하고 다시 못들어오게), 뮤트 다른사람에게
  admin: string[]; // 권한을 준사람 킥 밴 뮤트 가능, 오너대상으로는 불가능
}
