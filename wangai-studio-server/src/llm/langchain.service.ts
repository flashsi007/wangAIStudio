import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { OPENAI_CONFIG } from './llm.config';
import { RedisService, ChatMessage } from './redis.service';
import { calculateTotalChars } from '../common/utils/token.utils';

export interface ModelConfig {
  label: string;
  value: string;
  description: string;
  provider: string;
  apiKey?: string;
  configuration?: {
    baseURL?: string;
  };
  temperature?: number;
  streaming?: boolean;
}

@Injectable()
export class LangChainService {
  private modelInstances: Map<string, ChatOpenAI> = new Map();

  constructor(private readonly redisService: RedisService) {
    this.initializeModels();
  }



  /**
   * 初始化所有模型实例
   */
  private initializeModels(): void {
    OPENAI_CONFIG.MODELS.forEach((model) => {
      try {
        const modelConfig = this.getModelConfig(model.value);
        if (modelConfig) {
          // 检查是否为Moonshot/Kimi模型，需要禁用streamUsage
          const isMoonshotModel = model.provider === 'kimi';
          
          const chatModel = new ChatOpenAI({
            modelName: model.value,
            temperature: modelConfig.temperature || 0.7,
            streaming: modelConfig.streaming || true,
            streamUsage: !isMoonshotModel, // Moonshot API不支持stream_options，需要禁用
            apiKey: modelConfig.apiKey,
            configuration: {
              ...modelConfig.configuration,
              // 添加网络超时配置
              timeout: 120000, // 60秒超时
              maxRetries: 3,   // 最大重试次数
            }, 
          });
          this.modelInstances.set(model.value, chatModel);
        }
      } catch (error) {
        console.error(`初始化模型 ${model.value} 失败:`, error);
      }
    });
  }

  /**
   * 获取模型配置
   */
  private getModelConfig(modelValue: string): ModelConfig | null {
    // 从配置中获取模型配置
    const model = OPENAI_CONFIG.MODELS.find(m => m.value === modelValue);
    if (!model) return null;

    // 从配置中获取提供商信息
    const providerConfig = OPENAI_CONFIG.MODEL_PROVIDERS[model.provider];
    if (!providerConfig) {
      console.warn(`未知的模型提供商: ${model.provider}`);
      return null;
    }

    const apiKey = providerConfig.apiKey();
    const baseURL = providerConfig.baseURL();

    if (!apiKey) {
      console.error(`模型 ${modelValue} 缺少 API Key`);
      return null;
    }

    return {
      ...model,
      apiKey,
      configuration: { baseURL },
      temperature: providerConfig.defaultTemperature,
      streaming: providerConfig.supportStreaming,
    };
  }

  /**
   * 获取模型实例
   */
  private getModel(modelValue: string): ChatOpenAI | null {
    return this.modelInstances.get(modelValue) || null;
  }

  /**
   * 将 Redis 消息转换为 LangChain 消息
   */
  private convertToLangChainMessages(messages: ChatMessage[]): BaseMessage[] {
    return messages.map((msg) => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content);
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }

  /**
   * 创建对话链
   */


  private createChatChain(model: ChatOpenAI,  modelValue?: string) {
    // 检查模型是否支持深度思考模式
    const modelConfig = OPENAI_CONFIG.MODELS.find(m => m.value === modelValue);
  
    
    // 根据是否启用深度思考模式选择系统提示词
    let systemPrompt = OPENAI_CONFIG.DEFAULT_SYSTEM_PROMPT;
    
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
    ]);

    const outputParser = new StringOutputParser();

    return RunnableSequence.from([
      prompt,
      model,
      outputParser,
    ]);
  }

  /**
   * 处理对话请求
   */
  async chat(userId: string, message: string, modelValue: string): Promise<string> {
  
    
    try {
      
      // 验证模型
      const model = this.getModel(modelValue);
      if (!model) {
        throw new Error(`不支持的模型: ${modelValue}`);
      }

      // 获取对话历史
      const chatHistory = await this.redisService.getChatHistory(userId);
      
      // 添加系统消息（如果历史为空）
      if (chatHistory.length === 0) {
        await this.redisService.addMessage(userId, {
          role: 'system',
          content: OPENAI_CONFIG.DEFAULT_SYSTEM_PROMPT,
          timestamp: Date.now(),
        });
      }

      // 添加用户消息
      await this.redisService.addMessage(userId, {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      });

      // 获取更新后的历史
      const updatedHistory = await this.redisService.getChatHistory(userId);
      const langchainMessages = this.convertToLangChainMessages(updatedHistory);

      // 创建对话链
      const chain = this.createChatChain(model,   modelValue);

      // 执行对话
      const response = await chain.invoke({
        input: message,
        chat_history: langchainMessages.slice(0, -1), // 排除当前用户消息
      });

      // 保存 AI 回复
      await this.redisService.addMessage(userId, {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      console.error('对话处理失败:', error);
      throw new Error(`对话处理失败: ${error.message}`);
    } 
  }

  /**
   * 流式对话处理
   */
  async *chatStream(userId: string, message: string, modelValue: string): AsyncGenerator<string, void, unknown> {
    // 静默处理token计算错误
 
    
    try {
      // 验证模型
      const model = this.getModel(modelValue);
      if (!model) {
        throw new Error(`不支持的模型: ${modelValue}`);
      }

      // 获取对话历史
      const chatHistory = await this.redisService.getChatHistory(userId);
      
      // 添加系统消息（如果历史为空）
      if (chatHistory.length === 0) {
        await this.redisService.addMessage(userId, {
          role: 'system',
          content: OPENAI_CONFIG.DEFAULT_SYSTEM_PROMPT,
          timestamp: Date.now(),
        });
      }

      // 添加用户消息
      await this.redisService.addMessage(userId, {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      });

      // 获取更新后的历史
      const updatedHistory = await this.redisService.getChatHistory(userId);
      const langchainMessages = this.convertToLangChainMessages(updatedHistory);

      // 创建对话链
      const chain = this.createChatChain(model,  modelValue);

      // 流式执行对话
      const stream = await chain.stream({
        input: message,
        chat_history: langchainMessages.slice(0, -1), // 排除当前用户消息
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk) {
          fullResponse += chunk;
          yield chunk;
        }
      }

      // 保存完整的 AI 回复
      await this.redisService.addMessage(userId, {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('流式对话处理失败:', error);
      throw new Error(`流式对话处理失败: ${error.message}`);
    } 
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels() {
    return OPENAI_CONFIG.MODELS;
  }

  /**
   * 清除用户对话历史
   */
  async clearUserHistory(userId: string): Promise<void> {
    await this.redisService.clearChatHistory(userId);
  }

  /**
   * 获取用户对话历史
   */
  async getUserHistory(userId: string): Promise<ChatMessage[]> {
    return this.redisService.getChatHistory(userId);
  }

  /**
   * 总结历史对话内容
   * @param messages 需要总结的消息列表
   * @param modelValue 使用的模型
   * @returns 总结后的内容
   */
  private async summarizeHistory(messages: ChatMessage[], modelValue: string): Promise<string> {
    try {
      const model = this.getModel(modelValue);
      if (!model) {
        throw new Error(`模型 ${modelValue} 不可用`);
      }

      // 构建总结提示词
      const conversationText = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = `请总结以下对话的关键信息，保留重要的上下文和用户需求，控制在500字以内：\n\n${conversationText}\n\n总结：`;

      const summaryChain = RunnableSequence.from([
        ChatPromptTemplate.fromMessages([
          ['system', '你是一个专业的对话总结助手，能够提取对话中的关键信息和上下文。'],
          ['human', '{input}']
        ]),
        model,
        new StringOutputParser()
      ]);

      const summary = await summaryChain.invoke({ input: summaryPrompt });
      return summary.trim();
    } catch (error) {
      console.error('历史对话总结失败:', error);
      // 如果总结失败，返回简单的截断
      const recentMessages = messages.slice(-5);
      return recentMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content.substring(0, 100)}...`)
        .join('\n');
    }
  }

  /**
   * 使用用户自定义配置的流式对话处理
   * @param userId 用户ID
   * @param message 用户消息
   * @param modelValue 模型名称
   * @param apiKey 用户自定义API密钥
   * @param baseURL 用户自定义API地址
   */
  async *userChatStream(
    userId: string, 
    message: string, 
    modelValue: string, 
    apiKey: string, 
    baseURL: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      // 检查是否为Moonshot/Kimi模型，需要禁用streamUsage
      const isMoonshotModel = modelValue.includes('moonshot') || modelValue.includes('kimi');
      
      // 验证和处理baseURL
      console.log(`用户 ${userId} 传入的参数 - model: ${modelValue}, apiKey: ${apiKey ? apiKey.substring(0, 10) + '...' : 'null'}, baseURL: ${baseURL}`);
      
      let validBaseURL = baseURL;
      if (!baseURL || baseURL.trim() === '') {
        throw new Error('baseURL不能为空');
      }
      
      // 检查是否错误地传入了API key作为baseURL
      if (baseURL.startsWith('sk-') || baseURL.includes('/chat/completions')) {
        throw new Error(`baseURL格式错误，请传入完整的API服务地址（如: https://api.openai.com/v1），当前值: ${baseURL}`);
      }
      
      // 确保baseURL是有效的URL格式
      try {
        // 如果baseURL不是完整的URL，尝试添加协议
        if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
          validBaseURL = `https://${baseURL}`;
        }
        // 验证URL格式
        new URL(validBaseURL);
        console.log(`用户 ${userId} 处理后的baseURL: ${validBaseURL}`);
      } catch (urlError) {
        throw new Error(`无效的baseURL格式: ${baseURL}，错误详情: ${urlError.message}`);
      }
      
      // 创建临时模型实例，使用用户提供的配置
      const userModel = new ChatOpenAI({
        modelName: modelValue,
        temperature: 0.7,
        streaming: true,
        streamUsage: !isMoonshotModel,
        apiKey: apiKey,
        configuration: {
          baseURL: validBaseURL,
          timeout: 120000,
          maxRetries: 3,
        },
      });

      // 获取对话历史
      const chatHistory = await this.redisService.getChatHistory(userId);
      
      // 添加系统消息（如果历史为空）
      if (chatHistory.length === 0) {
        await this.redisService.addMessage(userId, {
          role: 'system',
          content: OPENAI_CONFIG.DEFAULT_SYSTEM_PROMPT,
          timestamp: Date.now(),
        });
      }

      // 添加用户消息
      await this.redisService.addMessage(userId, {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      });

      // 获取更新后的历史
      const updatedHistory = await this.redisService.getChatHistory(userId);
      const langchainMessages = this.convertToLangChainMessages(updatedHistory);

      // 创建对话链
      const chain = this.createChatChain(userModel, modelValue);

      // 流式执行对话
      const stream = await chain.stream({
        input: message,
        chat_history: langchainMessages.slice(0, -1), // 排除当前用户消息
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk) {
          fullResponse += chunk;
          yield chunk;
        }
      }

      // 保存完整的 AI 回复
      await this.redisService.addMessage(userId, {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('用户自定义流式对话处理失败:', error);
      throw new Error(`用户自定义流式对话处理失败: ${error.message}`);
    }
  }

  /**
   * 智能压缩历史对话
   * @param userId 用户ID
   * @param modelValue 使用的模型
   * @param maxHistoryChars 最大历史字符数
   * @returns 压缩后的历史消息
   */
  async compressHistory(userId: string, modelValue: string, maxHistoryChars: number): Promise<ChatMessage[]> {
    try {
      const history = await this.redisService.getChatHistory(userId);
      const totalChars = calculateTotalChars(history);

      // 如果历史长度在限制内，直接返回
      if (totalChars <= maxHistoryChars) {
        return history;
      }

      // 保留系统消息和最近的几条消息
      const systemMessages = history.filter(msg => msg.role === 'system');
      const nonSystemMessages = history.filter(msg => msg.role !== 'system');
      
      // 保留最近的5条消息
      const recentMessages = nonSystemMessages.slice(-5);
      const recentChars = calculateTotalChars([...systemMessages, ...recentMessages]);

      // 如果最近消息已经超过限制，只保留最近的消息
      if (recentChars >= maxHistoryChars) {
        const safeRecentMessages: ChatMessage[] = [];
        let currentChars = calculateTotalChars(systemMessages);
        
        for (let i = recentMessages.length - 1; i >= 0; i--) {
          const msg = recentMessages[i];
          if (currentChars + msg.content.length <= maxHistoryChars) {
            safeRecentMessages.unshift(msg);
            currentChars += msg.content.length;
          } else {
            break;
          }
        }
        
        return [...systemMessages, ...safeRecentMessages];
      }

      // 对需要压缩的历史消息进行总结
      const messagesToSummarize = nonSystemMessages.slice(0, -5);
      if (messagesToSummarize.length > 0) {
        const summary = await this.summarizeHistory(messagesToSummarize, modelValue);
        
        // 创建总结消息
        const summaryMessage: ChatMessage = {
          role: 'assistant',
          content: `[历史对话总结] ${summary}`,
          timestamp: Date.now()
        };

        // 检查总结后的长度是否合适
        const compressedHistory = [...systemMessages, summaryMessage, ...recentMessages];
        const compressedChars = calculateTotalChars(compressedHistory);
        
        if (compressedChars <= maxHistoryChars) {
          // 保存压缩后的历史到Redis
          await this.redisService.saveChatHistory(userId, compressedHistory);
          return compressedHistory;
        }
      }

      // 如果总结后仍然超长，只保留系统消息和最近的消息
      return [...systemMessages, ...recentMessages.slice(-3)];
    } catch (error) {
      console.error('历史对话压缩失败:', error);
      // 压缩失败时，返回原始历史的截断版本
      const history = await this.redisService.getChatHistory(userId);
      const systemMessages = history.filter(msg => msg.role === 'system');
      const nonSystemMessages = history.filter(msg => msg.role !== 'system');
      return [...systemMessages, ...nonSystemMessages.slice(-3)];
    }
  }
}