import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true, // 自动添加createdAt和updatedAt字段
  versionKey: false // 禁用__v字段
})
export class User {
  @Prop({ 
    type: String,
    unique: true,
    default: uuidv4,
    index: true
  })
  uuId: string;

  @Prop({ 
    type: String,
    required: [true, '用户名是必填项'],
    unique: true,
    trim: true,
    minlength: [3, '用户名长度不能少于3个字符'],
    maxlength: [30, '用户名长度不能超过30个字符'],
    index: true
  })
  userName: string;

  @Prop({ 
    type: String,
    required: [true, '邮箱是必填项'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, '请输入有效的邮箱地址'],
    index: true
  })
  email: string;

  @Prop({ 
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码长度不能少于6个字符'],
    maxlength: [128, '密码长度不能超过128个字符']
  })
  password: string;

  @Prop({ 
    type: Number,
    default: 0,
    min: [0, '付费token数量不能为负数']
  })
  payTokenNumder: number;

  @Prop({ 
    type: String,
    trim: true,
    default: null
  })
  lastLoginIP: string;

  @Prop({ 
    type: [String],
    default: []
  })
  loginIPs: string[];

  // 实例方法：验证密码
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // 实例方法：验证用户数据
  isValid(): boolean {
    return !!(this.userName && this.email && this.password);
  }

  // 实例方法：转换为安全对象（不包含密码）
  toSafeObject(): Partial<User> {
    const { password, ...safeUser } = this;
    return safeUser;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有密码被修改时才加密
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 静态方法：根据邮箱查找用户
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// 静态方法：根据用户名查找用户
UserSchema.statics.findByUserName = function(userName: string) {
  return this.findOne({ userName: userName });
};

// 静态方法：根据uuId查找用户
UserSchema.statics.findByUuId = function(uuId: string) {
  return this.findOne({ uuId: uuId });
};

// 添加实例方法到schema
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isValid = function(): boolean {
  return !!(this.userName && this.email && this.password);
};

UserSchema.methods.toSafeObject = function(): Partial<User> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};