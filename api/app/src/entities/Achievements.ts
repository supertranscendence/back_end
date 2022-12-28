import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Users} from './Users'


@Entity("achievements" ,{schema:"pong" } )
export  class Achievements {

@PrimaryGeneratedColumn({ type:"integer", name:"tid" })
tid:number;

@Column("integer",{ name:"achievement",nullable:true })
achievement:number | null;

@CreateDateColumn()
created:Date;

@Column("timestamp without time zone",{ name:"updated",nullable:true })
updated:Date | null;

@ManyToOne(()=>Users,users=>users.achievements)
@JoinColumn([{ name: "id", referencedColumnName: "id" },
])id:number;

}
