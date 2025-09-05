import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LlmModule } from './llm/llm.module';
import { SocketModule } from './socket/socket.module';
import { UserModule } from './user/user.module';
import { TemplateModule } from "./template/template.module";
import { UserTargetModule } from './userTarget/userTarget.module';
import { NovelModule } from './novel/novel.module'
import { PrompterModule } from "./prompter/prompter.module"

import { AuthMiddleware } from './middlewares/auth.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUser = configService.get<string>('MONGO_USER');
        const mongoPass = configService.get<string>('MONGO_PASS');
        const mongoHost = configService.get<string>('MONGO_HOST');
        const mongoPort = configService.get<string>('MONGO_PORT');
        const mongoDb = configService.get<string>('MONGO_DB');

        console.log('MongoDB Config:', { mongoHost, mongoPort, mongoUser, mongoDb });

        return {
          uri: `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}`,
          authSource: 'admin',
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<string>('REDIS_PORT');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        console.log('Redis Config:', { redisHost, redisPort });

        return {
          type: 'single',
          url: `redis://:${redisPassword}@${redisHost}:${redisPort}`,
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    SocketModule,
    LlmModule,
    UserModule,
    TemplateModule,
    UserTargetModule,
    NovelModule,
    PrompterModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'template', method: RequestMethod.ALL },
        { path: 'template/(.*)', method: RequestMethod.ALL },
        { path: 'admin/login', method: RequestMethod.ALL },
      );
  }
}
