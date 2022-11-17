import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";


@Entity("game", { schema: "pong" })
export class Game {
  @Index(["id"], { unique: true })
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "player", nullable: true, length: 40 })
  player: string | null;

  @Column("character varying", { name: "score", nullable: true, length: 7 })
  score: string | null;

  @Column("timestamp without time zone", { name: "created", nullable: true })
  created: Date | null;

  @Column("timestamp without time zone", { name: "updated", nullable: true })
  updated: Date | null;
}
