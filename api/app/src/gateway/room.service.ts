import { Injectable } from "@nestjs/common";
import { Client } from "socket.io/dist/client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IChatRoom, IUser, UserStatus } from "../types/types";
import { SUserService } from "./socketUser.service";

@Injectable()
export class RoomService implements IChatRoom{

    id: number;
    name: string;
    pw: string;
    isPublic: boolean;
    users: IUser[];
    muted: IUser[];
    ban: IUser[];
    host: string;

    // 내부 변수들도 초기화?
    public readonly rooms: RoomService[];
    constructor (
      public USER : SUserService
      ) {
        this.rooms = [];
        // this.users = [];
        this.muted = [];
        this.ban = [];
    }

    getUsers(name: string) : IUser[] {
      return this.users;
    }
  

    getUser(name: string) : IUser {
      for (const user of this.users) {
        if (user.intra == name) {
          return user;
        console.log('getRoom...');
      }
      return null;
    }
  }
    showRooms() : void {
      console.log('showRooms............');
        this.rooms.forEach(a => {
            console.log(a.id);
            console.log(a.name);
            console.log(a.pw);
            console.log(a.users);
            // a.users.forEach(b=> {
            //   console.log(b.intra);
            // })
            console.log(a.ban);
            console.log(a.host);
        })
        console.log('showRooms............');
    }

    getRooms(): IChatRoom[] {
        console.log(this.rooms[0].host);
        console.log(this.rooms[0].name);
        return this.rooms;
      }
    
      getRoom(intra: string): RoomService | null {
        console.log('getRoom...');
        for (const room of this.rooms) {
          if (room.name == intra) return room;
          console.log('getRoom...');
        }
        return null;
      }
    
      addRoom(room: { host: string; name: string }): void {
        this.rooms.push(<RoomService>room);
      }

      addpeople(name: string,user: {
        avatar:string,
        client: Client<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        nickname: string,
        intra: string,}) {
        let a = this.getRoom(name);
        // a.users.push(<IUser>user);
      }
      
      publicRooms(socket: any) {
        // const publicRoom = [];
        // publicRoom = [];
        const sids = socket.adapter.sids;
        const room_copy = socket.adapter.rooms;
        console.log('rorororoorooom', room_copy);
        room_copy.forEach((_: any, key: any) => {
          if (sids.get(key) === undefined) {
            this.rooms.push(key);
            // publicRoom = [...publicRoom, key];
          }
        });
        //   console.log('hello');
        return this.rooms;
      }




}