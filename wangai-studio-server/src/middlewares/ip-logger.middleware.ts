import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class IpLoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 从请求中获取用户信息（假设已通过认证中间件）
      const user = req['user'];
      if (user && user.userId) {
        // 获取客户端IP地址
        const clientIP = this.getClientIP(req);
        
        // 更新用户的lastLoginIP
        await this.userModel.findByIdAndUpdate(
          user.userId,
          { lastLoginIP: clientIP },
          { new: true }
        );
      }
      
      next();
    } catch (error) {
      // 记录错误但不阻止请求继续
      console.error('IP记录中间件错误:', error);
      next();
    }
  }

  private getClientIP(req: Request): string {
    // 尝试从各种头部获取真实IP
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const cfConnectingIP = req.headers['cf-connecting-ip'] as string;
    
    if (forwarded) {
      // x-forwarded-for可能包含多个IP，取第一个
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    // 回退到连接的远程地址
    return req.connection.remoteAddress || req.socket.remoteAddress || '未知IP';
  }
}