import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Users} from "./Users";


@Entity("auth" ,{schema:"pong" } )
export  class Auth {

    @Index(["aid",],{ unique:true })
    @PrimaryGeneratedColumn()
    aid?: number;

    @Column()
    act:string;

    @Column()
    res:string | null;

    @ManyToOne(()=>Users,users=>users.auths) // 여기랑 도 맞춰 줘야됨
    @JoinColumn([{ name: "id", referencedColumnName: "id" },
    ])id:number;

}
