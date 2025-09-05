import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, SetTokenCountDto, ResetPasswordDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 根据ID获取用户
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      data: user,
      message: '获取用户成功',
      timestamp: new Date().toISOString()
    };
  }

  // 创建用户
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userService.createUser(createUserDto);
      return {
        success: true,
        data: newUser,
        message: '创建用户成功',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('创建用户失败');
    }
  }

  // 更新用户
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      data: updatedUser,
      message: '更新用户成功',
      timestamp: new Date().toISOString()
    };
  }

  // 根据邮箱获取用户
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      data: user,
      message: '获取用户成功',
      timestamp: new Date().toISOString()
    };
  }

  // 根据UUID获取用户
  @Get('uuid/:uuId')
  async getUserByUuId(@Param('uuId') uuId: string) {
    const user = await this.userService.getUserByUuId(uuId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      data: user,
      message: '获取用户成功',
      timestamp: new Date().toISOString()
    };
  }

  // 验证用户（用于登录）
  @Post('validate')
  async validateUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('邮箱和密码不能为空');
    }

    const user = await this.userService.validateUser(email, password);
    if (!user) {
      return {
        success: false,
        data: null,
        message: '邮箱或密码错误',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: user.toSafeObject(),
      message: '用户验证成功',
      timestamp: new Date().toISOString()
    };
  }

  // 设置用户token数量
  @Put('token-count')
  async setUserTokenCount(@Body() setTokenCountDto: SetTokenCountDto) {
    const { userId, tokenCount } = setTokenCountDto;
    const updatedUser = await this.userService.setUserTokenCount(userId, tokenCount);
    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      data: updatedUser,
      message: '设置token数量成功',
      timestamp: new Date().toISOString()
    };
  }

  // 重置密码
  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { userId, newPassword } = resetPasswordDto;
    const updatedUser = await this.userService.resetPassword(userId, newPassword);
    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      data: updatedUser,
      message: '重置密码成功',
      timestamp: new Date().toISOString()
    };
  }

  // 删除用户
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    const deleted = await this.userService.deleteUser(id);
    if (!deleted) {
      throw new NotFoundException('用户不存在');
    }
    return {
      success: true,
      message: '删除用户成功',
      timestamp: new Date().toISOString()
    };
  }

  // 获取所有用户（分页）
  @Get()
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    if (pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('页码和每页数量必须大于0');
    }
    
    const result = await this.userService.getAllUsers(pageNum, limitNum);
    return {
      success: true,
      data: result,
      message: '获取用户列表成功',
      timestamp: new Date().toISOString()
    };
  }
}