import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(@InjectRedis() private readonly redis: Redis) { }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 从请求中获取用户信息（假设已通过认证中间件）
      const user = req['user'];

      if (!user || !user.userId) {
        throw new BadRequestException('用户信息不存在');
      }

      const userId = user.userId;
      const today = new Date().toISOString().split('T')[0]; // 获取今天的日期 YYYY-MM-DD
      const redisKey = `user_create_limit:${userId}:${today}`;

      // 获取今天已创建的数量
      const currentCount = await this.redis.get(redisKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // 检查是否超过限制
      if (count >= 200) {
        throw new BadRequestException('您今天已达到创建限制（200条），请明天再试');
      }

      // 增加计数
      await this.redis.incr(redisKey);

      // 设置过期时间为24小时（86400秒）
      await this.redis.expire(redisKey, 86400);

      next();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('服务器错误，请稍后重试');
    }
  }
}