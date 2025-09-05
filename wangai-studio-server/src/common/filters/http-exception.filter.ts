import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // 处理验证错误，提取详细信息
    let validationErrors: string[] | null = null;
    let errorDetails: any = null;
    
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        const messages = exceptionResponse['message'];
        if (Array.isArray(messages)) {
          validationErrors = messages;
          // 分析验证错误，提供更详细的信息
          errorDetails = this.analyzeValidationErrors(messages);
        } else if (typeof messages === 'string') {
          validationErrors = [messages];
        }
        
        // 如果有其他错误信息，也包含进来
        if (exceptionResponse['error']) {
          errorDetails = {
            ...errorDetails,
            errorType: exceptionResponse['error']
          };
        }
      }
    }

    const errorResponse: any = {
      status: 'error',
      code: this.getErrorCode(status, exception),
      message: this.getErrorMessage(status, exception, validationErrors),
      details: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...errorDetails,
      },
    };

    if (validationErrors) {
      errorResponse.validationErrors = validationErrors;
    }

    // 如果有具体的错误详情，添加到响应中
    if (errorDetails && errorDetails.missingFields) {
      errorResponse.missingFields = errorDetails.missingFields;
    }
    if (errorDetails && errorDetails.invalidFields) {
      errorResponse.invalidFields = errorDetails.invalidFields;
    }

    response.status(status).json(errorResponse);
  }

  private analyzeValidationErrors(messages: string[]): any {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];
    const fieldErrors: { [key: string]: string[] } = {};

    messages.forEach(message => {
      if (message.includes('should not be empty') || message.includes('is required')) {
        const field = message.split(' ')[0];
        missingFields.push(field);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push('字段不能为空');
      } else if (message.includes('must be a string')) {
        const field = message.split(' ')[0];
        invalidFields.push(field);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push('必须是字符串类型');
      } else if (message.includes('must be a number')) {
        const field = message.split(' ')[0];
        invalidFields.push(field);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push('必须是数字类型');
      } else if (message.includes('must be one of the following values')) {
        const field = message.split(' ')[0];
        invalidFields.push(field);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push('值不在允许的范围内');
      } else {
        // 通用错误处理
        const field = message.split(' ')[0];
        invalidFields.push(field);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(message);
      }
    });

    return {
      missingFields: missingFields.length > 0 ? [...new Set(missingFields)] : undefined,
      invalidFields: invalidFields.length > 0 ? [...new Set(invalidFields)] : undefined,
      fieldErrors
    };
  }

  private getErrorMessage(status: number, exception: HttpException, validationErrors: string[] | null): string {
    if (validationErrors && validationErrors.length > 0) {
      const missingCount = validationErrors.filter(msg => 
        msg.includes('should not be empty') || msg.includes('is required')
      ).length;
      const invalidCount = validationErrors.length - missingCount;
      
      if (missingCount > 0 && invalidCount > 0) {
        return `请求参数验证失败：缺少 ${missingCount} 个必填字段，${invalidCount} 个字段格式错误`;
      } else if (missingCount > 0) {
        return `请求参数验证失败：缺少 ${missingCount} 个必填字段`;
      } else {
        return `请求参数验证失败：${invalidCount} 个字段格式错误`;
      }
    }
    return exception.message;
  }

  private getErrorCode(status: number, exception: HttpException): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'AUTH_REQUIRED';
      case HttpStatus.FORBIDDEN:
        return 'PERMISSION_DENIED';
      case HttpStatus.NOT_FOUND:
        return exception.message.includes('Document')
          ? 'DOCUMENT_NOT_FOUND'
          : exception.message.includes('Child')
          ? 'CHILD_NODE_NOT_FOUND'
          : 'NOT_FOUND';
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}