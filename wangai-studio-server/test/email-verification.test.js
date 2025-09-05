/**
 * 邮件验证码功能测试
 * 测试发送邮件验证码和验证邮件验证码的功能
 */

class HttpClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async request(method, url, data = null, headers = {}) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${url}`, options);
    const responseData = await response.json();
    
    return {
      status: response.status,
      data: responseData,
      headers: response.headers
    };
  }

  async post(url, data, headers) {
    return this.request('POST', url, data, headers);
  }

  async get(url, headers) {
    return this.request('GET', url, null, headers);
  }
}

class EmailVerificationTester {
  constructor() {
    this.client = new HttpClient();
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      error: '\x1b[31m',   // red
      warning: '\x1b[33m', // yellow
      reset: '\x1b[0m'     // reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(testName, testFn) {
    try {
      this.log(`开始测试: ${testName}`, 'info');
      const result = await testFn();
      this.testResults.push({ name: testName, status: 'passed', result });
      this.log(`✓ ${testName} - 通过`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'failed', error: error.message });
      this.log(`✗ ${testName} - 失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async testSendRegisterCode() {
    return this.runTest('发送注册验证码', async () => {
      const response = await this.client.post('/api/auth/send-register-code', {
        email: 'flashsi007@outlook.com',
        type: 'register'
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`期望状态码 200 或 201，实际 ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error(`期望 success: true，实际 ${response.data.success}`);
      }

      if (response.data.message !== '验证码发送成功') {
        throw new Error(`期望消息 '验证码发送成功'，实际 '${response.data.message}'`);
      }

      return response.data;
    });
  }

  async testSendPasswordResetCode() {
    return this.runTest('发送密码重置验证码', async () => {
      const response = await this.client.post('/api/auth/send-register-code', {
        email: 'test@example.com',
        type: 'forgot-password'
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`期望状态码 200 或 201，实际 ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error(`期望 success: true，实际 ${response.data.success}`);
      }

      if (response.data.message !== '验证码发送成功') {
        throw new Error(`期望消息 '验证码发送成功'，实际 '${response.data.message}'`);
      }

      return response.data;
    });
  }

  async testSendCodeWithInvalidEmail() {
    return this.runTest('发送验证码到无效邮箱', async () => {
      const response = await this.client.post('/api/auth/send-register-code', {
        email: 'invalid-email',
        type: 'register'
      });

      if (response.status !== 400) {
        throw new Error(`期望状态码 400，实际 ${response.status}`);
      }

      return response.data;
    });
  }

  async testSendCodeWithMissingType() {
    return this.runTest('发送验证码缺少类型参数', async () => {
      const response = await this.client.post('/api/auth/send-register-code', {
        email: 'test@example.com'
      });

      if (response.status !== 400) {
        throw new Error(`期望状态码 400，实际 ${response.status}`);
      }

      return response.data;
    });
  }

  async testRegisterWithInvalidCode() {
    return this.runTest('注册时使用无效验证码', async () => {
      const response = await this.client.post('/api/auth/register', {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        emailCode: '000000'
      });

      if (response.status !== 400) {
        throw new Error(`期望状态码 400，实际 ${response.status}`);
      }

      if (!response.data.message.includes('验证码')) {
        throw new Error(`期望错误消息包含'验证码'，实际 '${response.data.message}'`);
      }

      return response.data;
    });
  }

  async testForgotPasswordWithInvalidCode() {
    return this.runTest('找回密码时使用无效验证码', async () => {
      const response = await this.client.post('/api/auth/forgot-password', {
        email: 'test@example.com',
        newPassword: 'newpassword123',
        emailCode: '000000'
      });

      if (response.status !== 400) {
        throw new Error(`期望状态码 400，实际 ${response.status}`);
      }

      if (!response.data.message.includes('验证码')) {
        throw new Error(`期望错误消息包含'验证码'，实际 '${response.data.message}'`);
      }

      return response.data;
    });
  }

  async testEmailServiceConfiguration() {
    return this.runTest('邮件服务配置测试', async () => {
      // 通过发送验证码来测试邮件服务是否正确配置
      const response = await this.client.post('/api/auth/send-register-code', {
        email: 'test@example.com',
        type: 'register'
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`邮件服务配置可能有问题，状态码: ${response.status}`);
      }

      // 检查是否是模拟发送（在日志中会显示）
      this.log('注意: 如果看到"模拟发送邮件"日志，说明邮件配置不完整，正在使用模拟模式', 'warning');
      
      return response.data;
    });
  }

  printSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const successRate = ((passed / total) * 100).toFixed(1);

    this.log('\n=== 测试总结 ===', 'info');
    this.log(`总测试数: ${total}`, 'info');
    this.log(`通过: ${passed}`, 'success');
    this.log(`失败: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`成功率: ${successRate}%`, successRate === '100.0' ? 'success' : 'warning');

    if (failed > 0) {
      this.log('\n失败的测试:', 'error');
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => this.log(`- ${r.name}: ${r.error}`, 'error'));
    }

    this.log('\n=== 邮件验证码功能说明 ===', 'info');
    this.log('1. 发送验证码: POST /api/auth/send-register-code', 'info');
    this.log('   - 参数: { email, type: "register" | "forgot-password" }', 'info');
    this.log('2. 注册验证: POST /api/auth/register', 'info');
    this.log('   - 参数: { userName, email, password, emailCode }', 'info');
    this.log('3. 密码重置: POST /api/auth/forgot-password', 'info');
    this.log('   - 参数: { email, newPassword, emailCode }', 'info');
    this.log('4. 验证码有效期: 5分钟', 'info');
    this.log('5. 验证码格式: 6位数字', 'info');
  }

  async runAllTests() {
    this.log('开始邮件验证码功能测试...', 'info');
    
    try {
      // 基础功能测试
      await this.testEmailServiceConfiguration();
      await this.testSendRegisterCode();
      await this.testSendPasswordResetCode();
      
      // 错误处理测试
      await this.testSendCodeWithInvalidEmail();
      await this.testSendCodeWithMissingType();
      await this.testRegisterWithInvalidCode();
      await this.testForgotPasswordWithInvalidCode();
      
    } catch (error) {
      this.log(`测试过程中发生错误: ${error.message}`, 'error');
    } finally {
      this.printSummary();
    }
  }
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  const { fetch } = require('undici');
  global.fetch = fetch;
  
  const tester = new EmailVerificationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { EmailVerificationTester, HttpClient };