import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  
} from 'typeorm';
import { Role } from '../common/role.enum';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({nullable: true})
  firstName!: string;

  @Column({nullable: true})
  lastName!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ type: 'enum', enum: Role })
  role!: Role;

  @Column({ nullable: true })
  googleId!: string;
    
  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient!: Patient;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctor!: Doctor;
}