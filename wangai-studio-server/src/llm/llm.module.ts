
import { Module, NestModule, MiddlewareConsumer, RequestMethod, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmController } from './llm.controller';
import { LangChainService } from './langchain.service';
import { RedisService } from './redis.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TokenLimitMiddleware } from '../middlewares/token-limit.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule), ConfigModule],
  controllers: [LlmController],
  providers: [LangChainService, RedisService, AuthMiddleware, TokenLimitMiddleware],
  exports: [LangChainService, RedisService],
})
export class LlmModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 为LLM对话接口添加认证和token限制中间件
    consumer
      .apply(AuthMiddleware, TokenLimitMiddleware)
      .forRoutes(
        { path: 'chat', method: RequestMethod.POST },
        { path: 'chat/stream', method: RequestMethod.POST }
      );
  }
}