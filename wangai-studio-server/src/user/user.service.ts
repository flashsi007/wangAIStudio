import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // 根据ID获取用户
  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }
    return user.toSafeObject() as UserResponseDto;
  }

  // 创建用户
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    try {
      // 检查邮箱是否已存在
      const existingUserByEmail = await this.userModel.findOne({ email: userData.email.toLowerCase() });
      if (existingUserByEmail) {
        throw new ConflictException('该邮箱已被注册');
      }

      // 检查用户名是否已存在
      const existingUserByName = await this.userModel.findOne({ userName: userData.userName });
      if (existingUserByName) {
        throw new ConflictException('该用户名已被使用');
      }

      const newUser = new this.userModel(userData);
      const savedUser = await newUser.save();
      return savedUser.toSafeObject() as UserResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException('用户数据验证失败: ' + error.message);
      }
      throw error;
    }
  }

  // 更新用户
  async updateUser(id: string, userData: UpdateUserDto): Promise<UserResponseDto | null> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        userData,
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedUser) {
        return null;
      }
      
      return updatedUser.toSafeObject() as UserResponseDto;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('用户数据验证失败: ' + error.message);
      }
      throw error;
    }
  }

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      return null;
    }
    return user.toSafeObject() as UserResponseDto;
  }

  // 根据UUID获取用户
  async getUserByUuId(uuId: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ uuId }).exec();
    if (!user) {
      return null;
    }
    return user.toSafeObject() as UserResponseDto;
  }

  // 验证用户（用于登录）
  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  // 设置用户token数量
  async setUserTokenCount(userId: string, tokenCount: number): Promise<UserResponseDto | null> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { payTokenNumder: tokenCount },
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedUser) {
        return null;
      }
      
      return updatedUser.toSafeObject() as UserResponseDto;
    } catch (error) {
      throw new BadRequestException('更新token数量失败: ' + error.message);
    }
  }

  // 重置密码
  async resetPassword(userId: string, newPassword: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        return null;
      }
      
      user.password = newPassword;
      const updatedUser = await user.save();
      
      return updatedUser.toSafeObject() as UserResponseDto;
    } catch (error) {
      throw new BadRequestException('重置密码失败: ' + error.message);
    }
  }

  // 根据邮箱重置密码
  async resetPasswordByEmail(email: string, newPassword: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
      if (!user) {
        return null;
      }
      
      user.password = newPassword;
      const updatedUser = await user.save();
      
      return updatedUser.toSafeObject() as UserResponseDto;
    } catch (error) {
      throw new BadRequestException('重置密码失败: ' + error.message);
    }
  }

  // 删除用户
  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // 获取所有用户（分页）
  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: UserResponseDto[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec()
    ]);
    
    const safeUsers = users.map(user => user.toSafeObject() as UserResponseDto);
    const pages = Math.ceil(total / limit);
    
    return {
      users: safeUsers,
      total,
      pages
    };
  }

  // 更新登录IP
  async updateLoginIP(userId: string, ip: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        lastLoginIP: ip,
        $addToSet: { loginIPs: ip }
      }
    ).exec();
  }
}