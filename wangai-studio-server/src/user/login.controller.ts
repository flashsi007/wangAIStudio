import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CaptchaService } from './captcha.service';
import { JwtTokenService } from './jwt.service';
import { EmailService } from './email.service';
import { LoginDto, RegisterDto, SendEmailCodeDto, ForgotPasswordDto, GenerateCaptchaDto, ChangePasswordDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly emailService: EmailService,
  ) { }

  // 生成图片验证码
  @Get('captcha')
  async generateCaptcha() {
    try {
      const captchaKey = this.captchaService.generateKey();
      const captcha = this.captchaService.createCaptcha(captchaKey);

      return {
        success: true,
        message: '获取验证码成功',
        data: captcha,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('生成验证码失败:', error);
      throw new BadRequestException('生成验证码失败');
    }
  }

  // 用户登录
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      const { email, password, captchaKey, captchaAnswer } = loginDto;

      if (!email || !password) {
        throw new BadRequestException('邮箱和密码不能为空');
      }

      // 验证验证码
      if (!captchaKey || !captchaAnswer) {
        throw new BadRequestException('请提供验证码');
      }

      const captchaResult = this.captchaService.verifyCaptcha(captchaKey, captchaAnswer);
      if (!captchaResult.valid) {
        throw new BadRequestException(captchaResult.message);
      }

      // 验证用户
      const user = await this.userService.validateUser(email, password);
      if (!user) {
        throw new UnauthorizedException('邮箱或密码错误');
      }

      // 生成JWT token
      const safeUser = user.toSafeObject();
      const tokenPayload = {
        userId: user._id,
        username: user.userName,
        email: user.email
      };
      const token = this.jwtTokenService.generateToken(tokenPayload);

      return {
        success: true,
        message: '登录成功',
        data: {
          user: {
            ...safeUser,
           email: user.email
          },
          token: token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('登录失败:', error);
      throw new BadRequestException('登录失败');
    }
  }

  // 发送注册验证码
  @Post('send-register-code')
  async sendRegisterCode(@Body() sendEmailCodeDto: SendEmailCodeDto) {
    try {
      const { email, type } = sendEmailCodeDto;

      // 检查邮箱是否已存在（仅注册时检查）
      if (type === 'register') {
        const existingUser = await this.userService.getUserByEmail(email);
        if (existingUser) {
          throw new ConflictException('该邮箱已被注册');
        }
      }

      // 发送邮件验证码
      const emailResult = type === 'register'
        ? await this.emailService.sendRegisterCode(email)
        : await this.emailService.sendPasswordResetCode(email);

      if (!emailResult.success) {
        throw new BadRequestException(emailResult.message);
      }

      return {
        success: true,
        message: '验证码发送成功',
        data: {
          email: email,
          expiresIn: 300 // 5分钟过期
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('发送验证码失败:', error);
      throw new BadRequestException('发送验证码失败');
    }
  }


  /**
   * @description 用户注册
   * @param registerDto 
   * @returns 
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const { userName, email, password, emailCode } = registerDto;

      // 验证邮件验证码
      const verifyResult = await this.emailService.verifyEmailCode(email, emailCode);
      if (!verifyResult.success) {
        throw new BadRequestException(verifyResult.message);
      }

      // 创建用户数据
      const createUserDto: CreateUserDto = { userName, email, password };

      const newUser = await this.userService.createUser(createUserDto);

      return {
        success: true,
        message: '注册成功',
        data: newUser,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('注册失败:', error);
      throw new BadRequestException('注册失败');
    }
  }

  // 忘记密码
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email, newPassword, emailCode } = forgotPasswordDto;

      // 检查用户是否存在
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      // 验证邮件验证码
      const verifyResult = await this.emailService.verifyEmailCode(email, emailCode);
      if (!verifyResult.success) {
        throw new BadRequestException(verifyResult.message);
      }

      // 重置密码
      const updatedUser = await this.userService.resetPasswordByEmail(email, newPassword);
      if (!updatedUser) {
        throw new BadRequestException('密码重置失败');
      }

      return {
        success: true,
        message: '密码重置成功',
        data: {
          email: email
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('重置密码失败:', error);
      throw new BadRequestException('重置密码失败');
    }
  }

  // 修改密码
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      const { email, newPassword, emailCode } = changePasswordDto;

      // 检查用户是否存在
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      // 验证邮件验证码
      const verifyResult = await this.emailService.verifyEmailCode(email, emailCode);
      if (!verifyResult.success) {
        throw new BadRequestException(verifyResult.message);
      }

      // 密码强度验证（基本验证已在DTO中完成，这里可以添加更复杂的验证）
      if (newPassword.length < 6) {
        throw new BadRequestException('密码长度不能少于6个字符');
      }

      // 检查密码复杂度
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
      
      const complexityCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
      if (complexityCount < 2) {
        throw new BadRequestException('密码必须包含至少两种类型的字符（大写字母、小写字母、数字、特殊字符）');
      }

      // 修改密码
      const updatedUser = await this.userService.resetPasswordByEmail(email, newPassword);
      if (!updatedUser) {
        throw new BadRequestException('密码修改失败');
      }

      return {
        success: true,
        message: '密码修改成功',
        data: {
          email: email,
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('修改密码失败:', error);
      throw new BadRequestException('修改密码失败');
    }
  }
}