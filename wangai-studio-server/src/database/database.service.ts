import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Connection } from 'mongoose';
import Redis from 'ioredis';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async checkMongoConnection(): Promise<boolean> {
    try {
      return this.mongoConnection.readyState === 1;
    } catch (error) {
      console.error('MongoDB connection check failed:', error);
      return false;
    }
  }

  async checkRedisConnection(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis connection check failed:', error);
      return false;
    }
  }

  async getConnectionStatus() {
    const mongoStatus = await this.checkMongoConnection();
    const redisStatus = await this.checkRedisConnection();
    
    return {
      mongodb: {
        connected: mongoStatus,
        readyState: this.mongoConnection.readyState,
        host: this.mongoConnection.host,
        port: this.mongoConnection.port,
        name: this.mongoConnection.name,
      },
      redis: {
        connected: redisStatus,
        status: this.redis.status,
      },
    };
  }
}