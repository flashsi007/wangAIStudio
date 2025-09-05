# WangAI Studio Server - 生产环境部署总览

本项目提供了完整的生产环境部署解决方案，支持传统部署和容器化部署两种方式。

## 📁 部署文件结构

```
wangai-studio-server/
├── 📄 部署配置文件
│   ├── ecosystem.config.js      # PM2 配置文件
│   ├── .env.production         # 生产环境变量
│   ├── docker/                 # Docker 配置目录
│   │   ├── Dockerfile          # Docker 镜像构建文件
│   │   ├── docker-compose.yml  # Docker Compose 配置
│   │   └── .dockerignore       # Docker 忽略文件
│   └── shell/                  # 部署脚本目录
│       ├── deploy.sh           # Ubuntu 一键部署脚本
│       ├── pm2-manager.sh      # PM2 应用管理脚本
│       ├── setup-ssl.sh        # SSL 证书配置脚本
│       ├── monitor.sh          # 系统监控脚本
│       ├── quick-deploy.sh     # 快速更新部署脚本
│       └── docker-deploy.sh    # Docker 容器化部署脚本
│
└── 📚 文档
    ├── DEPLOYMENT.md           # 详细部署指南
    └── README-DEPLOYMENT.md   # 部署总览（本文件）
```

## 🎯 部署方式选择

### 传统部署 (推荐生产环境)

**适用场景：**
- 生产环境
- 需要最大性能
- 对系统有完全控制权
- 长期稳定运行

**优势：**
- ✅ 性能最优
- ✅ 资源利用率高
- ✅ 便于系统级优化
- ✅ 直接访问系统资源

**部署命令：**
```bash
# 一键部署
sudo ./deploy.sh

# 应用管理
./pm2-manager.sh [command]

# 快速更新
./quick-deploy.sh
```

### 容器化部署 (推荐开发测试)

**适用场景：**
- 开发环境
- 测试环境
- 快速部署
- 多环境隔离

**优势：**
- ✅ 环境一致性
- ✅ 快速部署
- ✅ 易于扩展
- ✅ 服务隔离

**部署命令：**
```bash
# 初始化并启动
./docker-deploy.sh setup
./docker-deploy.sh build
./docker-deploy.sh start

# 或一键启动
./docker-deploy.sh start --monitoring
```

## ⚡ 快速开始

### 1. 选择部署方式

#### 传统部署
```bash
# 克隆项目
git clone <your-repo> /var/www/wangai-studio-server
cd /var/www/wangai-studio-server

# 设置权限
chmod +x shell/*.sh

# 一键部署
sudo ./shell/deploy.sh
```

#### Docker部署
```bash
# 克隆项目
git clone <your-repo> wangai-studio-server
cd wangai-studio-server

# 设置权限
chmod +x shell/docker-deploy.sh

# 初始化并启动
./shell/docker-deploy.sh setup
./shell/docker-deploy.sh build
./shell/docker-deploy.sh start
```

### 2. 配置环境变量

编辑 `.env.production` 文件：
```bash
nano .env.production
```

### 3. 配置SSL（可选）

```bash
# 传统部署
./setup-ssl.sh your-domain.com

# Docker部署需要手动配置SSL证书
```

### 4. 验证部署

```bash
# 传统部署
./pm2-manager.sh health
./monitor.sh --all

# Docker部署
./docker-deploy.sh status
./docker-deploy.sh logs
```

## 🛠️ 常用管理命令

### 传统部署管理

```bash
# 应用管理
./shell/pm2-manager.sh start|stop|restart|reload
./shell/pm2-manager.sh status|logs|health

# 部署更新
./shell/pm2-manager.sh deploy
./shell/quick-deploy.sh

# 系统监控
./shell/monitor.sh --all
./shell/monitor.sh --watch

# 备份回滚
./shell/pm2-manager.sh backup
./shell/pm2-manager.sh rollback
```

### Docker部署管理

```bash
# 服务管理
./shell/docker-deploy.sh start|stop|restart
./shell/docker-deploy.sh status|logs

# 应用更新
./shell/docker-deploy.sh update
./shell/docker-deploy.sh build

# 数据管理
./shell/docker-deploy.sh backup
./shell/docker-deploy.sh clean

# 容器操作
./shell/docker-deploy.sh shell [service]
```

## 📊 监控和日志

### 传统部署监控

```bash
# 实时监控
pm2 monit
./shell/monitor.sh --watch

# 日志查看
pm2 logs wangai-studio-server
tail -f /var/www/wangai-studio-server/logs/error.log

# 系统状态
./shell/monitor.sh --system
./shell/monitor.sh --alert
```

### Docker部署监控

```bash
# 容器监控
docker stats
./shell/docker-deploy.sh status

# 日志查看
./shell/docker-deploy.sh logs
./shell/docker-deploy.sh logs app

# 监控服务（Grafana + Prometheus）
./shell/docker-deploy.sh start --monitoring
# 访问 http://localhost:3001 (Grafana)
# 访问 http://localhost:9090 (Prometheus)
```

## 🔧 故障排除

### 常见问题

1. **应用无法启动**
   ```bash
   # 传统部署
   pm2 logs wangai-studio-server --err
   ./shell/pm2-manager.sh health
   
   # Docker部署
   ./shell/docker-deploy.sh logs app
   docker exec -it wangai-studio-server /bin/sh
   ```

2. **数据库连接失败**
   ```bash
   # 传统部署
   sudo systemctl status mongod
   sudo systemctl status redis-server
   
   # Docker部署
   ./shell/docker-deploy.sh logs mongodb
   ./shell/docker-deploy.sh logs redis
   ```

3. **端口被占用**
   ```bash
   # 检查端口
   sudo netstat -tlnp | grep :3000
   
   # Docker端口冲突
   docker ps
   ./shell/docker-deploy.sh stop
   ```

### 性能优化

1. **PM2集群模式**
   - 编辑 `ecosystem.config.js`
   - 设置 `instances: 'max'`

2. **Nginx优化**
   - 启用gzip压缩
   - 配置缓存策略
   - 调整worker进程数

3. **数据库优化**
   - MongoDB索引优化
   - Redis内存配置
   - 连接池设置

## 🔒 安全配置

### 必要的安全措施

1. **防火墙配置**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

2. **SSL证书**
   ```bash
   ./shell/setup-ssl.sh your-domain.com
   ```

3. **数据库安全**
   - 修改默认密码
   - 启用认证
   - 限制访问IP

4. **应用安全**
   - 更新依赖包
   - 配置CORS
   - 设置安全头

## 📈 扩展和优化

### 水平扩展

1. **负载均衡**
   - Nginx upstream配置
   - PM2集群模式
   - Docker Swarm/Kubernetes

2. **数据库集群**
   - MongoDB副本集
   - Redis集群
   - 读写分离

3. **CDN和缓存**
   - 静态资源CDN
   - Redis缓存策略
   - Nginx缓存配置

### 监控告警

1. **系统监控**
   - Prometheus + Grafana
   - 自定义监控脚本
   - 日志聚合

2. **告警通知**
   - 邮件告警
   - 短信通知
   - Webhook集成

## 📞 技术支持

### 获取帮助

1. **查看文档**
   - `DEPLOYMENT.md` - 详细部署指南
   - 各脚本的 `--help` 选项

2. **日志分析**
   - 应用日志：`./logs/`
   - 系统日志：`journalctl`
   - 服务日志：`pm2 logs` 或 `docker logs`

3. **健康检查**
   ```bash
   # 传统部署
   ./shell/pm2-manager.sh health
   ./shell/monitor.sh --alert
   
   # Docker部署
   ./shell/docker-deploy.sh status
   docker ps
   ```

### 维护建议

- **定期备份**：每日自动备份数据
- **安全更新**：定期更新系统和依赖
- **监控检查**：设置自动化监控告警
- **性能调优**：根据负载调整配置
- **文档更新**：记录配置变更和问题解决方案

---

**注意**：在生产环境中使用前，请确保：
1. 修改所有默认密码
2. 配置正确的域名和SSL证书
3. 设置适当的防火墙规则
4. 配置监控和告警系统
5. 制定备份和恢复策略