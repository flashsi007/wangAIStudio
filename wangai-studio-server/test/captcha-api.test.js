// 验证码API测试文件
// 测试实际的HTTP端点

const http = require('http');
const https = require('https');
const { URL } = require('url');

// 简单的HTTP客户端
class HttpClient {
  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };
      
      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      
      req.end();
    });
  }
  
  static async get(url, headers = {}) {
    return this.request(url, { method: 'GET', headers });
  }
  
  static async post(url, body, headers = {}) {
    return this.request(url, { method: 'POST', body, headers });
  }
}

// 测试配置
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/auth`;

// 测试函数
async function runApiTests() {
  console.log('🚀 开始验证码API测试...');
  
  let testsPassed = 0;
  let totalTests = 0;

  // 测试辅助函数
  async function test(description, testFn) {
    totalTests++;
    try {
      await testFn();
      console.log(`✅ ${description}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${description}: ${error.message}`);
    }
  }

  // 等待服务器启动
  console.log('⏳ 等待服务器启动...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 测试1: 获取验证码
  let captchaKey = null;
  await test('获取验证码SVG', async () => {
    const response = await HttpClient.get(`${API_BASE}/captcha`);
    
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }
    
    if (!response.data.includes('<svg')) {
      throw new Error('响应不包含SVG内容');
    }
    
    if (!response.headers['x-captcha-key']) {
      throw new Error('响应头中缺少验证码key');
    }
    
    captchaKey = response.headers['x-captcha-key'];
    
    if (!response.data.includes('<text')) {
      throw new Error('SVG中缺少文字元素');
    }
    
    if (!response.data.includes('<line')) {
      throw new Error('SVG中缺少干扰线');
    }
  });

  // 测试2: 解析验证码问题
  let correctAnswer = null;
  await test('解析验证码数学问题', async () => {
    if (!captchaKey) {
      throw new Error('没有获取到验证码key');
    }
    
    // 重新获取验证码以获取问题
    const response = await HttpClient.get(`${API_BASE}/captcha`);
    captchaKey = response.headers['x-captcha-key'];
    
    // 从SVG中提取数学问题
    const svgContent = response.data;
    const textMatches = svgContent.match(/<text[^>]*>([^<]+)<\/text>/g);
    
    if (!textMatches || textMatches.length === 0) {
      throw new Error('无法从SVG中提取文字内容');
    }
    
    // 组合所有文字内容
    let question = '';
    textMatches.forEach(match => {
      const text = match.replace(/<text[^>]*>([^<]+)<\/text>/, '$1');
      question += text;
    });
    
    console.log(`   📝 验证码问题: ${question}`);
    
    // 计算答案
    if (question.includes('+')) {
      const parts = question.split('+').map(p => parseInt(p.trim()));
      correctAnswer = parts[0] + parts[1];
    } else if (question.includes('-')) {
      const parts = question.split('-').map(p => parseInt(p.trim()));
      correctAnswer = parts[0] - parts[1];
    } else if (question.includes('×')) {
      const parts = question.split('×').map(p => parseInt(p.trim()));
      correctAnswer = parts[0] * parts[1];
    } else {
      throw new Error('无法识别数学运算符');
    }
    
    console.log(`   🔢 计算答案: ${correctAnswer}`);
  });

  // 测试3: 使用错误验证码登录
  await test('使用错误验证码登录', async () => {
    if (!captchaKey) {
      throw new Error('没有获取到验证码key');
    }
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
      captchaKey: captchaKey,
      captchaAnswer: '999' // 错误答案
    };
    
    const response = await HttpClient.post(`${API_BASE}/login`, loginData);
    
    if (response.status === 200) {
      throw new Error('错误验证码不应该通过验证');
    }
    
    if (response.status !== 400) {
      throw new Error(`期望状态码400，实际: ${response.status}`);
    }
  });

  // 测试4: 使用正确验证码但错误用户信息登录
  await test('使用正确验证码但错误用户信息登录', async () => {
    if (!captchaKey || correctAnswer === null) {
      throw new Error('没有获取到验证码信息');
    }
    
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
      captchaKey: captchaKey,
      captchaAnswer: correctAnswer.toString()
    };
    
    const response = await HttpClient.post(`${API_BASE}/login`, loginData);
    
    if (response.status === 200) {
      throw new Error('错误的用户信息不应该通过验证');
    }
    
    // 验证码正确但用户信息错误，应该返回401
    if (response.status !== 401) {
      throw new Error(`期望状态码401，实际: ${response.status}`);
    }
  });

  // 测试5: 使用无效的验证码key
  await test('使用无效的验证码key', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
      captchaKey: 'invalid-key-12345',
      captchaAnswer: '123'
    };
    
    const response = await HttpClient.post(`${API_BASE}/login`, loginData);
    
    if (response.status === 200) {
      throw new Error('无效的验证码key不应该通过验证');
    }
    
    if (response.status !== 400) {
      throw new Error(`期望状态码400，实际: ${response.status}`);
    }
  });

  // 测试6: 缺少验证码参数
  await test('缺少验证码参数', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
      // 缺少captchaKey和captchaAnswer
    };
    
    const response = await HttpClient.post(`${API_BASE}/login`, loginData);
    
    if (response.status === 200) {
      throw new Error('缺少验证码参数不应该通过验证');
    }
    
    if (response.status !== 400) {
      throw new Error(`期望状态码400，实际: ${response.status}`);
    }
  });

  // 测试7: 验证码响应头格式
  await test('验证码响应头格式', async () => {
    const response = await HttpClient.get(`${API_BASE}/captcha`);
    
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }
    
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('image/svg+xml')) {
      throw new Error(`Content-Type错误: ${contentType}`);
    }
    
    const cacheControl = response.headers['cache-control'];
    if (!cacheControl || !cacheControl.includes('no-cache')) {
      throw new Error('缺少正确的缓存控制头');
    }
  });

  // 测试8: 多次获取验证码
  await test('多次获取验证码', async () => {
    const keys = new Set();
    
    for (let i = 0; i < 3; i++) {
      const response = await HttpClient.get(`${API_BASE}/captcha`);
      
      if (response.status !== 200) {
        throw new Error(`第${i+1}次请求失败: ${response.status}`);
      }
      
      const key = response.headers['x-captcha-key'];
      if (!key) {
        throw new Error(`第${i+1}次请求缺少验证码key`);
      }
      
      if (keys.has(key)) {
        throw new Error('验证码key不应该重复');
      }
      
      keys.add(key);
    }
  });

  // 输出测试结果
  console.log('\n📊 API测试结果:');
  console.log(`通过: ${testsPassed}/${totalTests}`);
  console.log(`成功率: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 所有API测试通过！');
  } else {
    console.log('⚠️  部分API测试失败，请检查服务器状态。');
  }
}

// 检查服务器是否运行
async function checkServerStatus() {
  try {
    const response = await HttpClient.get(`${BASE_URL}`);
    return response.status < 500;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔍 检查服务器状态...');
  
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log('❌ 服务器未运行，请先启动服务器: pnpm run start:dev');
    process.exit(1);
  }
  
  console.log('✅ 服务器正在运行');
  await runApiTests();
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runApiTests, HttpClient };