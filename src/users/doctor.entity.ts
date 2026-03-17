import {
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.doctor, { cascade: true })
  @JoinColumn()
  user!: User;

  @Column()
  speciality!: string;

  @Column({ nullable: true })
  establishment!: string;

}