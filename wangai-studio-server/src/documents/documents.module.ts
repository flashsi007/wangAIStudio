import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController, ChildrenController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentStructure, DocumentSchema } from './schemas/document.schema';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentStructure.name, schema: DocumentSchema },
    ]),
    UserModule,
  ],
  controllers: [DocumentsController, ChildrenController],
  providers: [DocumentsService, RateLimitMiddleware],
  exports: [DocumentsService],
})
export class DocumentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 为创建文档接口添加认证和限流中间件
    consumer
      .apply(AuthMiddleware, RateLimitMiddleware)
      .forRoutes(
        { path: 'documents', method: RequestMethod.POST },
        { path: 'documents/children', method: RequestMethod.POST }
      );
  }
}