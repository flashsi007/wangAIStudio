# 🖋️ 网文大神助手 (WangAI Studio)

> 基于AI的智能网文创作平台，让每个人都能成为网文大神

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

## ✨ 项目简介

网文大神助手是一个现代化的网络小说创作平台，集成了AI写作助手、可视化大纲管理、智能章节编辑等功能，旨在为网文作者提供最佳的创作体验。

### 🎯 核心特色

- 🤖 **AI智能写作** - 基于大语言模型的智能续写和创意激发
- 🗺️ **可视化大纲** - 思维导图式的故事结构规划
- 📝 **专业编辑器** - 基于Tiptap的富文本编辑体验
- 👥 **角色管理** - 系统化的人物设定和关系管理
- 📚 **章节管理** - 智能的章节组织和版本控制
- 🎨 **现代界面** - 响应式设计，支持多主题切换
- ⚡ **实时协作** - 多设备同步，实时保存

## 📋 目录

- [快速开始](#-快速开始)
- [环境要求](#-环境要求)
- [本地开发](#-本地开发)
- [生产部署](#-生产部署)
  - [传统部署](#传统部署)
  - [Docker部署](#docker部署)
  - [PM2部署](#pm2部署)
- [环境变量配置](#-环境变量配置)
- [功能特性](#-功能特性)
- [技术栈](#️-技术栈)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [贡献指南](#-贡献指南)

## 🚀 快速开始

### 📋 环境要求

在开始之前，请确保您的系统满足以下要求：

- **Node.js**: 18.0 或更高版本 ([下载地址](https://nodejs.org/))
- **pnpm**: 8.0 或更高版本 ([安装指南](https://pnpm.io/installation))
- **Git**: 用于克隆项目 ([下载地址](https://git-scm.com/))

### 💻 本地开发

#### 1. 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/flashsi007/wangAIStudio.git

# 或使用 SSH
git@github.com:flashsi007/wangAIStudio.git

# 进入项目目录
cd wangai-studio
```

#### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install
```

#### 3. 环境配置

创建环境变量文件：

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local  # 或使用您喜欢的编辑器
```

#### 4. 启动开发服务器

```bash
# 启动开发服务器（使用 Turbopack 加速）
pnpm dev
```

#### 5. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🚀 生产部署

### 传统部署

#### 1. 构建项目

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm build
```

#### 2. 启动生产服务器

```bash
# 启动生产服务器（端口 3001）
pnpm start

# 或者指定其他端口
PORT=8080 pnpm start
```

#### 3. 使用进程管理器（推荐）

```bash
# 全局安装 PM2
npm install -g pm2

# 使用 PM2 启动应用
pnpm pm2:start

# 查看应用状态
pnpm pm2:status

# 查看日志
pnpm pm2:logs
```

### Docker部署

#### 方式一：使用 Docker Compose（推荐）

```bash
# 1. 创建环境变量文件
cp .env.example .env.production

# 2. 编辑生产环境变量
nano .env.production

# 3. 构建并启动容器
docker-compose up -d

# 4. 查看容器状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f wangai-studio
```

#### 方式二：使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t wangai-studio .

# 2. 运行容器
docker run -d \
  --name wangai-studio \
  -p 3001:3001 \
  --env-file .env.production \
  --restart unless-stopped \
  wangai-studio

# 3. 查看容器状态
docker ps

# 4. 查看日志
docker logs -f wangai-studio
```

### PM2部署

#### 1. 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2
```

#### 2. 配置 PM2

编辑 `ecosystem.config.js` 文件，修改项目路径：

```javascript
module.exports = {
    apps: [
        {
            name: 'wangai-studio',
            cwd: '/path/to/your/wangai-studio', // 修改为您的项目路径
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
    ],
}
```

#### 3. 部署命令

```bash
# 构建项目
pnpm build

# 启动 PM2 应用
pnpm pm2:start

# 其他 PM2 命令
pnpm pm2:stop      # 停止应用
pnpm pm2:restart   # 重启应用
pnpm pm2:reload    # 重载应用（零停机）
pnpm pm2:delete    # 删除应用
pnpm pm2:logs      # 查看日志
pnpm pm2:status    # 查看状态
```

## 🔧 环境变量配置

创建 `.env.local`（开发环境）或 `.env.production`（生产环境）文件：

```bash
# 应用配置
NEXT_PUBLIC_APP_NAME="网文大神助手"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# API 配置
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# AI 模型配置
OPENAI_API_KEY="your-openai-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"

# 数据库配置（如果需要）
DATABASE_URL="your-database-url"

# 其他配置
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
```

### 环境变量说明

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | 否 | 网文大神助手 |
| `NEXT_PUBLIC_APP_URL` | 应用URL | 否 | http://localhost:3000 |
| `NEXT_PUBLIC_API_URL` | API地址 | 否 | /api |
| `OPENAI_API_KEY` | OpenAI API密钥 | 是 | - |
| `OPENAI_BASE_URL` | OpenAI API地址 | 否 | https://api.openai.com/v1 |
| `DATABASE_URL` | 数据库连接字符串 | 否 | - |

## 🔍 故障排除

### 常见问题

#### 1. 端口占用问题

```bash
# 查看端口占用情况
netstat -ano | findstr :3000

# 杀死占用端口的进程
taskkill /PID <进程ID> /F

# 或者使用其他端口启动
PORT=3001 pnpm dev
```

#### 2. 依赖安装失败

```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

#### 3. 构建失败

```bash
# 检查 Node.js 版本
node --version

# 检查 TypeScript 错误
pnpm type-check

# 清理构建缓存
rm -rf .next
pnpm build
```

#### 4. Docker 构建问题

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建镜像
docker-compose build --no-cache

# 查看构建日志
docker-compose logs wangai-studio
```

### 性能优化

#### 1. 生产环境优化

```bash
# 启用 gzip 压缩
export COMPRESS=true

# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 启用 PM2 集群模式
pnpm pm2:start
```

#### 2. Docker 优化

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  wangai-studio:
    # ... 其他配置
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

## 🔒 安全配置

### 1. 环境变量安全

```bash
# 设置文件权限（Linux/macOS）
chmod 600 .env.production

# 确保敏感信息不被提交
echo ".env*" >> .gitignore
```

### 2. 反向代理配置（Nginx）

创建 `/etc/nginx/sites-available/wangai-studio`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 监控和日志

### 1. PM2 监控

```bash
# 安装 PM2 监控
npm install -g @pm2/io

# 启动监控
pm2 install pm2-server-monit

# 查看实时监控
pm2 monit
```

### 2. 日志管理

```bash
# 查看应用日志
pnpm pm2:logs

# 查看错误日志
pm2 logs --err

# 清理日志
pm2 flush

# 设置日志轮转
pm2 install pm2-logrotate
```

### 3. Docker 日志

```bash
# 查看容器日志
docker-compose logs -f --tail=100 wangai-studio

# 限制日志大小
# 在 docker-compose.yml 中添加：
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🔄 更新和维护

### 1. 应用更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install

# 重新构建
pnpm build

# 重启应用
pnpm pm2:reload  # 零停机重启
```

### 2. Docker 更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

### 3. 备份策略

```bash
# 备份用户数据（如果有数据库）
# 示例：备份 SQLite 数据库
cp data/database.sqlite data/backup/database_$(date +%Y%m%d_%H%M%S).sqlite

# 备份配置文件
tar -czf backup/config_$(date +%Y%m%d_%H%M%S).tar.gz .env.production ecosystem.config.js
```

## 📋 功能特性

### 🤖 AI写作助手

- **智能续写**: 基于上下文的内容生成
- **创意激发**: AI提供情节建议和转折点
- **风格学习**: 自适应作者写作风格
- **多模型支持**: 支持多种AI模型切换

### 📝 专业编辑器

- **富文本编辑**: 基于Tiptap的现代编辑器
- **实时字数统计**: 精确的字数和阅读时间统计
- **格式化工具**: 丰富的文本格式化选项
- **快捷操作**: 斜杠命令和快捷键支持

### 🗺️ 可视化大纲

- **思维导图**: 直观的故事结构规划
- **角色关系图**: 复杂人物关系可视化
- **世界观构建**: 系统性的设定管理
- **情节线管理**: 多条故事线的交织规划

### 📚 内容管理

- **章节组织**: 灵活的章节结构管理
- **版本控制**: 自动保存和历史版本管理
- **标签分类**: 多维度的内容分类系统
- **搜索功能**: 全文搜索和智能筛选

### 🎨 用户体验

- **响应式设计**: 完美适配桌面和移动设备
- **主题切换**: 明暗主题和多种配色方案
- **个性化设置**: 丰富的个人偏好配置
- **无障碍支持**: 符合WCAG标准的可访问性

## 🛠️ 技术栈

### 前端框架
- **Next.js 15** - React全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的JavaScript

### UI组件
- **Radix UI** - 无样式的可访问组件库
- **Tailwind CSS** - 实用优先的CSS框架
- **Lucide React** - 现代图标库

### 编辑器
- **Tiptap** - 可扩展的富文本编辑器
- **ProseMirror** - 编辑器核心引擎

### 状态管理
- **Zustand** - 轻量级状态管理
- **React Hooks** - 组件状态管理

### 工具库
- **Axios** - HTTP客户端
- **Socket.io** - 实时通信
- **JSZip** - 文件压缩
- **UUID** - 唯一标识符生成

## 📁 项目结构

```
wangai-studio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API路由
│   │   ├── dashboard/         # 仪表板页面
│   │   ├── edit/              # 编辑器页面
│   │   ├── login/             # 登录页面
│   │   └── template/          # 模板页面
│   ├── components/            # 可复用组件
│   │   ├── Editor/            # 编辑器组件
│   │   ├── MinMap/            # 思维导图组件
│   │   └── ui/                # UI基础组件
│   ├── hooks/                 # 自定义Hooks
│   ├── store/                 # 状态管理
│   ├── lib/                   # 工具函数
│   └── types/                 # TypeScript类型定义
├── public/                    # 静态资源
└── docs/                      # 项目文档
```

## 🔧 开发指南

### 代码规范

项目使用ESLint和TypeScript进行代码质量控制：

```bash
# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

### 组件开发

- 使用函数式组件和Hooks
- 遵循单一职责原则
- 使用TypeScript进行类型定义
- 采用Tailwind CSS进行样式开发

### 状态管理

使用Zustand进行全局状态管理：

```typescript
// 示例：创建store
import { create } from 'zustand'

interface NovelStore {
  novels: Novel[]
  currentNovel: Novel | null
  setCurrentNovel: (novel: Novel) => void
}

export const useNovelStore = create<NovelStore>((set) => ({
  novels: [],
  currentNovel: null,
  setCurrentNovel: (novel) => set({ currentNovel: novel }),
}))
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **报告问题** - 在Issues中报告bug或提出功能建议
2. **提交代码** - Fork项目并提交Pull Request
3. **改进文档** - 帮助完善项目文档
4. **分享反馈** - 分享使用体验和改进建议

### 开发流程

1. Fork项目到你的GitHub账户
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的支持：

- [Next.js](https://nextjs.org/) - React全栈框架
- [Tiptap](https://tiptap.dev/) - 现代编辑器
- [Radix UI](https://www.radix-ui.com/) - 无样式组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

## 📞 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-username/wangai-studio)
- 问题反馈: [Issues](https://github.com/your-username/wangai-studio/issues)
- 邮箱: your-email@example.com

---

<div align="center">
  <p>用AI赋能创作，让每个人都能成为网文大神 ✨</p>
  <p>Made with ❤️ by WangAI Studio Team</p>
</div>

useState, useEffect, useMemo, useRef, useCallback, memo 
/edit/64c8a3b5e7d8f6a1f4d3b2c1
# 一次性赋予可执行权限
chmod +x /home/www.wangai.studio/deploy.sh

# 以后每次需要更新项目时
./deploy.sh
