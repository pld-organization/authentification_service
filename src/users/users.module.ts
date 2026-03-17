import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Patient, Doctor]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}