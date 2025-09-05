import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 配置JSON解析器以支持UTF-8编码
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 启用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 设置全局API前缀
  app.setGlobalPrefix('api');

  // 配置通用静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 启用CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  const allowedOrigins = corsOrigins ? corsOrigins.split(',').map(origin => origin.trim())
    : [
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://192.168.1.3:3001',
      'http://192.168.1.3:3000',
      'https://api.wangai.studio',
      'https://www.wangai.studio'
    ];

  app.enableCors({
    // origin: allowedOrigins,
    origin: (origin, callback) => {
      console.log('Origin:', origin);        // 看看浏览器到底发了什么
      callback(null, true);                  // 全放行，调完再收紧
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
