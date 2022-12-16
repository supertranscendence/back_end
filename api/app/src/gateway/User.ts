import { IUser, UserStatus } from '../types/types';
import { Socket } from 'socket.io';

export class User implements IUser {
  client: Socket;
  intra: string;
  nickname?: string;
  avatar?: string;
  status?: UserStatus;

  constructor(client: Socket, intra: string) {
    this.client = client;
    this.intra = intra;
    this.nickname = '';
    this.avatar = '';
    this.status = 1;
  }
}
