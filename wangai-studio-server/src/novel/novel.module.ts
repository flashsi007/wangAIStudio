import { NovelSchema, Novel, NovelInfo, Node, ChildNode, Stats, NovelNode, NovelNodeSchema } from './schemas/novel.schema';
import { novelService } from "./novel.service"
import { NovelController } from './novel.controller';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserModule } from '../user/user.module';
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Novel.name, schema: NovelSchema },
            { name: NovelNode.name, schema: NovelNodeSchema },
        ]),
        UserModule,
    ],
    controllers: [NovelController],
    providers: [novelService, RateLimitMiddleware],
    exports: [
        novelService,

    ],
})
export class NovelModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // 整个 novel 模块需要登录认证
        consumer.apply(AuthMiddleware).forRoutes(NovelController);

        // 为 createCharacter 接口单独添加限流中间件
        consumer.apply(RateLimitMiddleware).forRoutes(
            { path: 'novel/createCharacter', method: RequestMethod.POST },
            { path: 'novel/createNovel', method: RequestMethod.POST }
        );
    }
}

