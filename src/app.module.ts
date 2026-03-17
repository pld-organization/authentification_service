import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SessionModule } from './session/session.module';
import mysqlConfig from './config/mysql.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import { User } from './users/user.entity';
import { Patient } from './users/patient.entity';
import { Doctor } from './users/doctor.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mysqlConfig, redisConfig, jwtConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('mysql.host'),
        port: configService.get<number>('mysql.port'),
        username: configService.get<string>('mysql.username'),
        password: configService.get<string>('mysql.password'),
        database: configService.get<string>('mysql.database'),
        entities: [User, Patient, Doctor],
        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    SessionModule,
  ],
})
export class AppModule {}