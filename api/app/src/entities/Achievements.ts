import {Column,Entity,JoinColumn,ManyToOne,PrimaryGeneratedColumn} from "typeorm";
import {Users} from './Users'


@Entity("achievements" ,{schema:"pong" } )
export  class Achievements {

@PrimaryGeneratedColumn({ type:"integer", name:"tid" })
tid:number;

@Column("integer",{ name:"achievement",nullable:true })
achievement:number | null;

@Column("timestamp without time zone",{ name:"created",nullable:true })
created:Date | null;

@Column("timestamp without time zone",{ name:"updated",nullable:true })
updated:Date | null;

@ManyToOne(()=>Users,users=>users.achievements)
@JoinColumn([{ name: "id", referencedColumnName: "id" },
])userid:Users;

}
