import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../user/jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (!token) {
        throw new UnauthorizedException('未提供访问令牌');
      }

      const payload = this.jwtTokenService.verifyToken(token);
      
      if (!payload) {
        throw new UnauthorizedException('无效的访问令牌');
      }

      // 检查是否访问admin路径
      if (req.path.startsWith('/admin')) {
        // 验证是否为配置的admin用户
        const adminUserName = process.env.ADMIN_USER_NAME;
        if (!adminUserName || payload.username !== adminUserName || payload.role !== 'admin') {
          throw new ForbiddenException('无权限访问管理员功能');
        }
      }

      // 将用户信息添加到请求对象中
      req['user'] = payload;
      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('身份验证失败');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}