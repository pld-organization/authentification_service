import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SessionService implements OnModuleInit {

  private client!: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'redis';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    console.log(`Connecting to Redis at ${host}:${port}`);

    this.client = createClient({
      socket: {
        host,
        port,
      },
    }) as RedisClientType;

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await this.client.connect();
    console.log('Redis connected successfully');
  }

  async createSession(
    userId: string,
    data: object,
    ttl: number = 604800,
  ): Promise<void> {
    console.log(`Creating session for userId: ${userId}`);
    await this.client.setEx(
      `session:${userId}`,
      ttl,
      JSON.stringify(data),
    );
    console.log(`Session created for userId: ${userId}`);
  }

  async getSession(userId: string): Promise<any | null> {
    const data = await this.client.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId: string): Promise<void> {
    console.log(`Deleting session for userId: ${userId}`);
    await this.client.del(`session:${userId}`);
    console.log(`Session deleted for userId: ${userId}`);
  }

  async sessionExists(userId: string): Promise<boolean> {
    const exists = await this.client.exists(`session:${userId}`);
    console.log(`Session exists for userId ${userId}: ${exists === 1}`);
    return exists === 1;
  }
}