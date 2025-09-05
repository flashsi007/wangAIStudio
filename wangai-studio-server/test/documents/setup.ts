import 'reflect-metadata';

// 设置测试超时时间
jest.setTimeout(30000);

// 模拟控制台输出，避免测试时输出过多日志
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // 在测试期间静默某些控制台输出
  console.error = (...args: any[]) => {
    // 只显示真正的错误，过滤掉一些预期的警告
    if (
      !args[0]?.toString().includes('DeprecationWarning') &&
      !args[0]?.toString().includes('ExperimentalWarning')
    ) {
      originalConsoleError(...args);
    }
  };

  console.warn = (...args: any[]) => {
    // 过滤掉MongoDB内存服务器的警告
    if (
      !args[0]?.toString().includes('MongoMemoryServer') &&
      !args[0]?.toString().includes('mongodb-memory-server')
    ) {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // 恢复原始的控制台方法
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// 全局测试钩子
beforeEach(() => {
  // 在每个测试前清理模拟
  jest.clearAllMocks();
});

// 处理未捕获的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});