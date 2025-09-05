// 模型显示信息映射
const models = [
// 
// {
//     label: 'Gemini-2.5 Pro',
//     value: 'gemini-2.5-pro',
//     description: 'Gemini-2.5 Pro 模型，性能强大，效果出色', 
//     provider: 'Gemini',
//   },
  {
    label: 'Gemini-2.5',
    value: 'gemini-2.5-flash',
    description: 'Gemini-2.5 模型，高性能、高效能',
    provider: 'Gemini',
  },
  {
    label: 'Qwen Plus',
    value: 'qwen-plus',
    description: '通义千问Plus模型，平衡性能和效果',
    provider: 'Alibaba',
  },
  {
    label: 'Qwen turbo',
    value: 'qwen-turbo',
    description: '通义千问Turbo模型，快速响应',
    provider: 'Alibaba',
  },

  {
    label: 'DeepSeek R1',
    value: 'deepseek-chat',
    description: 'DeepSeek R1，推理、代码、写作能力全面提升',
    provider: 'DeepSeek',
  },

  {
    label: 'Kimi k2',
    value: 'kimi-k2-0711-preview',
    description: 'kimi-k2,大模型交互的能力，让你更专注于创作',
    provider: 'Kimi',
  },
];

const OPENAI_CONFIG = {
  MODELS: [
  //   {
  //   label: 'Gemini-2.5 Pro',
  //   value: 'gemini-2.5-pro',
  //   description: 'Gemini-2.5 Pro 模型，性能强大，效果出色', 
  //   provider: 'Gemini',
  // },

    {
      label: 'gemini-2.5 Flash',
      value: 'gemini-2.5-flash',
      description: 'Gemini-2.5 Flash模型，高性能、高效能',
      provider: 'Gemini',
    },

    {
      label: 'Qwen Plus',
      value: 'qwen-plus',
      description: '通义千问Plus模型，平衡性能和效果',
      provider: 'Alibaba',
    },
    {
      label: 'DeepSeek V3',
      value: 'deepseek-chat',
      description: 'DeepSeek-V3-0324，推理、代码、写作能力全面提升',
      provider: 'DeepSeek',
    },

    {
      label: 'Qwen turbo',
      value: 'qwen-turbo',
      description: '通义千问Turbo模型，快速响应',
      provider: 'Alibaba',
    }, 
    {

      label: 'Kimi k2',
      value: 'kimi-k2-0711-preview',
      description: 'kimi-k2,大模型交互的能力，让你更专注于创作',
      provider: 'Kimi',
    },
  ],

  // 系统提示词配置
  DEFAULT_SYSTEM_PROMPT: "你是网文创作助手，帮助用户进行小说创作。擅长创作网文小说。",


  // 输入长度限制配置
  INPUT_LIMITS: {
    MAX_TOTAL_INPUT_LENGTH: 25000, // 总输入长度限制（包括历史+当前消息+系统提示词）
    MAX_SINGLE_MESSAGE_LENGTH: 10000, // 单条消息最大长度
    MAX_HISTORY_CHARS: 20000, // 历史消息最大字符数
    SAFETY_BUFFER: 2000, // 安全缓冲区，为系统提示词和格式化预留空间
  },

  // Redis 键前缀配置
  REDIS_KEYS: {
    ACTIVE_STREAMS: 'openai:streams',
    USER_CHATS: 'openai:chats',
    USER_TOKENS: 'openai:tokens',
    TEST_DATA: 'openai:test',
  },

  // 数据过期时间配置（秒）
  EXPIRATION: {
    USER_CHATS: 86400, // 24小时
    TEST_DATA: 3600, // 1小时
    ACTIVE_STREAMS: 7200, // 2小时
  },

  // 流式生成配置
  STREAMING: {
    DEFAULT_TIMEOUT: 30000,
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
  },

  // 消息处理配置
  MESSAGE: {
    MAX_HISTORY_LENGTH: 50,
    MAX_HISTORY_CHARS: 20000, // 历史消息最大字符数
    TOKEN_LIMIT: 4000,
    CONTENT_PREVIEW_LENGTH: 100,
  },

  // 调试配置
  DEBUG: {
    LOG_LEVEL: 'info',
    ENABLE_DETAILED_LOGS: true,
    MAX_LOG_ENTRIES: 1000,
  },

  // 并发控制配置
  CONCURRENCY: {
    MAX_CONCURRENT_REQUESTS: 15, // 最大并发请求数
    REQUEST_TIMEOUT: 300000, // 5分钟超时 (毫秒)
    CLEANUP_INTERVAL: 60000, // 清理任务间隔 (毫秒)
    QUEUE_MAX_SIZE: 100, // 请求队列最大长度
  },

  // 性能监控配置
  PERFORMANCE: {
    ENABLE_MONITORING: true, // 是否启用性能监控
    STATS_RETENTION_TIME: 86400000, // 统计数据保留时间 (24小时，毫秒)
    LOG_STATS_INTERVAL: 300000, // 统计日志输出间隔 (5分钟，毫秒)
  },

  // 资源清理配置
  CLEANUP: {
    EXPIRED_STREAM_THRESHOLD: 300000, // 过期流阈值 (5分钟，毫秒)
    EXPIRED_REQUEST_THRESHOLD: 300000, // 过期请求阈值 (5分钟，毫秒)
    AUTO_CLEANUP_ENABLED: true, // 是否启用自动清理
    CLEANUP_BATCH_SIZE: 50, // 每次清理的批次大小
  },

  // 流式响应配置
  STREAMING_RESPONSE: {
    HEADERS: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // 禁用 Nginx/OpenResty 缓冲
      // 'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    FLUSH_ENABLED: true,
    STOP_MESSAGE: '\n\n[生成已停止]',
    STOP_SUFFIX: '\n[生成已停止]',
  },

  // 错误消息配置
  ERROR_MESSAGES: {
    MISSING_REQUIRED_PARAMS: 'userId 或 message 不能为空',
    INVALID_USER_ID: 'userId 必须是非空字符串',
    INVALID_MESSAGE: 'message 必须是非空字符串',
    SERVER_BUSY: '服务器繁忙',
    UNSUPPORTED_MODEL: '不支持的模型',
    INPUT_TOO_LONG: '内容过长已截断',
    GENERATION_STOPPED: '[生成已停止]',
    GENERATION_ERROR: '生成过程中出现错误',
  },

  // 模型配置映射
  MODEL_PROVIDERS: {


    Gemini: {
      apiKey: () => process.env.GEMINI_API_KEY,
      baseURL: () => process.env.GEMINI_BASE_URL,
      defaultTemperature: 0.7,
      supportStreaming: true,
    },

    Alibaba: {
      apiKey: () => process.env.DASHSCOPE_API_KEY,
      baseURL: () => process.env.ALIYUN_DASHSCOPE_URL,
      defaultTemperature: 0.7,
      supportStreaming: true,
    },
    DeepSeek: {
      apiKey: () => process.env.DEEPSEEK_API_KEY,
      baseURL: () => process.env.DEEPSEEK_BASE_URL,
      defaultTemperature: 0.7,
      supportStreaming: true,
    },
    Kimi: {
      apiKey: () => process.env.KIMI_API_KEY,
      baseURL: () => process.env.KIMI_BASE_URL,
      defaultTemperature: 0.7,
      supportStreaming: true,
      stream: true,
    },
    volcengine: {
      apiKey: () => process.env.DOUBAN_API_KEY,
      baseURL: () => process.env.DOUBAN_BASE_URL,
      defaultTemperature: 0.7,
      supportStreaming: true,
    },
  },

  // 模型验证配置
  MODEL_VALIDATION: {
    REQUIRED_FIELDS: ['label', 'value', 'description', 'provider'],
    SUPPORTED_PROVIDERS: ['Alibaba', 'DeepSeek', 'volcengine', 'Kimi', 'Gemini'],
  },
};

export { OPENAI_CONFIG, models };
