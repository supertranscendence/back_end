import {Column,Entity,Index,OneToMany,PrimaryGeneratedColumn} from "typeorm";
import {Achievements} from './Achievements'
import {Friends} from './Friends'


@Entity("users" ,{schema:"pong" } )
export  class Users {
    
@Index(["id",],{ unique:true })
@PrimaryGeneratedColumn({ type:"integer", name:"id" })
id:number;

@Column("character varying",{ name:"intra",nullable:true,length:20 })
intra:string | null;

@Column("character varying",{ name:"nickname",nullable:true,length:20 })
nickname:string | null;

@Column("character varying",{ name:"avatar",nullable:true,length:500 })
avatar:string | null;

@Column("integer",{ name:"level",nullable:true })
level:number | null;

@Column("timestamp without time zone",{ name:"created",nullable:true })
created:Date | null;

@Column("timestamp without time zone",{ name:"updated",nullable:true })
updated:Date | null;

@OneToMany(()=>Achievements,achievements=>achievements.userid)


achievements:Achievements[];

@OneToMany(()=>Friends,friends=>friends.userid)


friends:Friends[];
// 여기

}
