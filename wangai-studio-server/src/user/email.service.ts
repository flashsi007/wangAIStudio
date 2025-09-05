import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../llm/redis.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private emailCodeStore = new Map<string, { code: string; expiry: number }>();
  private readonly CODE_EXPIRY_TIME = 5 * 60 * 1000; // 5分钟

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    this.initializeTransporter();
    // 每10分钟清理一次过期的验证码
    setInterval(() => this.cleanExpiredCodes(), 10 * 60 * 1000);
  }

  private initializeTransporter() {
    try {
      const emailHost = this.configService.get<string>('EMAIL_HOST');
      const emailPort = this.configService.get<number>('EMAIL_PORT');
      const email = this.configService.get<string>('EMAIL');
      const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

      if (!emailHost || !emailPort || !email || !emailPassword) {
        this.logger.warn('邮件配置不完整，使用模拟发送器');
        this.transporter = this.createMockTransporter();
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: false, // true for 465, false for other ports
        auth: {
          user: email,
          pass: emailPassword,
        },
      });

      this.logger.log('邮件传输器初始化成功');
    } catch (error) {
      this.logger.error('邮件传输器初始化失败:', error);
      this.transporter = this.createMockTransporter();
    }
  }

  private createMockTransporter(): nodemailer.Transporter {
    return {
      sendMail: async (mailOptions: any) => {
        this.logger.log('模拟发送邮件:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html?.substring(0, 100) + '...',
        });
        return { messageId: 'mock-' + Date.now() };
      },
    } as any;
  }

  /**
   * 生成6位数字验证码
   */
  private generateEmailCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送注册验证码
   */
  async sendRegisterCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const code = this.generateEmailCode();
      const expiry = Date.now() + this.CODE_EXPIRY_TIME;

      // 存储验证码到Redis或内存
      await this.storeEmailCode(email, code, expiry);

      const mailOptions = {
        from: this.configService.get<string>('EMAIL'),
        to: email,
        subject: '注册验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">注册验证码</h2>
            <p style="color: #666; font-size: 16px;">您好！</p>
            <p style="color: #666; font-size: 16px;">您正在注册我们的服务，请使用以下验证码完成注册：</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <span style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">验证码有效期为5分钟，请及时使用。</p>
            <p style="color: #666; font-size: 14px;">如果您没有请求此验证码，请忽略此邮件。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`注册验证码已发送到: ${email}`);
      return { success: true, message: '验证码发送成功' };
    } catch (error) {
      this.logger.error('发送注册验证码失败:', error);
      return this.handleEmailError(error);
    }
  }

  /**
   * 发送密码重置验证码
   */
  async sendPasswordResetCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const code = this.generateEmailCode();
      const expiry = Date.now() + this.CODE_EXPIRY_TIME;

      // 存储验证码到Redis或内存
      await this.storeEmailCode(email, code, expiry);

      const mailOptions = {
        from: this.configService.get<string>('EMAIL'),
        to: email,
        subject: '密码重置验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">密码重置验证码</h2>
            <p style="color: #666; font-size: 16px;">您好！</p>
            <p style="color: #666; font-size: 16px;">您正在重置密码，请使用以下验证码完成操作：</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <span style="font-size: 24px; font-weight: bold; color: #dc3545; letter-spacing: 2px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">验证码有效期为5分钟，请及时使用。</p>
            <p style="color: #666; font-size: 14px;">如果您没有请求密码重置，请忽略此邮件并确保账户安全。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`密码重置验证码已发送到: ${email}`);
      return { success: true, message: '验证码发送成功' };
    } catch (error) {
      this.logger.error('发送密码重置验证码失败:', error);
      return this.handleEmailError(error);
    }
  }

  /**
   * 验证邮件验证码
   */
  async verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const storedData = await this.getEmailCode(email);
      
      if (!storedData) {
        return { success: false, message: '验证码不存在或已过期' };
      }

      if (storedData.code !== code) {
        return { success: false, message: '验证码错误' };
      }

      if (Date.now() > storedData.expiry) {
        await this.deleteEmailCode(email);
        return { success: false, message: '验证码已过期' };
      }

      // 验证成功，删除验证码
      await this.deleteEmailCode(email);
      return { success: true, message: '验证码验证成功' };
    } catch (error) {
      this.logger.error('验证邮件验证码失败:', error);
      return { success: false, message: '验证失败，请重试' };
    }
  }

  /**
   * 存储邮件验证码
   */
  private async storeEmailCode(email: string, code: string, expiry: number): Promise<void> {
    const key = `email_code:${email}`;
    const data = { code, expiry };
    
    try {
      // 尝试存储到Redis
      await this.redisService.set(key, JSON.stringify(data), Math.floor((expiry - Date.now()) / 1000));
    } catch (error) {
      // Redis失败时使用内存存储
      this.logger.warn('Redis存储失败，使用内存存储:', error);
      this.emailCodeStore.set(email, data);
    }
  }

  /**
   * 获取邮件验证码
   */
  private async getEmailCode(email: string): Promise<{ code: string; expiry: number } | null> {
    const key = `email_code:${email}`;
    
    try {
      // 尝试从Redis获取
      const data = await this.redisService.get(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.warn('Redis获取失败，尝试内存获取:', error);
    }
    
    // 从内存获取
    return this.emailCodeStore.get(email) || null;
  }

  /**
   * 删除邮件验证码
   */
  private async deleteEmailCode(email: string): Promise<void> {
    const key = `email_code:${email}`;
    
    try {
      // 尝试从Redis删除
      await this.redisService.del(key);
    } catch (error) {
      this.logger.warn('Redis删除失败:', error);
    }
    
    // 从内存删除
    this.emailCodeStore.delete(email);
  }

  /**
   * 处理邮件发送错误
   */
  private handleEmailError(error: any): { success: boolean; message: string } {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('Invalid login')) {
      return { success: false, message: '邮箱认证失败，请检查邮箱配置' };
    }
    
    if (errorMessage.includes('Connection timeout')) {
      return { success: false, message: '连接超时，请稍后重试' };
    }
    
    if (errorMessage.includes('DNS')) {
      return { success: false, message: 'DNS解析失败，请检查网络连接' };
    }
    
    if (errorMessage.includes('ECONNREFUSED')) {
      return { success: false, message: '连接被拒绝，请检查SMTP服务器配置' };
    }
    
    return { success: false, message: '发送失败，请稍后重试' };
  }

  /**
   * 清理过期的验证码
   */
  private cleanExpiredCodes(): void {
    const now = Date.now();
    for (const [email, data] of this.emailCodeStore.entries()) {
      if (now > data.expiry) {
        this.emailCodeStore.delete(email);
      }
    }
  }
}