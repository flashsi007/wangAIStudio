
import { Prompter, PrompterSchema } from './schemas/prompter.schema';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrompterController } from './prompter.controller';
import { PrompterService } from './prompter.service';

import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';

import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Prompter.name, schema: PrompterSchema }]),
        UserModule
    ],
    controllers: [PrompterController],
    providers: [
        PrompterService,
        RateLimitMiddleware
    ],
})
export class PrompterModule {
    configure(consumer: MiddlewareConsumer) {
        // 整个 novel 模块需要登录认证
        consumer.apply(AuthMiddleware).forRoutes(PrompterController);

        // 为 createPrompter 接口单独添加限流中间件
        consumer.apply(RateLimitMiddleware).forRoutes(
            { path: 'prompter/createPrompter', method: RequestMethod.POST }
        );
    }
}