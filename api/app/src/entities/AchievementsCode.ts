import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("achievements_code", { schema: "pong" })
export class AchievementsCode {
  @Index(["code"], { unique: true })
  @PrimaryGeneratedColumn({ type: "integer", name: "code" })
  code: number;

  @Column("timestamp without time zone", { name: "created", nullable: true })
  created: Date | null;

  @Column("timestamp without time zone", { name: "updated", nullable: true })
  updated: Date | null;
}
