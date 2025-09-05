import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6位' })
  password: string;

  @IsString({ message: '验证码key必须是字符串' })
  @IsNotEmpty({ message: '验证码key不能为空' })
  captchaKey: string;

  @IsString({ message: '验证码答案必须是字符串' })
  @IsNotEmpty({ message: '验证码答案不能为空' })
  captchaAnswer: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(30, { message: '用户名长度不能超过30个字符' })
  userName: string;

  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @MaxLength(128, { message: '密码长度不能超过128个字符' })
  password: string;

  @IsString()
  emailCode: string;

  @IsOptional()
  @IsString()
  captchaKey?: string;

  @IsOptional()
  @IsString()
  captchaValue?: string;
}

export class SendEmailCodeDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  type: 'register' | 'forgot';

  @IsOptional()
  @IsString()
  captchaKey?: string;

  @IsOptional()
  @IsString()
  captchaValue?: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @MaxLength(128, { message: '新密码长度不能超过128个字符' })
  newPassword: string;

  @IsString()
  emailCode: string;
}

export class GenerateCaptchaDto {
  @IsString()
  key: string;
}

export class ChangePasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @MaxLength(128, { message: '新密码长度不能超过128个字符' })
  newPassword: string;

  @IsString()
  emailCode: string;
}