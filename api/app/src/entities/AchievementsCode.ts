import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity("achievements_code", { schema: "pong" })
export class AchievementsCode {
  @Index(["code"], { unique: true })
  @PrimaryGeneratedColumn({ type: "integer", name: "code" })
  code: number;

  @CreateDateColumn()
  created:Date;

  @Column("timestamp without time zone", { name: "updated", nullable: true })
  updated: Date | null;
}
