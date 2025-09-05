import { OPENAI_CONFIG } from './llm.config';
import { ChatDto,UserChatDto} from './dto/chat.dto';
import { Controller, Get, Post, Body, Query, Param, Res, HttpException, HttpStatus, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { LangChainService } from './langchain.service';
import { RedisService } from './redis.service';
import { estimateTokensFromMessage, calculateTotalChars, isInputTooLong, calculateSafeHistoryLength, wordsToTokens } from '../common/utils/token.utils';

// 并发控制管理器
class ConcurrencyManager {
  private activeRequests = new Map<string, { startTime: number; userId: string; model: string }>();
  private requestQueue: Array<{ resolve: Function; reject: Function; userId: string; requestId: string }> = [];
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 启动定期清理任务
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredRequests();
    }, OPENAI_CONFIG.CONCURRENCY.CLEANUP_INTERVAL);
  }

  // 获取请求许可
  async acquirePermission(userId: string): Promise<string> {
    const requestId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      // 检查是否可以立即处理
      if (this.activeRequests.size < OPENAI_CONFIG.CONCURRENCY.MAX_CONCURRENT_REQUESTS) {
        this.activeRequests.set(requestId, {
          startTime: Date.now(),
          userId,
          model: 'unknown'
        });
        resolve(requestId);
        return;
      }

      // 检查队列是否已满
      if (this.requestQueue.length >= OPENAI_CONFIG.CONCURRENCY.QUEUE_MAX_SIZE) {
        reject(new Error('请求队列已满，请稍后重试'));
        return;
      }

      // 加入队列
      this.requestQueue.push({ resolve, reject, userId, requestId });

      // 设置超时
      setTimeout(() => {
        const index = this.requestQueue.findIndex(item => item.requestId === requestId);
        if (index !== -1) {
          this.requestQueue.splice(index, 1);
          reject(new Error('请求超时，请重试'));
        }
      }, OPENAI_CONFIG.CONCURRENCY.REQUEST_TIMEOUT);
    });
  }

  // 释放请求许可
  releasePermission(requestId: string) {
    this.activeRequests.delete(requestId);
    this.processQueue();
  }

  // 处理队列中的下一个请求
  private processQueue() {
    if (this.requestQueue.length > 0 && this.activeRequests.size < OPENAI_CONFIG.CONCURRENCY.MAX_CONCURRENT_REQUESTS) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        this.activeRequests.set(nextRequest.requestId, {
          startTime: Date.now(),
          userId: nextRequest.userId,
          model: 'unknown'
        });
        nextRequest.resolve(nextRequest.requestId);
      }
    }
  }

  // 清理过期请求
  private cleanupExpiredRequests() {
    const now = Date.now();
    const expiredRequests: string[] = [];

    for (const [requestId, request] of this.activeRequests.entries()) {
      if (now - request.startTime > OPENAI_CONFIG.CONCURRENCY.REQUEST_TIMEOUT) {
        expiredRequests.push(requestId);
      }
    }

    expiredRequests.forEach(requestId => {
      this.activeRequests.delete(requestId);
    });

    if (expiredRequests.length > 0) {
      console.log(`清理了 ${expiredRequests.length} 个过期请求`);
      this.processQueue();
    }
  }

  // 获取当前状态
  getStatus() {
    return {
      activeRequests: this.activeRequests.size,
      queuedRequests: this.requestQueue.length,
      maxConcurrent: OPENAI_CONFIG.CONCURRENCY.MAX_CONCURRENT_REQUESTS,
      queueMaxSize: OPENAI_CONFIG.CONCURRENCY.QUEUE_MAX_SIZE,
    };
  }

  // 停止指定用户的所有活跃请求
  stopUserRequests(userId: string): string[] {
    const stoppedRequestIds: string[] = [];

    // 停止活跃请求
    for (const [requestId, requestInfo] of this.activeRequests.entries()) {
      if (requestInfo.userId === userId) {
        this.activeRequests.delete(requestId);
        stoppedRequestIds.push(requestId);
        console.log(`停止用户 ${userId} 的活跃请求: ${requestId}`);
      }
    }

    // 从队列中移除该用户的等待请求
    const originalQueueLength = this.requestQueue.length;
    this.requestQueue = this.requestQueue.filter(item => {
      if (item.userId === userId) {
        item.reject(new Error('请求已被用户停止'));
        stoppedRequestIds.push(item.requestId);
        console.log(`从队列中移除用户 ${userId} 的请求: ${item.requestId}`);
        return false;
      }
      return true;
    });

    if (stoppedRequestIds.length > 0) {
      // 处理队列中的下一个请求
      this.processQueue();
    }

    return stoppedRequestIds;
  }

  // 停止指定的请求
  stopRequest(requestId: string): boolean {
    // 检查是否在活跃请求中
    if (this.activeRequests.has(requestId)) {
      const requestInfo = this.activeRequests.get(requestId);
      this.activeRequests.delete(requestId);
      console.log(`停止活跃请求: ${requestId}, 用户: ${requestInfo?.userId}`);
      this.processQueue();
      return true;
    }

    // 检查是否在队列中
    const queueIndex = this.requestQueue.findIndex(item => item.requestId === requestId);
    if (queueIndex !== -1) {
      const queueItem = this.requestQueue[queueIndex];
      this.requestQueue.splice(queueIndex, 1);
      queueItem.reject(new Error('请求已被停止'));
      console.log(`从队列中移除请求: ${requestId}, 用户: ${queueItem.userId}`);
      return true;
    }

    return false;
  }

  // 获取用户的活跃请求
  getUserActiveRequests(userId: string): string[] {
    const userRequests: string[] = [];
    for (const [requestId, requestInfo] of this.activeRequests.entries()) {
      if (requestInfo.userId === userId) {
        userRequests.push(requestId);
      }
    }
    return userRequests;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}


/**
 * @description 功能归纳总结- 下一步计划
 * 
 * 已完成的输入长度限制优化功能：
 * 1. 配置管理：在llm.config.ts中添加了INPUT_LIMITS配置，包括单条消息和总输入长度限制
 * 2. 工具函数：在token.utils.ts中扩展了字符长度计算、输入长度检查等工具函数
 * 3. 历史消息管理：
 *    - RedisService.limitMessageHistory：添加了总字符数检查和动态历史截断
 *    - LangChainService.compressHistory：实现了智能历史消息压缩和总结功能
 * 4. 输入预检查：在chatStream方法中添加了完整的输入长度验证和自动压缩调用
 * 5. 错误处理：当输入超限时自动调用历史压缩，失败时使用备选截断方案
 * 
 * 核心流程：
 * 用户输入 → 长度检查 → 超限时自动压缩历史 → 模型调用 → 响应生成
 * 
 * 下一步计划：
 * - 添加更精确的token计算（基于具体模型的tokenizer）
 * - 实现分段总结策略，提高长对话的上下文保持能力
 * - 添加用户自定义历史保留策略配置
 * - 优化压缩算法，保留更多关键信息
 */

@Controller('chat')
export class LlmController implements OnModuleDestroy {
  private concurrencyManager: ConcurrencyManager;

  constructor(
    private readonly langChainService: LangChainService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.concurrencyManager = new ConcurrencyManager();
  }

  // 销毁时清理资源
  onModuleDestroy() {
    this.concurrencyManager.destroy();
  }

  /**
   * 获取可用模型列表
   */
  @Get('models')
  async getModels() {
    try {
      const availableModels = this.langChainService.getAvailableModels();
      return {
        status: 'success',
        data: availableModels,
        message: '获取模型列表成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: '获取模型列表失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @deprecated 已弃用 请使用 /chat/stream 接口进行流式对话 
   * 普通对话接口（非流式） 
   */
  @Post()
  async chat(@Body() body: ChatDto) {
    try {
      // // 调试：检查原始请求体  
      // const { userId, message, model } = body;

      // // 参数验证
      // if (!userId || !message || !model) {
      //   throw new HttpException(
      //     {
      //       status: 'error',
      //       message: OPENAI_CONFIG.ERROR_MESSAGES.MISSING_REQUIRED_PARAMS,
      //     },
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      // // 验证模型是否支持
      // const supportedModels = OPENAI_CONFIG.MODELS.map(m => m.value);
      // if (!supportedModels.includes(model)) {
      //   throw new HttpException(
      //     {
      //       status: 'error',
      //       message: OPENAI_CONFIG.ERROR_MESSAGES.UNSUPPORTED_MODEL,
      //       supportedModels,
      //     },
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      // // 估算输入token数量
      // const inputTokens = estimateTokensFromMessage(message);

      // // 处理对话
      // const response = await this.langChainService.chat(userId, message, model);

      // // 估算输出token数量
      // const outputTokens = estimateTokensFromMessage(response);
      // const totalTokens = inputTokens + outputTokens;

      // // 记录token使用量
      // const newUsage = await this.redisService.addUserDailyTokenUsage(userId, totalTokens);
      // const freeWordLimit = parseInt(
      //   this.configService.get<string>('FREE_TOKEN_NUMBER') || '4000',
      //   10,
      // );
      // const dailyLimit = wordsToTokens(freeWordLimit);

      // return {
      //     status: 'success',
      //     data: {
      //       response,
      //       userId,
      //       model,
      //       timestamp: Date.now(),
      //       tokenUsage: {
      //         inputTokens,
      //         outputTokens,
      //         totalTokens,
      //         dailyUsage: newUsage,
      //         dailyLimit: dailyLimit
      //       }
      //     },
      //     message: '对话成功',
      //   };
    } catch (error) {
      // console.error('对话处理失败:', error);

      // if (error instanceof HttpException) {
      //   throw error;
      // }

      // throw new HttpException(
      //    {
      //      status: 'error',
      //      message: OPENAI_CONFIG.ERROR_MESSAGES.GENERATION_ERROR,
      //      error: error.message,
      //    },
      //    HttpStatus.INTERNAL_SERVER_ERROR,
      //  );
    }
  }

  /**
   * 流式对话接口
   */
  @Post('stream')
  async chatStream(@Body() body: ChatDto, @Res() res: Response) {
    let requestId: string | null = null;

    try {
      const { userId, message, model } = body;

      // 参数验证
      if (!userId || !message || !model) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: OPENAI_CONFIG.ERROR_MESSAGES.MISSING_REQUIRED_PARAMS,
        });
      }

      // 验证模型是否支持
      const supportedModels = OPENAI_CONFIG.MODELS.map(m => m.value);
      if (!supportedModels.includes(model)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: OPENAI_CONFIG.ERROR_MESSAGES.UNSUPPORTED_MODEL,
          supportedModels,
        });
      }

      // 输入长度预检查
      const currentMessageLength = message.length;
      const systemPromptLength = OPENAI_CONFIG.DEFAULT_SYSTEM_PROMPT.length;

      // 检查单条消息长度
      if (isInputTooLong(currentMessageLength, OPENAI_CONFIG.INPUT_LIMITS.MAX_SINGLE_MESSAGE_LENGTH)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: `单条消息长度超过限制，最大允许 ${OPENAI_CONFIG.INPUT_LIMITS.MAX_SINGLE_MESSAGE_LENGTH} 字符，当前 ${currentMessageLength} 字符`,
        });
      }

      // 获取历史消息并检查总长度
      try {
        const history = await this.redisService.getChatHistory(userId);
        const historyLength = calculateTotalChars(history);
        const totalInputLength = currentMessageLength + historyLength + systemPromptLength;

        if (isInputTooLong(totalInputLength, OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH)) {
          // 计算安全的历史长度限制
          const safeHistoryLength = calculateSafeHistoryLength(
            OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH,
            currentMessageLength,
            systemPromptLength,
            OPENAI_CONFIG.INPUT_LIMITS.SAFETY_BUFFER
          );

          if (safeHistoryLength <= 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              status: 'error',
              message: `当前消息过长，无法处理。消息长度: ${currentMessageLength}，最大允许: ${OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH - systemPromptLength - OPENAI_CONFIG.INPUT_LIMITS.SAFETY_BUFFER}`,
            });
          }

          console.log(`用户 ${userId} 输入总长度超限，正在自动压缩历史消息。总长度: ${totalInputLength}，限制: ${OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH}`);

          try {
            // 调用历史消息压缩功能
            await this.langChainService.compressHistory(userId, model, safeHistoryLength);
            console.log(`用户 ${userId} 历史消息压缩完成`);
          } catch (compressionError) {
            console.error(`用户 ${userId} 历史消息压缩失败:`, compressionError.message);
            // 压缩失败时，使用Redis的saveChatHistory来触发历史消息限制
            const currentHistory = await this.redisService.getChatHistory(userId);
            await this.redisService.saveChatHistory(userId, currentHistory);
          }
        }
      } catch (historyError) {
        console.warn(`获取用户 ${userId} 历史消息失败:`, historyError.message);
        // 历史消息获取失败不阻止请求，继续处理
      }

      // 获取并发控制许可
      try {
        requestId = await this.concurrencyManager.acquirePermission(userId);
        console.log(`用户 ${userId} 获得请求许可，请求ID: ${requestId}`);
      } catch (concurrencyError) {
        console.log(`并发控制拒绝请求: ${concurrencyError.message}`);
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          status: 'error',
          message: concurrencyError.message,
          data: {
            concurrencyStatus: this.concurrencyManager.getStatus(),
            retryAfter: '请稍后重试'
          }
        });
      }

      // 估算输入token数量
      const inputTokens = estimateTokensFromMessage(message);

      // 设置流式响应头
      Object.entries(OPENAI_CONFIG.STREAMING_RESPONSE.HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // 生成流式响应
      const streamId = `${userId}_${Date.now()}`;
      await this.redisService.addActiveStream(streamId);

      let responseContent = '';
      try {
        for await (const chunk of this.langChainService.chatStream(userId, message, model)) {
          if (chunk) {
            responseContent += chunk;
            res.write(chunk);
            // 强制发送缓冲区中的数据
            if (res.flushHeaders) {
              res.flushHeaders();
            }
          }
        }

        // 估算输出token数量并记录使用量
        const outputTokens = estimateTokensFromMessage(responseContent);
        const totalTokens = inputTokens + outputTokens;
        await this.redisService.addUserDailyTokenUsage(userId, totalTokens);

        res.end();
        console.log(`用户 ${userId} 流式对话完成，请求ID: ${requestId}`);
      } finally {
        await this.redisService.removeActiveStream(streamId);
      }
    } catch (error) {
      console.error('流式对话处理失败:', error);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: OPENAI_CONFIG.ERROR_MESSAGES.GENERATION_ERROR,
          error: error.message,
        });
      } else {
        res.write(`\n\n${OPENAI_CONFIG.ERROR_MESSAGES.GENERATION_ERROR}`);
        res.end();
      }
    } finally {
      // 释放并发控制许可
      if (requestId) {
        this.concurrencyManager.releasePermission(requestId);
        console.log(`释放请求许可，请求ID: ${requestId}`);
      }
    }
  }

  /**
   * 用户自建AI应用的流式对话接口
   */
  @Post('userChatStream')
  async userChat(@Body() userChatDto: UserChatDto, @Res() res: Response) {
    let requestId: string | null = null;
    
    try {
      const { userId, model, key, message, api } = userChatDto;

      // 参数验证
      if (!userId || !message || !model || !key || !api) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: '缺少必填参数：userId、message、model、key、api 都不能为空',
        });
      }

      // 输入长度预检查
      const currentMessageLength = message.length;
      const systemPromptLength = OPENAI_CONFIG.DEFAULT_SYSTEM_PROMPT.length;

      // 检查单条消息长度
      if (isInputTooLong(currentMessageLength, OPENAI_CONFIG.INPUT_LIMITS.MAX_SINGLE_MESSAGE_LENGTH)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: `单条消息长度超过限制，最大允许 ${OPENAI_CONFIG.INPUT_LIMITS.MAX_SINGLE_MESSAGE_LENGTH} 字符，当前 ${currentMessageLength} 字符`,
        });
      }

      // 获取历史消息并检查总长度
      try {
        const history = await this.redisService.getChatHistory(userId);
        const historyLength = calculateTotalChars(history);
        const totalInputLength = currentMessageLength + historyLength + systemPromptLength;

        if (isInputTooLong(totalInputLength, OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH)) {
          // 计算安全的历史长度限制
          const safeHistoryLength = calculateSafeHistoryLength(
            OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH,
            currentMessageLength,
            systemPromptLength,
            OPENAI_CONFIG.INPUT_LIMITS.SAFETY_BUFFER
          );

          if (safeHistoryLength <= 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              status: 'error',
              message: `当前消息过长，无法处理。消息长度: ${currentMessageLength}，最大允许: ${OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH - systemPromptLength - OPENAI_CONFIG.INPUT_LIMITS.SAFETY_BUFFER}`,
            });
          }

          console.log(`用户 ${userId} 输入总长度超限，正在自动压缩历史消息。总长度: ${totalInputLength}，限制: ${OPENAI_CONFIG.INPUT_LIMITS.MAX_TOTAL_INPUT_LENGTH}`);

          try {
            // 调用历史消息压缩功能
            await this.langChainService.compressHistory(userId, model, safeHistoryLength);
            console.log(`用户 ${userId} 历史消息压缩完成`);
          } catch (compressionError) {
            console.error(`用户 ${userId} 历史消息压缩失败:`, compressionError.message);
            // 压缩失败时，使用Redis的saveChatHistory来触发历史消息限制
            const currentHistory = await this.redisService.getChatHistory(userId);
            await this.redisService.saveChatHistory(userId, currentHistory);
          }
        }
      } catch (historyError) {
        console.warn(`获取用户 ${userId} 历史消息失败:`, historyError.message);
        // 历史消息获取失败不阻止请求，继续处理
      }

      // 获取并发控制许可
      try {
        requestId = await this.concurrencyManager.acquirePermission(userId);
        console.log(`用户 ${userId} 获得请求许可，请求ID: ${requestId}`);
      } catch (concurrencyError) {
        console.log(`并发控制拒绝请求: ${concurrencyError.message}`);
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          status: 'error',
          message: concurrencyError.message,
          data: {
            concurrencyStatus: this.concurrencyManager.getStatus(),
            retryAfter: '请稍后重试'
          }
        });
      }

      // 设置流式响应头
      Object.entries(OPENAI_CONFIG.STREAMING_RESPONSE.HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // 生成流式响应
      const streamId = `${userId}_${Date.now()}`;
      await this.redisService.addActiveStream(streamId);

      try {
        for await (const chunk of this.langChainService.userChatStream(userId, message, model, key, api)) {
          if (chunk) {
            res.write(chunk);
            // 强制发送缓冲区中的数据
            if (res.flushHeaders) {
              res.flushHeaders();
            }
          }
        }

        res.end();
        console.log(`用户 ${userId} 自建应用流式对话完成，请求ID: ${requestId}`);
      } finally {
        await this.redisService.removeActiveStream(streamId);
      }
    } catch (error) {
      console.error('用户自建应用流式对话处理失败:', error);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: OPENAI_CONFIG.ERROR_MESSAGES.GENERATION_ERROR,
          error: error.message,
        });
      } else {
        res.write(`\n\n${OPENAI_CONFIG.ERROR_MESSAGES.GENERATION_ERROR}`);
        res.end();
      }
    } finally {
      // 释放并发控制许可
      if (requestId) {
        this.concurrencyManager.releasePermission(requestId);
        console.log(`释放请求许可，请求ID: ${requestId}`);
      }
    }
  }

  /**
   * 获取用户token使用情况
   */
  @Get('token-usage/:userId')
  async getTokenUsage(@Param('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          {
            status: 'error',
            message: OPENAI_CONFIG.ERROR_MESSAGES.INVALID_USER_ID,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const tokenCheck = await this.redisService.checkUserTokenLimit(userId);
      const today = new Date().toISOString().split('T')[0];

      // 将token转换为字数用于显示
      const currentUsageWords = Math.floor(tokenCheck.currentUsage / 1.5);
      const dailyLimitWords = Math.floor(tokenCheck.limit / 1.5);
      const remainingWords = Math.max(0, dailyLimitWords - currentUsageWords);

      return {
        status: 'success',
        data: {
          userId,
          date: today,
          currentUsage: tokenCheck.currentUsage,
          currentUsageWords,
          dailyLimit: tokenCheck.limit,
          dailyLimitWords,
          remainingTokens: Math.max(0, tokenCheck.limit - tokenCheck.currentUsage),
          remainingWords,
          usagePercentage: Math.round((tokenCheck.currentUsage / tokenCheck.limit) * 100),
          canUse: tokenCheck.canUse,
          resetTime: '明日凌晨重置'
        },
        message: '获取token使用情况成功',
      };
    } catch (error) {
      console.error('获取token使用情况失败:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: '获取token使用情况失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取用户对话历史
   */
  @Get('history/:userId')
  async getChatHistory(@Param('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          {
            status: 'error',
            message: OPENAI_CONFIG.ERROR_MESSAGES.INVALID_USER_ID,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const history = await this.langChainService.getUserHistory(userId);
      return {
        status: 'success',
        data: {
          userId,
          history,
          count: history.length,
        },
        message: '获取对话历史成功',
      };
    } catch (error) {
      console.error('获取对话历史失败:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: '获取对话历史失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 清除用户对话历史
   */
  @Get('clear/:userId')
  async clearChatHistory(@Param('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          {
            status: 'error',
            message: OPENAI_CONFIG.ERROR_MESSAGES.INVALID_USER_ID,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.langChainService.clearUserHistory(userId);
      return {
        status: 'success',
        data: {
          userId,
          clearedAt: new Date().toISOString(),
        },
        message: '清除对话历史成功',
      };
    } catch (error) {
      console.error('清除对话历史失败:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: 'error',
          message: '清除对话历史失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 健康检查接口
   */
  @Get('health')
  async healthCheck() {
    try {
      const redisStatus = await this.redisService.ping();
      const activeStreams = await this.redisService.getActiveStreams();
      const concurrencyStatus = this.concurrencyManager.getStatus();

      return {
        status: 'success',
        data: {
          server: 'running',
          redis: redisStatus ? 'connected' : 'disconnected',
          activeStreams: activeStreams.length,
          concurrency: concurrencyStatus,
          models: OPENAI_CONFIG.MODELS.length,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version
        },
        message: '服务状态正常',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: '健康检查失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取并发控制状态
   */
  @Get('concurrency-status')
  async getConcurrencyStatus() {
    try {
      const status = this.concurrencyManager.getStatus();
      return {
        status: 'success',
        data: {
          ...status,
          config: {
            maxConcurrent: OPENAI_CONFIG.CONCURRENCY.MAX_CONCURRENT_REQUESTS,
            queueMaxSize: OPENAI_CONFIG.CONCURRENCY.QUEUE_MAX_SIZE,
            requestTimeout: OPENAI_CONFIG.CONCURRENCY.REQUEST_TIMEOUT,
            cleanupInterval: OPENAI_CONFIG.CONCURRENCY.CLEANUP_INTERVAL
          },
          timestamp: Date.now()
        },
        message: '获取并发控制状态成功'
      };
    } catch (error) {
      console.error('获取并发控制状态失败:', error);
      throw new HttpException(
        {
          status: 'error',
          message: '获取并发控制状态失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 停止用户的所有生成请求
   */
  @Post('stop/:userId')
  async stopUserGeneration(@Param('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          {
            status: 'error',
            message: '用户ID不能为空',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const stoppedRequestIds = this.concurrencyManager.stopUserRequests(userId);

      // 同时清理Redis中的活跃流
      const activeStreams = await this.redisService.getActiveStreams();
      const userStreams = activeStreams.filter(streamId => streamId.startsWith(`${userId}_`));

      for (const streamId of userStreams) {
        await this.redisService.removeActiveStream(streamId);
      }

      return {
        status: 'success',
        data: {
          userId,
          stoppedRequestIds,
          stoppedStreams: userStreams,
          totalStopped: stoppedRequestIds.length
        },
        message: stoppedRequestIds.length > 0
          ? `成功停止用户 ${userId} 的 ${stoppedRequestIds.length} 个生成请求`
          : `用户 ${userId} 当前没有活跃的生成请求`,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: '停止生成请求失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 停止指定的生成请求
   */
  @Post('stop-request/:requestId')
  async stopSpecificRequest(@Param('requestId') requestId: string) {
    try {
      if (!requestId) {
        throw new HttpException(
          {
            status: 'error',
            message: '请求ID不能为空',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const stopped = this.concurrencyManager.stopRequest(requestId);

      return {
        status: 'success',
        data: {
          requestId,
          stopped
        },
        message: stopped
          ? `成功停止请求 ${requestId}`
          : `请求 ${requestId} 未找到或已完成`,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: '停止指定请求失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取用户的活跃请求列表
   */
  @Get('active-requests/:userId')
  async getUserActiveRequests(@Param('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          {
            status: 'error',
            message: '用户ID不能为空',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const activeRequestIds = this.concurrencyManager.getUserActiveRequests(userId);
      const activeStreams = await this.redisService.getActiveStreams();
      const userStreams = activeStreams.filter(streamId => streamId.startsWith(`${userId}_`));

      return {
        status: 'success',
        data: {
          userId,
          activeRequestIds,
          activeStreams: userStreams,
          totalActive: activeRequestIds.length
        },
        message: '获取用户活跃请求成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: '获取用户活跃请求失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
