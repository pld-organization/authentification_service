import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mysqlConfig from './config/mysql.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mysqlConfig, redisConfig, jwtConfig],
    }),
  ],
})
export class AppModule {}