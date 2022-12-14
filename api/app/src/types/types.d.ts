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
  client_id: string;
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
  muted: string[];
  ban: string[];
  owner : string; // 방만든 사람 킥, 밴(킥하고 다시 못들어오게), 뮤트 다른사람에게 
  admin : string[]// 권한을 준사람 킥 밴 뮤트 가능, 오너대상으로는 불가능
}
