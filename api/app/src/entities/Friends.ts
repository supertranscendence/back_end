import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';

@Entity('friends', { schema: 'pong' })
export class Friends {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'tid' })
  tid: number;

  @Column('character varying', { name: 'intra', nullable: true, length: 20 })
  intra: string | null;

  @Column('character varying', { name: 'friend', nullable: true, length: 20 })
  friend: string | null;

  @Column('boolean', { name: 'block', nullable: true })
  block: boolean | null;

  @CreateDateColumn()
  created: Date;

  @Column('timestamp without time zone', { name: 'updated', nullable: true })
  updated: Date | null;

  @ManyToOne(() => Users, (users) => users.friends) // 여기랑 도 맞춰 줘야됨
  @JoinColumn([{ name: 'id', referencedColumnName: 'id' }])
  id: number;
}
