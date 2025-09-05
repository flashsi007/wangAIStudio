// 验证码服务测试文件
// 独立测试，不依赖NestJS框架

// 简化的CaptchaService类用于测试
class TestCaptchaService {
  constructor() {
    this.captchaStore = new Map();
    // 不启动定时清理，避免测试中的干扰
  }

  // 生成简单的数学验证码
  generateMathCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let question;
    let answer;
    
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
  generateSVGCaptcha(text) {
    const width = 130;
    const height = 40;
    const fontSize = 20;
    
    // 生成随机颜色
    const getRandomColor = () => {
      const colors = ['#000'];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // 生成干扰线
    const generateLines = () => {
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
    const generateText = () => {
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
  createCaptcha(key) {
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
  verifyCaptcha(key, userAnswer) {
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
  generateKey() {
    return 'test-' + Math.random().toString(36).substr(2, 9);
  }

  // 清理过期验证码
  cleanExpiredCaptchas() {
    const now = Date.now();
    for (const [key, captcha] of this.captchaStore.entries()) {
      if (now > captcha.expires) {
        this.captchaStore.delete(key);
      }
    }
  }
}

// 测试函数
function runTests() {
  console.log('🚀 开始验证码服务测试...');
  
  const captchaService = new TestCaptchaService();
  let testsPassed = 0;
  let totalTests = 0;

  // 测试辅助函数
  function test(description, testFn) {
    totalTests++;
    try {
      testFn();
      console.log(`✅ ${description}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${description}: ${error.message}`);
    }
  }

  // 测试1: 生成验证码key
  test('生成验证码key', () => {
    const key = captchaService.generateKey();
    if (!key || typeof key !== 'string' || key.length < 5) {
      throw new Error('生成的key无效');
    }
  });

  // 测试2: 创建验证码
  test('创建验证码', () => {
    const key = captchaService.generateKey();
    const result = captchaService.createCaptcha(key);
    
    if (!result.key || !result.svg || !result.question) {
      throw new Error('验证码创建失败，缺少必要字段');
    }
    
    if (!result.svg.includes('<svg')) {
      throw new Error('SVG格式不正确');
    }
  });

  // 测试3: 验证正确答案
  test('验证正确答案', () => {
    const key = captchaService.generateKey();
    const result = captchaService.createCaptcha(key);
    
    // 计算正确答案
    const question = result.question;
    let correctAnswer;
    
    if (question.includes('+')) {
      const parts = question.split(' + ');
      correctAnswer = parseInt(parts[0]) + parseInt(parts[1]);
    } else if (question.includes('-')) {
      const parts = question.split(' - ');
      correctAnswer = parseInt(parts[0]) - parseInt(parts[1]);
    } else if (question.includes('×')) {
      const parts = question.split(' × ');
      correctAnswer = parseInt(parts[0]) * parseInt(parts[1]);
    }
    
    const verification = captchaService.verifyCaptcha(key, correctAnswer.toString());
    
    if (!verification.valid) {
      throw new Error('正确答案验证失败');
    }
  });

  // 测试4: 验证错误答案
  test('验证错误答案', () => {
    const key = captchaService.generateKey();
    captchaService.createCaptcha(key);
    
    const verification = captchaService.verifyCaptcha(key, '999');
    
    if (verification.valid) {
      throw new Error('错误答案不应该通过验证');
    }
  });

  // 测试5: 验证不存在的key
  test('验证不存在的key', () => {
    const verification = captchaService.verifyCaptcha('nonexistent-key', '123');
    
    if (verification.valid) {
      throw new Error('不存在的key不应该通过验证');
    }
    
    if (!verification.message.includes('不存在')) {
      throw new Error('错误消息不正确');
    }
  });

  // 测试6: 验证码过期
  test('验证码过期', () => {
    const key = captchaService.generateKey();
    captchaService.createCaptcha(key);
    
    // 手动设置过期时间
    const captcha = captchaService.captchaStore.get(key);
    captcha.expires = Date.now() - 1000; // 设置为1秒前过期
    
    const verification = captchaService.verifyCaptcha(key, '123');
    
    if (verification.valid) {
      throw new Error('过期的验证码不应该通过验证');
    }
    
    if (!verification.message.includes('过期')) {
      throw new Error('过期错误消息不正确');
    }
  });

  // 测试7: 验证成功后自动删除
  test('验证成功后自动删除', () => {
    const key = captchaService.generateKey();
    const result = captchaService.createCaptcha(key);
    
    // 计算正确答案
    const question = result.question;
    let correctAnswer;
    
    if (question.includes('+')) {
      const parts = question.split(' + ');
      correctAnswer = parseInt(parts[0]) + parseInt(parts[1]);
    } else if (question.includes('-')) {
      const parts = question.split(' - ');
      correctAnswer = parseInt(parts[0]) - parseInt(parts[1]);
    } else if (question.includes('×')) {
      const parts = question.split(' × ');
      correctAnswer = parseInt(parts[0]) * parseInt(parts[1]);
    }
    
    // 第一次验证应该成功
    const firstVerification = captchaService.verifyCaptcha(key, correctAnswer.toString());
    if (!firstVerification.valid) {
      throw new Error('第一次验证应该成功');
    }
    
    // 第二次验证应该失败（因为已被删除）
    const secondVerification = captchaService.verifyCaptcha(key, correctAnswer.toString());
    if (secondVerification.valid) {
      throw new Error('验证成功后验证码应该被删除');
    }
  });

  // 测试8: SVG内容验证
  test('SVG内容验证', () => {
    const key = captchaService.generateKey();
    const result = captchaService.createCaptcha(key);
    
    const svg = result.svg;
    
    if (!svg.includes('<svg')) {
      throw new Error('SVG应该包含svg标签');
    }
    
    if (!svg.includes('<rect')) {
      throw new Error('SVG应该包含背景矩形');
    }
    
    if (!svg.includes('<text')) {
      throw new Error('SVG应该包含文字元素');
    }
    
    if (!svg.includes('<line')) {
      throw new Error('SVG应该包含干扰线');
    }
  });

  // 测试9: 清理过期验证码
  test('清理过期验证码', () => {
    const key1 = captchaService.generateKey();
    const key2 = captchaService.generateKey();
    
    captchaService.createCaptcha(key1);
    captchaService.createCaptcha(key2);
    
    // 手动设置一个过期
    const captcha1 = captchaService.captchaStore.get(key1);
    captcha1.expires = Date.now() - 1000;
    
    const sizeBefore = captchaService.captchaStore.size;
    captchaService.cleanExpiredCaptchas();
    const sizeAfter = captchaService.captchaStore.size;
    
    if (sizeBefore === sizeAfter) {
      throw new Error('过期验证码应该被清理');
    }
    
    if (!captchaService.captchaStore.has(key2)) {
      throw new Error('未过期的验证码不应该被清理');
    }
  });

  // 输出测试结果
  console.log('\n📊 测试结果:');
  console.log(`通过: ${testsPassed}/${totalTests}`);
  console.log(`成功率: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查代码。');
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { TestCaptchaService, runTests };