import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

// 验证码存储接口
interface CaptchaData {
  answer: string;
  createdAt: number;
  expires: number;
}

@Injectable()
export class CaptchaService {
  // 内存存储验证码（生产环境建议使用Redis）
  private captchaStore = new Map<string, CaptchaData>();

  constructor() {
    // 定时清理过期验证码
    setInterval(() => {
      this.cleanExpiredCaptchas();
    }, 60000); // 每分钟清理一次
  }

  // 生成简单的数学验证码
  private generateMathCaptcha(): { question: string; answer: string } {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let question: string;
    let answer: number;
    
    switch (operator) {
      case '+':
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case '-':
        question = `${num1} - ${num2}`;
        answer = num1 - num2;
        break;
      case '*':
        question = `${num1} × ${num2}`;
        answer = num1 * num2;
        break;
      default:
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
    }
    
    return { question, answer: answer.toString() };
  }

  // 生成SVG验证码图片
  private generateSVGCaptcha(text: string): string {
    const width = 130;
    const height = 40;
    const fontSize = 20;
    
    // 生成随机颜色
    const getRandomColor = (): string => {
      const colors = [
        '#000'
        // '#FF6B6B',
        // '#4ECDC4', 
        // '#45B7D1',
        // '#96CEB4',
        // '#FFEAA7',
        // '#DDA0DD',
        // '#98D8C8'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // 生成干扰线
    const generateLines = (): string => {
      let lines = '';
      for (let i = 0; i < 3; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = Math.random() * width;
        const y2 = Math.random() * height;
        lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${getRandomColor()}" stroke-width="1" opacity="0.3"/>`;
      }
      return lines;
    };
    
    // 生成文字
    const generateText = (): string => {
      let textElements = '';
      const chars = text.split('');
      chars.forEach((char, index) => {
        const x = 15 + index * 20 + Math.random() * 10;
        const y = 25 + Math.random() * 10;
        const rotation = (Math.random() - 0.5) * 30;
        textElements += `<text x="${x}" y="${y}" font-family="Arial" font-size="${fontSize}" fill="${getRandomColor()}" transform="rotate(${rotation} ${x} ${y})">${char}</text>`;
      });
      return textElements;
    };
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f8f9fa"/>
        ${generateLines()}
        ${generateText()}
      </svg>
    `;
    
    return svg;
  }

  // 生成验证码并存储
  createCaptcha(key: string): { key: string; svg: string; question: string } {
    const { question, answer } = this.generateMathCaptcha();
    const svg = this.generateSVGCaptcha(question);
    
    // 存储验证码，设置5分钟过期
    this.captchaStore.set(key, {
      answer,
      createdAt: Date.now(),
      expires: Date.now() + 5 * 60 * 1000 // 5分钟
    });
    
    return {
      key,
      svg,
      question
    };
  }

  // 验证验证码
  verifyCaptcha(key: string, userAnswer: string): { valid: boolean; message: string } {
    const captcha = this.captchaStore.get(key);
    
    if (!captcha) {
      return { valid: false, message: '验证码不存在或已过期' };
    }
    
    if (Date.now() > captcha.expires) {
      this.captchaStore.delete(key);
      return { valid: false, message: '验证码已过期' };
    }
    
    const isValid = captcha.answer === userAnswer.toString();
    
    if (isValid) {
      this.captchaStore.delete(key); // 验证成功后删除
    }
    
    return {
      valid: isValid,
      message: isValid ? '验证码正确' : '验证码错误'
    };
  }

  // 生成唯一key
  generateKey(): string {
    return crypto.randomUUID();
  }

  // 清理过期验证码
  private cleanExpiredCaptchas(): void {
    const now = Date.now();
    for (const [key, captcha] of this.captchaStore.entries()) {
      if (now > captcha.expires) {
        this.captchaStore.delete(key);
      }
    }
  }
}