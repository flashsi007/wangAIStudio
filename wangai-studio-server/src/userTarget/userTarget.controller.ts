import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { UserTargetService } from './userTarget.service';
import { UserTargetDto, WordsLogDto } from './dto/userTarget.dto';
import { UserTarget, WordsLog } from './schemas/userTarget.schema';

@Controller('user-target')
export class UserTargetController {
  constructor(private readonly userTargetService: UserTargetService) { }


  @Get('get-today-words/:userId') // 获取今日字数
  async getTodayWords(@Param('userId') userId: string) {
    const result = await this.userTargetService.getTodayWords(userId);
    return {
      status: 'success',
      data: result,
    }
  }

  @Get('get-one-week-words/:userId') // 获取一周字数
  async getOneWeekWords(@Param('userId') userId: string) {
    const result = await this.userTargetService.getOneWeekWords(userId);
    return {
      status: 'success',
      data: result,
    }
  }



}