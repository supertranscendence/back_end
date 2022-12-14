import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from '../auth/auth.service';
import { IChatRoom, IUser, UserStatus } from '../types/types';
import { SUserService } from './socketUser.service';

@Injectable()
export class RoomService {
  // 내부 변수들도 초기화?
  public readonly rooms: Map<string, IChatRoom>;

  constructor(private auth: AuthService) {
    this.rooms = new Map();
  }

  getPublicRooms(socket: any) {
    const charRoomList = [];
    this.rooms.forEach((value, key, map) => {
      charRoomList.push(key);
    });
    return charRoomList; // 배열이 아니라 map으로 리턴
  }

  getAllRoom(): Map<string, IChatRoom> {
    return this.rooms;
  }

  getChatRooms(): { roomName: string; isPublic: boolean; currNum: number }[] {
    const returnRoom: {
      roomName: string;
      isPublic: boolean;
      currNum: number;
    }[] = [];
    for (const [, value] of this.rooms.entries()) {
      const tmp = {
        roomName: value.name,
        isPublic: value.isPublic,
        currNum: value.users.size,
      };
      returnRoom.push(tmp);
    }
    return returnRoom;
  }

  getChatRoomInfo(roomName: string): string[] {
    const tmp: string[] = [];
    this.rooms.get(roomName).users.forEach((e) => {
      tmp.push(e.intra);
    });
    return tmp;
  }

  addRoom(roomname: string, charRoom: IChatRoom): boolean {
    if (this.rooms.has(roomname)) {
      // 있으면 true
      return true;
    } else {
      // 없으면 false
      this.rooms.set(roomname, charRoom);
      return false;
    }
  }

  showRooms(): void {
    console.log('showRooms start............');
    this.rooms.forEach((a) => {
      console.log('this is room name : ', a.name);
      console.log(a);
      // console.log('id     : ', a.id);
      // console.log('name   : ', a.name);
      // console.log('pw     : ', a.pw);
      // console.log('Public : ', a.isPublic);
      // console.log('user   : ', a.users);
      // console.log('user.size   : ', a.users.size);
      // console.log('muted  : ', a.muted);
      // console.log('ban    : ', a.ban);
      // console.log('owner  : ', a.owner);
      // console.log('admin  : ', a.admin);
    });
    console.log('showRooms End............');
  }

  setPublic(roomName: string, isPublic: boolean): void {
    this.rooms.get(roomName).isPublic = isPublic;
  }

  setPW(roomName: string, ps: string): void {
    this.rooms.get(roomName).pw = ps;
  }

  getPW(roomName: string): string {
    return this.rooms.get(roomName).pw;
  }

  getOwenr(roomName: string): string {
    return this.rooms.get(roomName).owner;
  }

  checkAdmin(roomName: string, intraName: string): boolean {
    // this.rooms.get(roomName).admin.forEach(element => {
    //   if (element == intraName)
    //     return true;
    // });
    // return false;

    for (var admin of this.rooms.get(roomName).admin) {
      if (admin == intraName)
        // 있는 사람은 추가 x
        return true;
    }
    return false;
  }

  isInRoomUser(roomName: string, User: string): boolean {
    for (let [key, value] of this.rooms.get(roomName).users.entries()) {
      if (value.intra === User) {
        return true;
      }
    }
    return false;
  }

  setAdmin(roomName: string, intra: string): void {
    this.rooms.get(roomName).admin.forEach((element) => {
      if (element == intra)
        // 있는 사람은 추가 x
        return;
    });
    this.rooms.get(roomName).admin.push(intra);
  }

  // checkMute(roomName: string, intra : string) : boolean {
  //   this.rooms.get(roomName).muted.forEach(element => {
  //     if (element == intra) // 있는 사람은 추가 x
  //       return false;
  //   });
  //   return true;
  // }

  addMuteUser(roomName: string, intra: string): void {
    // this.rooms.get(roomName).muted.forEach(element => {
    //   if (element == intra) // 있는 사람은 추가 x
    //     return ;
    // });
    for (var mutedId of this.rooms.get(roomName).muted) {
      if (mutedId == intra)
        // 있는 사람은 추가 x
        return;
    }
    this.rooms.get(roomName).muted.push(intra);
  }

  rmMuteUser(roomName: string, intra: string): void {
    // for (let i = 0; i < this.rooms.get(roomName).muted.length; i++) {
    //   if(this.rooms.get(roomName).muted[i] === intra)  {
    //     this.rooms.get(roomName).muted.splice(i, 1);
    //     return ;
    //   }
    // }
    const idx = this.rooms.get(roomName).muted.indexOf(intra);
    if (idx > -1) this.rooms.get(roomName).muted.splice(idx, 1);
    return;
  }

  findIDbyIntraId(roomName: string, intra: string): string {
    for (let [key, value] of this.rooms.get(roomName).users) {
      if (value.intra === intra) {
        return key;
      }
    }
    return '';

    // for (var user of this.rooms.get(roomName).users)
    // {
    //   for (var userIntra of user.values())
    //   if (user === intra)
    //   return user.client_id;
    // }
    // return "";

    // this.rooms.get(roomName).users.forEach((ele )=>{
    //   if (ele.intra === intra)
    //     return ele.client_id;
    // })
    // return "";
  }

  rmRoomUser(roomName: string, kickUser: string): void {
    for (let [key, value] of this.rooms.get(roomName).users.entries()) {
      if (value.intra === kickUser) {
        this.rooms.get(roomName).users.delete(key);
      }
    }
    return;
  }

  addBanUser(roomName: string, intra: string): void {
    // this.rooms.get(roomName).ban.forEach(element => {
    //   if (element == intra) // 있는 사람은 추가 x
    //     return ;
    // });
    // this.rooms.get(roomName).ban.push(intra);

    for (var admin of this.rooms.get(roomName).ban) {
      if (admin == intra)
        // 있는 사람은 추가 x
        return;
    }
    this.rooms.get(roomName).ban.push(intra);
  }

  getPublic(roomName: string): boolean {
    return this.rooms.get(roomName).isPublic;
  }

  getRoom(roomName: string): IChatRoom {
    // console.log('getRoom...');
    // for (const room of this.rooms) {
    //   if (this.rooms[intra]) return room[intra];
    //   console.log('getRoom...');
    // }
    // return null;

    return this.rooms.get(roomName);
    // return ()
  }

  getInRoomUser(roomname: string): void {
    // console.log('getInRoomUser');
    console.log(this.rooms.get(roomname).users);
    // return (this.rooms.get(roomname).users);
  }

  getIntraAtToken(socket: Socket): string {
    const intra = this.auth.getIntra(this.auth.extractToken(socket, 'ws'));
    return intra;
  }

  addUser(name: string, user: IUser, client: Socket): void {
    console.log('AddUser');
    this.rooms.get(name).users.set(client.id, user);
  }

  deleteUserBysocketId(socketid: string, room: string) {
    this.rooms.get(room).users.delete(socketid);
  }

  deleteUser(socketid: string) {
    this.rooms.forEach((room) => {
      if (room.users.get(socketid) != null) room.users.delete(socketid);
    });
    // this.rooms.get(room).users.delete(socketid);
  }

  deleteEmptyRoom(room: string) {
    if (this.rooms.get(room).users.size <= 0) this.rooms.delete(room);
  }
}
