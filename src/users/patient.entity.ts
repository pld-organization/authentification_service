import {
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BloodType } from '../common/BloodGroup.enum';
import { User } from './user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.patient, { cascade: true })
  @JoinColumn()
  user!: User;

  @Column({ nullable: true })
  dateOfBirth!: Date;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ type: 'enum', enum: BloodType })
  bloodType!: BloodType;

  @Column({ nullable: true })
  gender!: string;

}