import { IChatRoom, IGameRoom, IUser } from '../types/types';

export class Room implements IChatRoom {
  admin: string[];
  ban: string[];
  id: number;
  isPublic: boolean;
  muted: string[];
  name: string;
  owner: string;
  pw: string;
  users: Map<string, IUser>;

  constructor(roomName: string, intra: string, isPublic : boolean, pwd?: string) {
    this.admin = [];
    this.ban = [];
    this.id = 0;
    this.isPublic = isPublic;
    this.muted = [];
    this.name = roomName;
    this.owner = intra;
    this.pw = pwd;
    this.users = new Map<string, IUser>();
  }
}

export class gameRoom implements IGameRoom {
  playerA: IUser;
  playerB: IUser;
  observers: Map<string, IUser>;

  constructor(userA : IUser) {
    this.playerA = userA;
    observers: new Map<string, IUser>();
  }
}