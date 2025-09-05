# WangAI Studio Server

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20.17.0-green)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.18-green)
![Redis](https://img.shields.io/badge/Redis-5.6-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

**一个功能强大的 AI 工作室后端服务，支持多种 AI 模型集成、实时通信和智能内容生成**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [部署指南](#-部署指南) • [API 文档](#-api-文档) • [贡献指南](#-贡献指南)

</div>

## 📋 目录

- [项目介绍](#-项目介绍)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [系统要求](#-系统要求)
- [快速开始](#-快速开始)
- [环境配置](#-环境配置)
- [部署指南](#-部署指南)
- [API 文档](#-api-文档)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [测试](#-测试)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## 🚀 项目介绍

WangAI Studio Server 是一个基于 NestJS 构建的现代化 AI 工作室后端服务。它提供了完整的 AI 模型集成解决方案，支持多种主流 AI 服务提供商，包括阿里云通义千问、豆包、DeepSeek、Kimi、Gemini 等。

该项目旨在为开发者和企业提供一个统一的 AI 服务接口，简化 AI 应用的开发和部署过程。通过模块化的架构设计，可以轻松扩展新的 AI 服务和功能。

## ✨ 功能特性

### 🤖 AI 模型集成
- **多模型支持**: 集成阿里云通义千问、豆包、DeepSeek、Kimi、Gemini 等主流 AI 模型
- **统一接口**: 提供统一的 API 接口，简化不同 AI 服务的调用
- **智能路由**: 根据需求自动选择最适合的 AI 模型
- **流式响应**: 支持流式数据传输，提供实时的 AI 响应体验

### 📝 内容生成
- **小说创作**: 智能小说生成和续写功能
- **模板系统**: 可自定义的内容生成模板
- **文档处理**: 支持多种文档格式的智能处理
- **提示词管理**: 专业的提示词（Prompt）管理系统

### 👥 用户管理
- **用户认证**: 基于 JWT 的安全认证系统
- **权限控制**: 细粒度的用户权限管理
- **用户目标**: 个性化的用户目标设定和追踪
- **管理后台**: 完整的管理员后台系统

### 🔄 实时通信
- **WebSocket 支持**: 基于 Socket.IO 的实时双向通信
- **实时协作**: 支持多用户实时协作功能
- **消息推送**: 智能消息推送和通知系统

### 🔍 搜索集成
- **Tavily 搜索**: 集成 Tavily API 提供智能搜索功能
- **LangChain 支持**: 基于 LangChain 的高级 AI 应用开发
- **向量搜索**: 支持语义搜索和相似度匹配

### 📧 通信服务
- **邮件服务**: 集成邮件发送功能
- **验证码**: 邮箱验证码生成和验证
- **通知系统**: 多渠道消息通知

## 🛠 技术栈

### 后端框架
- **[NestJS](https://nestjs.com/)** - 现代化的 Node.js 框架
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript 超集
- **[Express](https://expressjs.com/)** - 快速、极简的 Web 框架

### 数据库
- **[MongoDB](https://www.mongodb.com/)** - 文档型 NoSQL 数据库
- **[Mongoose](https://mongoosejs.com/)** - MongoDB 对象建模工具
- **[Redis](https://redis.io/)** - 内存数据结构存储

### AI 和机器学习
- **[LangChain](https://langchain.com/)** - AI 应用开发框架
- **[OpenAI API](https://openai.com/api/)** - GPT 模型接口
- **多厂商 AI API** - 阿里云、豆包、DeepSeek、Kimi、Gemini

### 实时通信
- **[Socket.IO](https://socket.io/)** - 实时双向事件通信
- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** - 全双工通信协议

### 开发工具
- **[Jest](https://jestjs.io/)** - JavaScript 测试框架
- **[Prettier](https://prettier.io/)** - 代码格式化工具
- **[ESLint](https://eslint.org/)** - 代码质量检查

### 部署和运维
- **[Docker](https://www.docker.com/)** - 容器化部署
- **[PM2](https://pm2.keymetrics.io/)** - Node.js 进程管理
- **[Nginx](https://nginx.org/)** - 反向代理和负载均衡

## 💻 系统要求

### 最低要求
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **MongoDB**: >= 5.0
- **Redis**: >= 6.0
- **内存**: >= 2GB RAM
- **存储**: >= 10GB 可用空间

### 推荐配置
- **Node.js**: 20.17.0 LTS
- **pnpm**: 最新版本
- **MongoDB**: 7.0+
- **Redis**: 7.0+
- **内存**: >= 4GB RAM
- **存储**: >= 20GB SSD

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/wangai-studio-server.git
cd wangai-studio-server
```

### 2. 安装依赖

```bash
# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3. 环境配置

```bash
# 复制环境配置文件
cp .env.development .env.local

# 编辑配置文件
vim .env.local
```

### 4. 启动服务

```bash
# 开发模式启动
pnpm run start:dev

# 生产模式启动
pnpm run build
pnpm run start:prod
```

### 5. 验证安装

访问 `http://localhost:3000` 确认服务正常运行。

## ⚙️ 环境配置

### 环境变量说明

创建 `.env.development`   文件并配置以下环境变量：

```bash
# 基础配置
NODE_ENV=development
PORT=3000

# MongoDB 配置
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=your_mongo_user
MONGO_PASS=your_mongo_password
MONGO_DB=wangai_studio

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# AI 服务配置
# 阿里云通义千问
DASHSCOPE_API_KEY=sk-your-dashscope-key
ALIYUN_DASHSCOPE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 豆包模型
DOUBAN_API_KEY=your-douban-key
DOUBAN_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

# DeepSeek
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Kimi
KIMI_API_KEY=sk-your-kimi-key
KIMI_BASE_URL=https://api.moonshot.cn/v1

# Gemini
GEMINI_API_KEY=your-gemini-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com

# Tavily 搜索
TAVILY_API_KEY=tvly-your-tavily-key

# 邮箱配置
EMAIL=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
```

### 数据库初始化

```bash
# 启动 MongoDB 和 Redis（如果使用 Docker）
docker-compose up -d mongodb redis

# 运行数据库迁移（如果有）
pnpm run migration:run

# 初始化种子数据
pnpm run seed:documents
```

## 🚀 部署指南

### 开发环境部署

#### 本地开发环境

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **配置环境变量**
   ```bash
   cp .env.development .env.local
   # 编辑 .env.local 文件，配置数据库和 AI 服务密钥
   ```

3. **启动数据库服务**
   ```bash
   # 使用 Docker 启动 MongoDB 和 Redis
   docker run -d --name mongodb -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     mongo:7.0
   
   docker run -d --name redis -p 6379:6379 redis:7.0
   ```

4. **启动开发服务器**
   ```bash
   pnpm run start:dev
   ```

#### Docker 开发环境

```bash
# 构建开发镜像
docker-compose -f docker-compose.dev.yml up --build

# 后台运行
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境部署

#### 方式一：传统部署（推荐）

**系统要求**
- Ubuntu 20.04+ / CentOS 8+
- Node.js 20.17.0+
- MongoDB 7.0+
- Redis 7.0+
- Nginx 1.18+

**一键部署脚本**

```bash
# 克隆项目
git clone https://github.com/your-username/wangai-studio-server.git
cd wangai-studio-server

# 设置执行权限
chmod +x shell/*.sh

# 运行一键部署脚本
sudo ./shell/deploy.sh
```

**手动部署步骤**

1. **安装系统依赖**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y curl wget git nginx
   
   # 安装 Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 pnpm
   npm install -g pnpm pm2
   ```

2. **安装数据库**
   ```bash
   # 安装 MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # 安装 Redis
   sudo apt install -y redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

3. **部署应用**
   ```bash
   # 创建应用目录
   sudo mkdir -p /var/www/wangai-studio-server
   sudo chown $USER:$USER /var/www/wangai-studio-server
   
   # 克隆代码
   git clone https://github.com/your-username/wangai-studio-server.git /var/www/wangai-studio-server
   cd /var/www/wangai-studio-server
   
   # 安装依赖
   pnpm install --production
   
   # 构建项目
   pnpm run build
   
   # 配置环境变量
   cp .env.production .env
   # 编辑 .env 文件，配置生产环境变量
   
   # 启动应用
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

4. **配置 Nginx**
   ```bash
   # 复制 Nginx 配置
   sudo cp nginx/api_wangai_studio.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/api_wangai_studio.conf /etc/nginx/sites-enabled/
   
   # 测试配置
   sudo nginx -t
   
   # 重启 Nginx
   sudo systemctl restart nginx
   ```

5. **配置 SSL（可选）**
   ```bash
   # 使用 Let's Encrypt
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

#### 方式二：Docker 容器化部署

**使用 Docker Compose**

1. **准备配置文件**
   ```bash
   # 创建生产环境配置
   cp .env.production .env
   # 编辑环境变量
   ```

2. **启动服务**
   ```bash
   # 构建并启动所有服务
   docker-compose up -d
   
   # 查看服务状态
   docker-compose ps
   
   # 查看日志
   docker-compose logs -f app
   ```

3. **扩展服务**
   ```bash
   # 扩展应用实例
   docker-compose up -d --scale app=3
   ```

**Docker Swarm 集群部署**

```bash
# 初始化 Swarm
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.prod.yml wangai-studio

# 查看服务状态
docker service ls
docker service logs wangai-studio_app
```

#### 方式三：Kubernetes 部署

```bash
# 应用 Kubernetes 配置
kubectl apply -f k8s/

# 查看部署状态
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/wangai-studio-server
```

### 部署验证

```bash
# 检查服务状态
curl http://localhost:3000/health

# 检查 API 响应
curl http://localhost:3000/api/v1/status

# 检查数据库连接
curl http://localhost:3000/api/v1/health/database
```

### 性能优化

#### PM2 集群模式

```bash
# 使用所有 CPU 核心
pm2 start ecosystem.config.js --env production

# 手动指定实例数
pm2 start dist/main.js -i 4 --name "wangai-studio-server"
```

#### Nginx 负载均衡

```nginx
upstream wangai_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://wangai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 监控和日志

#### 应用监控

```bash
# PM2 监控
pm2 monit

# 查看日志
pm2 logs wangai-studio-server

# 系统资源监控
./shell/monitor.sh
```

#### 日志管理

```bash
# 日志轮转配置
sudo nano /etc/logrotate.d/wangai-studio-server

# 内容示例
/var/www/wangai-studio-server/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reload wangai-studio-server
    endscript
}
```

## 📚 API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 认证接口

#### 用户注册

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "testuser"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "username": "testuser"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 用户登录

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### AI 服务接口

#### 文本生成

```http
POST /api/v1/llm/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "qwen-turbo",
  "prompt": "请写一个关于人工智能的短文",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

#### 流式文本生成

```http
POST /api/v1/llm/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "user",
      "content": "解释一下机器学习的基本概念"
    }
  ],
  "stream": true
}
```

### 小说创作接口

#### 创建小说

```http
POST /api/v1/novel/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "科幻小说标题",
  "genre": "科幻",
  "outline": "小说大纲描述",
  "characters": [
    {
      "name": "主角姓名",
      "description": "角色描述"
    }
  ]
}
```

#### 续写小说

```http
POST /api/v1/novel/{novelId}/continue
Authorization: Bearer <token>
Content-Type: application/json

{
  "chapterTitle": "第一章",
  "previousContent": "前文内容",
  "direction": "情节发展方向",
  "wordCount": 1000
}
```

### WebSocket 接口

#### 连接建立

```javascript
// 客户端连接示例
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// 监听连接事件
socket.on('connect', () => {
  console.log('Connected to server');
});

// 监听 AI 响应
socket.on('ai-response', (data) => {
  console.log('AI Response:', data);
});
```

#### 实时 AI 对话

```javascript
// 发送消息
socket.emit('ai-chat', {
  message: '你好，请介绍一下自己',
  model: 'qwen-turbo',
  conversationId: 'conv-123'
});

// 接收响应
socket.on('ai-chat-response', (response) => {
  console.log('AI:', response.content);
});
```

### 错误处理

所有 API 错误响应遵循统一格式：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  }
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求频率限制 |
| 500 | 服务器内部错误 |

## 📁 项目结构

```
wangai-studio-server/
├── 📁 src/                    # 源代码目录
│   ├── 📁 admin/              # 管理员模块
│   ├── 📁 common/             # 公共模块
│   │   ├── 📁 decorators/     # 装饰器
│   │   ├── 📁 filters/        # 异常过滤器
│   │   ├── 📁 guards/         # 守卫
│   │   ├── 📁 interceptors/   # 拦截器
│   │   └── 📁 pipes/          # 管道
│   ├── 📁 database/           # 数据库模块
│   ├── 📁 documents/          # 文档处理模块
│   ├── 📁 llm/                # AI 模型集成模块
│   ├── 📁 middlewares/        # 中间件
│   ├── 📁 novel/              # 小说创作模块
│   ├── 📁 prompter/           # 提示词管理模块
│   ├── 📁 socket/             # WebSocket 模块
│   ├── 📁 template/           # 模板系统模块
│   ├── 📁 user/               # 用户管理模块
│   ├── 📁 userTarget/         # 用户目标模块
│   ├── 📄 app.controller.ts   # 应用控制器
│   ├── 📄 app.module.ts       # 应用模块
│   ├── 📄 app.service.ts      # 应用服务
│   └── 📄 main.ts             # 应用入口
├── 📁 test/                   # 测试文件
├── 📁 shell/                  # 部署脚本
├── 📁 nginx/                  # Nginx 配置
├── 📁 public/                 # 静态资源
├── 📄 .env.development        # 开发环境配置
├── 📄 .env.production         # 生产环境配置
├── 📄 docker-compose.yml      # Docker Compose 配置
├── 📄 Dockerfile              # Docker 镜像配置
├── 📄 ecosystem.config.js     # PM2 配置
├── 📄 package.json            # 项目依赖
├── 📄 tsconfig.json           # TypeScript 配置
└── 📄 README.md               # 项目说明
```

### 核心模块说明

#### LLM 模块 (`src/llm/`)
- **功能**: AI 模型集成和管理
- **支持模型**: 阿里云通义千问、豆包、DeepSeek、Kimi、Gemini
- **特性**: 统一接口、流式响应、智能路由

#### Socket 模块 (`src/socket/`)
- **功能**: WebSocket 实时通信
- **特性**: 实时 AI 对话、多用户协作、消息推送

#### Novel 模块 (`src/novel/`)
- **功能**: 智能小说创作
- **特性**: 角色管理、情节生成、章节续写

#### User 模块 (`src/user/`)
- **功能**: 用户认证和管理
- **特性**: JWT 认证、权限控制、用户资料

#### Template 模块 (`src/template/`)
- **功能**: 内容生成模板
- **特性**: 自定义模板、模板分类、模板共享

## 🛠 开发指南

### 开发环境设置

1. **IDE 推荐**: Visual Studio Code
2. **必需插件**:
   - TypeScript and JavaScript Language Features
   - Prettier - Code formatter
   - ESLint
   - Thunder Client (API 测试)

### 代码规范

#### TypeScript 规范

```typescript
// 使用接口定义数据结构
interface CreateUserDto {
  email: string;
  password: string;
  username?: string;
}

// 使用装饰器进行验证
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  username?: string;
}
```

#### 服务层示例

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }
}
```

#### 控制器示例

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
```

### 数据库设计

#### MongoDB Schema 示例

```typescript
import { Schema, Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
}, {
  timestamps: true,
});
```

### 添加新的 AI 模型

1. **创建模型适配器**

```typescript
// src/llm/adapters/new-model.adapter.ts
import { Injectable } from '@nestjs/common';
import { LLMAdapter } from './base.adapter';

@Injectable()
export class NewModelAdapter extends LLMAdapter {
  async generateText(prompt: string, options: any): Promise<string> {
    // 实现具体的 API 调用逻辑
    return 'Generated text';
  }

  async streamText(prompt: string, options: any): AsyncGenerator<string> {
    // 实现流式响应逻辑
    yield 'Streaming text';
  }
}
```

2. **注册模型**

```typescript
// src/llm/llm.module.ts
import { NewModelAdapter } from './adapters/new-model.adapter';

@Module({
  providers: [
    // ... 其他适配器
    NewModelAdapter,
  ],
})
export class LlmModule {}
```

### 环境变量管理

```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.MONGO_HOST,
    port: parseInt(process.env.MONGO_PORT, 10) || 27017,
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL,
    },
  },
});
```

## 🧪 测试

### 运行测试

```bash
# 单元测试
pnpm run test

# 端到端测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov

# 监听模式
pnpm run test:watch
```

### 测试示例

#### 单元测试

```typescript
// src/user/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = module.get(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

#### 端到端测试

```typescript
// test/user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      })
      .expect(201);
  });
});
```

### 测试数据库

```typescript
// test/database.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

export const rootMongooseTestModule = (options: any = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是报告 bug、提出新功能建议，还是提交代码改进，都对项目的发展非常有价值。

### 如何贡献

#### 1. 报告问题

如果您发现了 bug 或有功能建议，请：

1. 检查 [Issues](https://github.com/your-username/wangai-studio-server/issues) 确认问题未被报告
2. 创建新的 Issue，详细描述：
   - 问题的具体表现
   - 复现步骤
   - 期望的行为
   - 系统环境信息
   - 相关的错误日志

#### 2. 提交代码

**Fork 和克隆**

```bash
# Fork 项目到您的 GitHub 账户
# 然后克隆到本地
git clone https://github.com/your-username/wangai-studio-server.git
cd wangai-studio-server

# 添加上游仓库
git remote add upstream https://github.com/original-owner/wangai-studio-server.git
```

**创建功能分支**

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name

# 或修复 bug
git checkout -b fix/your-bug-fix
```

**开发和测试**

```bash
# 安装依赖
pnpm install

# 运行测试
pnpm run test
pnpm run test:e2e

# 代码格式化
pnpm run format

# 类型检查
pnpm run build
```

**提交更改**

```bash
# 添加更改
git add .

# 提交（请使用有意义的提交信息）
git commit -m "feat: 添加新的 AI 模型支持"

# 推送到您的 fork
git push origin feature/your-feature-name
```

**创建 Pull Request**

1. 在 GitHub 上创建 Pull Request
2. 详细描述您的更改
3. 确保所有测试通过
4. 等待代码审查

### 代码规范

#### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

**示例**：
```
feat(llm): 添加 Claude 模型支持

fix(auth): 修复 JWT 令牌过期处理

docs: 更新 API 文档

test(user): 添加用户服务单元测试
```

#### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 为公共 API 添加 JSDoc 注释
- 保持函数简洁，单一职责
- 使用有意义的变量和函数名

```typescript
/**
 * 生成 AI 文本内容
 * @param prompt 输入提示词
 * @param options 生成选项
 * @returns 生成的文本内容
 */
async generateText(prompt: string, options: GenerateOptions): Promise<string> {
  // 实现逻辑
}
```

#### 测试要求

- 新功能必须包含单元测试
- 重要功能需要端到端测试
- 测试覆盖率应保持在 80% 以上
- 测试应该清晰、独立、可重复

### 开发工作流

#### 1. 设置开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start:dev

# 运行测试（监听模式）
pnpm run test:watch
```

#### 2. 功能开发流程

1. **需求分析**: 明确功能需求和技术方案
2. **设计 API**: 设计接口和数据结构
3. **编写测试**: 先写测试，明确预期行为
4. **实现功能**: 编写实际代码
5. **集成测试**: 确保与现有功能兼容
6. **文档更新**: 更新相关文档

#### 3. 代码审查清单

- [ ] 代码符合项目规范
- [ ] 包含适当的测试
- [ ] 文档已更新
- [ ] 没有引入安全漏洞
- [ ] 性能影响可接受
- [ ] 向后兼容性

### 社区准则

#### 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境，无论：

- 性别、性别认同和表达
- 性取向
- 残疾
- 外貌
- 身体大小
- 种族
- 年龄
- 宗教

#### 预期行为

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表示同理心

#### 不可接受的行为

- 使用性化的语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 其他在专业环境中可能被认为不当的行为

### 获得帮助

如果您需要帮助或有疑问：

- 📧 **邮件**: support@wangai-studio.com
- 💬 **讨论**: [GitHub Discussions](https://github.com/your-username/wangai-studio-server/discussions)
- 🐛 **问题**: [GitHub Issues](https://github.com/your-username/wangai-studio-server/issues)
- 📖 **文档**: [项目文档](https://docs.wangai-studio.com)

## 🔒 安全

### 安全策略

我们非常重视安全问题。如果您发现了安全漏洞，请不要在公开的 Issue 中报告，而是：

1. 发送邮件到 security@wangai-studio.com
2. 详细描述漏洞和影响
3. 提供复现步骤（如果可能）
4. 我们会在 48 小时内回复

### 安全最佳实践

#### 环境变量安全

```bash
# 永远不要提交包含真实密钥的 .env 文件
# 使用强密码和复杂的 JWT 密钥
JWT_SECRET=your-very-long-and-complex-secret-key

# 定期轮换 API 密钥
OPENAI_API_KEY=sk-your-api-key
```

#### 数据库安全

```javascript
// 使用强密码
// 启用 MongoDB 认证
// 限制数据库访问权限
// 定期备份数据
```

#### API 安全

- 使用 HTTPS
- 实施速率限制
- 验证所有输入
- 使用 JWT 进行认证
- 实施适当的 CORS 策略

## 📊 性能

### 性能监控

```bash
# 使用 PM2 监控
pm2 monit

# 查看性能指标
pm2 show wangai-studio-server

# 内存使用情况
node --inspect dist/main.js
```

### 优化建议

#### 数据库优化

```javascript
// 创建适当的索引
db.users.createIndex({ email: 1 })
db.conversations.createIndex({ userId: 1, createdAt: -1 })

// 使用聚合管道优化查询
db.users.aggregate([
  { $match: { active: true } },
  { $project: { email: 1, username: 1 } }
])
```

#### 缓存策略

```typescript
// Redis 缓存示例
@Injectable()
export class CacheService {
  async get(key: string): Promise<any> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

## 🚀 路线图

### 近期计划 (Q1 2024)

- [ ] 添加更多 AI 模型支持
- [ ] 实现用户配额管理
- [ ] 优化 WebSocket 性能
- [ ] 添加 API 文档生成
- [ ] 实现数据导出功能

### 中期计划 (Q2-Q3 2024)

- [ ] 多语言支持
- [ ] 插件系统
- [ ] 高级分析功能
- [ ] 移动端 API 优化
- [ ] 企业级功能

### 长期计划 (Q4 2024+)

- [ ] 微服务架构重构
- [ ] AI 模型训练集成
- [ ] 边缘计算支持
- [ ] 区块链集成
- [ ] 国际化部署

## 📝 更新日志

### [0.0.1] - 2024-01-15

#### 新增
- 初始项目结构
- 基础 AI 模型集成
- 用户认证系统
- WebSocket 实时通信
- 小说创作功能
- Docker 部署支持

#### 修复
- 修复 JWT 认证问题
- 优化数据库连接
- 改进错误处理

#### 变更
- 更新依赖版本
- 重构代码结构
- 优化 API 响应格式

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

### 核心贡献者

- [@your-username](https://github.com/your-username) - 项目创始人
- [@contributor1](https://github.com/contributor1) - AI 模型集成
- [@contributor2](https://github.com/contributor2) - 前端开发

### 特别感谢

- [NestJS](https://nestjs.com/) - 优秀的 Node.js 框架
- [LangChain](https://langchain.com/) - AI 应用开发框架
- [MongoDB](https://www.mongodb.com/) - 灵活的文档数据库
- [Redis](https://redis.io/) - 高性能缓存

### 赞助商

如果这个项目对您有帮助，请考虑赞助我们：

- ☕ [Buy me a coffee](https://buymeacoffee.com/wangai-studio)
- 💝 [GitHub Sponsors](https://github.com/sponsors/your-username)
- 🎯 [Patreon](https://patreon.com/wangai-studio)

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

```
MIT License

Copyright (c) 2024 WangAI Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**[⬆ 回到顶部](#wangai-studio-server)**

如果这个项目对您有帮助，请给我们一个 ⭐️！

[报告问题](https://github.com/your-username/wangai-studio-server/issues) • [功能建议](https://github.com/your-username/wangai-studio-server/discussions) • [贡献代码](https://github.com/your-username/wangai-studio-server/pulls)

</div>