import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Client } from 'socket.io/dist/client';

export enum UserStatus {
  me,
  login,
  logout,
  ingame,
}

export interface IUser {
  client: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  intra: string;
  nickname?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface IChatRoom {
  id: number;
  name: string;
  pw?: string;
  isPublic: boolean;
  users: Map<string, IUser>;
  muted: IUser[];
  ban: IUser[];
  host: string;
}
