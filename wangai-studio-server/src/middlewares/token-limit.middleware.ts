import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../llm/redis.service';
import { ConfigService } from '@nestjs/config';
import { wordsToTokens, estimateTokensFromMessage, getWordCountFromMessage } from '../common/utils/token.utils';

@Injectable()
export class TokenLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req['user']?.userId;
      if (!userId) {
        throw new BadRequestException('用户未认证');
      }

      // 获取每日免费字数限制（FREE_TOKEN_NUMBER实际表示字数）
      const freeWordLimit = parseInt(
        this.configService.get<string>('FREE_TOKEN_NUMBER') || '4000',
        10,
      );

      // 将字数限制转换为token限制
      const freeTokenLimit = wordsToTokens(freeWordLimit);

      // 获取用户今日已使用的token数量
      const usedTokens = await this.redisService.getUserDailyTokenUsage(userId);

      // 将已使用的token转换为字数用于显示
      const usedWords = Math.floor(usedTokens / 1.5);

      // 检查是否已超过限制
      if (usedTokens >= freeTokenLimit) {
        return res.send(`每日免费字数限制${freeWordLimit}字，已使用${usedWords}字，超出限制。`);
      }

      // 估算当前请求的token消耗（从请求体中获取message长度）
      const body = req.body;
      const message = body?.message || body?.messages?.[0]?.content || '';
      const estimatedTokens = estimateTokensFromMessage(message);
      const estimatedWords = getWordCountFromMessage(message);

      // 检查本次请求是否会超过限制
      if (usedTokens + estimatedTokens > freeTokenLimit) {
        return res.send(`本次请求预计消耗${estimatedWords}字，将超过每日限制。当前已使用约${usedWords}/${freeWordLimit}字`);


      }

      next();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Token限制中间件错误:', error);
      throw new BadRequestException('Token限制检查失败');
    }
  }
}