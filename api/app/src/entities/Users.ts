import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Achievements } from './Achievements';
import { Friends } from './Friends';
import { Auth } from './Auth';

@Entity('users', { schema: 'pong' })
export class Users {
  @Index(['id'], { unique: true })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'intra', nullable: true, length: 20 })
  intra: string | null;

  @Column('character varying', { name: 'nickname', nullable: true, length: 20 })
  nickname: string | null;

  @Column('character varying', { name: 'avatar', nullable: true, length: 500 })
  avatar: string | null;

  @Column('integer', { name: 'level', nullable: true })
  level: number | null;

  @Column('boolean', { name: 'tf', nullable: true, default: false })
  tf: boolean | null;

  @Column('character varying', {
    name: 'verify',
    nullable: true,
    default: false,
    length: 200,
  })
  verify: string | null;

  @Column('character varying', {
    name: 'verify_chk',
    nullable: true,
    default: false,
    length: 200,
  })
  verify_chk: string | null;

  @Column('character varying', { name: 'email', nullable: true, length: 50 })
  email: string | null;

  @CreateDateColumn()
  created: Date;

  @Column('timestamp without time zone', { name: 'updated', nullable: true })
  updated: Date | null;

  @OneToMany(() => Achievements, (achievements) => achievements.id)
  achievements: Achievements[];

  @OneToMany(() => Friends, (friends) => friends.id)
  friends: Friends[];
  // 여기

  @OneToMany(() => Auth, (auths) => auths.id)
  auths: Auth[];
}
