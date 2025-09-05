import { IsString, IsEmail, IsOptional, IsNumber, IsArray, MinLength, MaxLength, Min } from 'class-validator';

export class CreateUserDto {
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

  @IsOptional()
  @IsNumber({}, { message: '付费token数量必须是数字' })
  @Min(0, { message: '付费token数量不能为负数' })
  payTokenNumder?: number;

  @IsOptional()
  @IsString()
  lastLoginIP?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  loginIPs?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(30, { message: '用户名长度不能超过30个字符' })
  userName?: string;

  @IsOptional()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @MaxLength(128, { message: '密码长度不能超过128个字符' })
  password?: string;

  @IsOptional()
  @IsNumber({}, { message: '付费token数量必须是数字' })
  @Min(0, { message: '付费token数量不能为负数' })
  payTokenNumder?: number;

  @IsOptional()
  @IsString()
  lastLoginIP?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  loginIPs?: string[];
}

export class UserResponseDto {
  uuId: string;
  userName: string;
  email: string;
  payTokenNumder: number;
  lastLoginIP: string;
  loginIPs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class SetTokenCountDto {
  @IsString()
  userId: string;

  @IsNumber({}, { message: 'token数量必须是数字' })
  @Min(0, { message: 'token数量不能为负数' })
  tokenCount: number;
}

export class ResetPasswordDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @MaxLength(128, { message: '新密码长度不能超过128个字符' })
  newPassword: string;
}