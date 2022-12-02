import { Injectable } from "@nestjs/common";


@Injectable()
export class gatewayService {

    publicRooms(socket: any, publicRoom : any) {
        // const publicRoom = [];
        publicRoom = [];
        const sids = socket.adapter.sids;
        const rooms = socket.adapter.rooms;
      console.log("rorororoorooom" ,rooms);
      rooms.forEach((_: any,key: any)=>{
        if (sids.get(key) === undefined){
          publicRoom.push(key)
            // publicRoom = [...publicRoom, key];
        }
      });
    //   console.log('hello');
      return publicRoom;
    }

}