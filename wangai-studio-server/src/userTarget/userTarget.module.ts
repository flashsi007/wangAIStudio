import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserTargetController } from './userTarget.controller';
import { UserTargetService } from './userTarget.service';
import { UserTarget, UserTargetSchema, WordsLog, WordsLogSchema } from './schemas/userTarget.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { IpLoggerMiddleware } from '../middlewares/ip-logger.middleware';
import { UserModule } from '../user/user.module';
import { RedisService } from '../llm/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTarget.name, schema: UserTargetSchema },
      { name: WordsLog.name, schema: WordsLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  controllers: [UserTargetController],
  providers: [UserTargetService, IpLoggerMiddleware, RedisService],
  exports: [UserTargetService]
})
export class UserTargetModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 为获取今日字数接口添加认证和IP记录中间件
    consumer
      .apply(AuthMiddleware, IpLoggerMiddleware)
      .forRoutes(
        { path: 'user-target/:userId/today-words', method: RequestMethod.GET }
      );
  }
}