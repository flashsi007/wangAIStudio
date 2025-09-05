import template from './data'
import { Controller, Get } from '@nestjs/common';
import { Response } from 'express';

@Controller('template')
export class TemplateController {

  @Get()
  getTemplate() {
    return {
        status: 'success',
        data: template,
        message: '获取模板列表成功',

      };
  }


}
