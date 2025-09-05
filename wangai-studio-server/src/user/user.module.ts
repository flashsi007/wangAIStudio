import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service'
import { LoginController } from './login.controller';
import { CaptchaService } from './captcha.service';
import { JwtTokenService } from './jwt.service';
import { EmailService } from './email.service';
import { forwardRef } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    forwardRef(() => LlmModule),
  ],
  controllers: [UserController, LoginController],
  providers: [UserService, CaptchaService, JwtTokenService, EmailService],
  exports: [UserService, CaptchaService, JwtTokenService, EmailService],
})
export class UserModule {}