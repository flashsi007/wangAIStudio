import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtTokenService {
  private readonly secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  constructor(private readonly jwtService: JwtService) { }

  /**
   * 生成JWT token
   * @param payload 用户信息载荷
   * @returns JWT token字符串
   */
  generateToken(payload: any): string {
    try {
      const tokenPayload = {
        sub: payload.userId || payload._id,
        username: payload.username,
        email: payload.email,
        userId: payload.userId || payload._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.expiresIn)
      };

      return jwt.sign(tokenPayload, this.secretKey, {
        algorithm: 'HS256'
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * 验证JWT token
   * @param token JWT token字符串
   * @returns 解码后的用户信息
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * 解码JWT token（不验证签名）
   * @param token JWT token字符串
   * @returns 解码后的信息
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(`Token decode failed: ${error.message}`);
    }
  }

  /**
   * 检查token是否过期
   * @param token JWT token字符串
   * @returns 是否过期
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * 解析过期时间字符串为秒数
   * @param expiresIn 过期时间字符串 (如: '24h', '7d', '30m')
   * @returns 秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));

    switch (timeUnit) {
      case 's': return timeValue;
      case 'm': return timeValue * 60;
      case 'h': return timeValue * 60 * 60;
      case 'd': return timeValue * 24 * 60 * 60;
      default: return 24 * 60 * 60; // 默认24小时
    }
  }

  /**
   * 刷新token
   * @param oldToken 旧的JWT token
   * @returns 新的JWT token
   */
  refreshToken(oldToken: string): string {
    try {
      const decoded = this.verifyToken(oldToken);
      // 移除时间相关字段，重新生成
      const { iat, exp, ...payload } = decoded;
      return this.generateToken(payload);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}