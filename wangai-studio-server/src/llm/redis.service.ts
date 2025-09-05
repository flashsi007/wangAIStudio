import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { OPENAI_CONFIG } from './llm.config';
import { calculateTotalChars } from '../common/utils/token.utils';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取用户的对话历史
   */
  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const key = `${OPENAI_CONFIG.REDIS_KEYS.USER_CHATS}:${userId}`;
      const history = await this.redis.get(key);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('获取对话历史失败:', error);
      return [];
    }
  }

  /**
   * 保存用户的对话历史
   */
  async saveChatHistory(userId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const key = `${OPENAI_CONFIG.REDIS_KEYS.USER_CHATS}:${userId}`;
      
      // 限制历史消息数量
      const limitedMessages = this.limitMessageHistory(messages);
      
      await this.redis.setex(
        key,
        OPENAI_CONFIG.EXPIRATION.USER_CHATS,
        JSON.stringify(limitedMessages)
      );
    } catch (error) {
      console.error('保存对话历史失败:', error);
    }
  }

  /**
   * 添加新消息到对话历史
   */
  async addMessage(userId: string, message: ChatMessage): Promise<ChatMessage[]> {
    const history = await this.getChatHistory(userId);
    history.push(message);
    
    const limitedHistory = this.limitMessageHistory(history);
    await this.saveChatHistory(userId, limitedHistory);
    
    return limitedHistory;
  }

  /**
   * 限制消息历史长度，删除过旧的消息
   * 同时检查字符数限制，确保不超过最大字符数
   */
  private limitMessageHistory(messages: ChatMessage[]): ChatMessage[] {
    const maxLength = OPENAI_CONFIG.MESSAGE.MAX_HISTORY_LENGTH;
    const maxChars = OPENAI_CONFIG.MESSAGE.MAX_HISTORY_CHARS;
    
    // 如果消息数量和字符数都在限制内，直接返回
    if (messages.length <= maxLength && calculateTotalChars(messages) <= maxChars) {
      return messages;
    }

    // 保留系统消息
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    
    // 从最新消息开始，逐步添加直到达到限制
    const result = [...systemMessages];
    let currentChars = calculateTotalChars(systemMessages);
    
    // 从最新的非系统消息开始添加
    for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
      const message = nonSystemMessages[i];
      const messageChars = message.content.length;
      
      // 检查添加这条消息是否会超过限制
      if (currentChars + messageChars <= maxChars && 
          result.length < maxLength) {
        result.splice(-systemMessages.length || result.length, 0, message);
        currentChars += messageChars;
      } else {
        break;
      }
    }
    
    // 确保消息按时间顺序排列
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * 清除用户的对话历史
   */
  async clearChatHistory(userId: string): Promise<void> {
    try {
      const key = `${OPENAI_CONFIG.REDIS_KEYS.USER_CHATS}:${userId}`;
      await this.redis.del(key);
    } catch (error) {
      console.error('清除对话历史失败:', error);
    }
  }

  /**
   * 获取活跃的流式连接
   */
  async getActiveStreams(): Promise<string[]> {
    try {
      const key = OPENAI_CONFIG.REDIS_KEYS.ACTIVE_STREAMS;
      const streams = await this.redis.smembers(key);
      return streams;
    } catch (error) {
      console.error('获取活跃流失败:', error);
      return [];
    }
  }

  /**
   * 添加活跃的流式连接
   */
  async addActiveStream(streamId: string): Promise<void> {
    try {
      const key = OPENAI_CONFIG.REDIS_KEYS.ACTIVE_STREAMS;
      await this.redis.sadd(key, streamId);
      await this.redis.expire(key, OPENAI_CONFIG.EXPIRATION.ACTIVE_STREAMS);
    } catch (error) {
      console.error('添加活跃流失败:', error);
    }
  }

  /**
   * 移除活跃的流式连接
   */
  async removeActiveStream(streamId: string): Promise<void> {
    try {
      const key = OPENAI_CONFIG.REDIS_KEYS.ACTIVE_STREAMS;
      await this.redis.srem(key, streamId);
    } catch (error) {
      console.error('移除活跃流失败:', error);
    }
  }

  /**
   * 获取用户今日已使用的token数量
   */
  async getUserDailyTokenUsage(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
      const key = `${OPENAI_CONFIG.REDIS_KEYS.USER_TOKENS}:${userId}:${today}`;
      const usage = await this.redis.get(key);
      return usage ? parseInt(usage, 10) : 0;
    } catch (error) {
      console.error('获取用户token使用量失败:', error);
      return 0;
    }
  }

  /**
   * 增加用户今日token使用量
   */
  async addUserDailyTokenUsage(userId: string, tokenCount: number): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
      const key = `${OPENAI_CONFIG.REDIS_KEYS.USER_TOKENS}:${userId}:${today}`;
      
      // 增加token使用量
      const newUsage = await this.redis.incrby(key, tokenCount);
      
      // 设置过期时间为明天凌晨（确保数据在第二天被清理）
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const secondsUntilTomorrow = Math.floor((tomorrow.getTime() - Date.now()) / 1000);
      
      await this.redis.expire(key, secondsUntilTomorrow);
      
      return newUsage;
    } catch (error) {
      console.error('增加用户token使用量失败:', error);
      return 0;
    }
  }

  /**
   * 检查用户是否超过每日免费token限制
   */
  async checkUserTokenLimit(userId: string): Promise<{ canUse: boolean; currentUsage: number; limit: number }> {
    try {
      const currentUsage = await this.getUserDailyTokenUsage(userId);
      const freeWordLimit = parseInt(
        this.configService.get<string>('FREE_TOKEN_NUMBER') || '4000',
        10,
      );
      // 将字数限制转换为token限制
      const limit = Math.ceil(freeWordLimit * 1.5);
      
      return {
        canUse: currentUsage < limit,
        currentUsage,
        limit
      };
    } catch (error) {
      console.error('检查用户token限制失败:', error);
      const freeWordLimit = parseInt(
        this.configService.get<string>('FREE_TOKEN_NUMBER') || '4000',
        10,
      );
      return {
        canUse: false,
        currentUsage: 0,
        limit: Math.ceil(freeWordLimit * 1.5)
      };
    }
  }

  /**
   * 检查Redis连接状态
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping 失败:', error);
      return false;
    }
  }

  /**
   * 通用设置键值对（带过期时间）
   */
  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    try {
      if (expireSeconds) {
        await this.redis.setex(key, expireSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error('Redis set 失败:', error);
      throw error;
    }
  }

  /**
   * 通用获取键值
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis get 失败:', error);
      throw error;
    }
  }

  /**
   * 通用删除键
   */
  async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error('Redis del 失败:', error);
      throw error;
    }
  }
}