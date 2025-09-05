# Socket 模块

这是一个基于 Socket.IO 的实时通信模块，提供了用户连接管理、房间管理、任务处理等功能。

## 功能特性

### 1. 用户连接管理
- 用户认证和连接管理
- 自动处理连接和断开连接
- 在线用户统计
- 心跳检测机制

### 2. 房间管理
- 用户可以加入和离开房间
- 房间内消息广播
- 房间用户列表管理
- 自动清理空房间

### 3. 任务处理
- 异步任务提交和处理
- 任务状态通知
- 错误处理和反馈

### 4. 广播功能
- 向所有在线用户广播消息
- 向特定用户发送消息
- 向房间内用户发送消息

## API 事件

### 客户端发送事件

#### 1. 用户认证
```javascript
socket.emit('auth', {
  userId: 'user123'
});
```

#### 2. 任务提交
```javascript
socket.emit('task:submit', {
  taskType: 'data_processing',
  taskData: {
    // 任务相关数据
  }
});
```

#### 3. 加入房间
```javascript
socket.emit('room:join', {
  roomId: 'room123'
});
```

#### 4. 离开房间
```javascript
socket.emit('room:leave', {
  roomId: 'room123'
});
```

#### 5. 房间消息
```javascript
socket.emit('room:message', {
  roomId: 'room123',
  message: 'Hello everyone!'
});
```

#### 6. 获取房间信息
```javascript
socket.emit('room:info', {
  roomId: 'room123'
});
```

#### 7. 获取在线统计
```javascript
socket.emit('stats:request');
```

#### 8. 心跳检测
```javascript
socket.emit('ping');
```

### 服务器发送事件

#### 1. 连接成功
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // { message: 'Connected to server', socketId: 'xxx', timestamp: 'xxx' }
});
```

#### 2. 认证响应
```javascript
socket.on('auth:success', (data) => {
  console.log('Auth success:', data);
});

socket.on('auth:error', (data) => {
  console.log('Auth error:', data);
});
```

#### 3. 任务状态
```javascript
socket.on('task:started', (data) => {
  console.log('Task started:', data);
});

socket.on('task:completed', (data) => {
  console.log('Task completed:', data);
});

socket.on('task:failed', (data) => {
  console.log('Task failed:', data);
});

socket.on('task:error', (data) => {
  console.log('Task error:', data);
});
```

#### 4. 房间事件
```javascript
socket.on('room:joined', (data) => {
  console.log('Joined room:', data);
});

socket.on('room:left', (data) => {
  console.log('Left room:', data);
});

socket.on('room:user_joined', (data) => {
  console.log('User joined room:', data);
});

socket.on('room:user_left', (data) => {
  console.log('User left room:', data);
});

socket.on('room:message', (data) => {
  console.log('Room message:', data);
});

socket.on('room:info', (data) => {
  console.log('Room info:', data);
});

socket.on('room:error', (data) => {
  console.log('Room error:', data);
});
```

#### 5. 统计信息
```javascript
socket.on('stats:response', (data) => {
  console.log('Stats:', data);
});

socket.on('stats:online', (data) => {
  console.log('Online stats:', data);
});
```

#### 6. 心跳响应
```javascript
socket.on('pong', (data) => {
  console.log('Pong:', data);
});
```

## 使用示例

### 客户端连接示例
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// 连接成功
socket.on('connected', (data) => {
  console.log('Connected to server:', data.socketId);
  
  // 用户认证
  socket.emit('auth', {
    userId: 'user123'
  });
});

// 认证成功后加入房间
socket.on('auth:success', (data) => {
  console.log('Authenticated as:', data.userId);
  
  // 加入房间
  socket.emit('room:join', {
    roomId: 'general'
  });
});

// 监听房间消息
socket.on('room:message', (data) => {
  console.log(`${data.userId}: ${data.message}`);
});

// 发送房间消息
function sendMessage(message) {
  socket.emit('room:message', {
    roomId: 'general',
    message: message
  });
}
```

## 文件结构

```
src/socket/
├── dto/
│   ├── index.ts          # DTO 导出文件
│   └── socket.dto.ts     # Socket 数据传输对象定义
├── socket.gateway.ts     # Socket 网关，处理客户端事件
├── socket.service.ts     # Socket 服务，业务逻辑处理
├── socket.module.ts      # Socket 模块定义
└── README.md            # 模块说明文档
```

## 技术栈

- **NestJS**: 后端框架
- **Socket.IO**: WebSocket 通信库
- **class-validator**: 数据验证
- **TypeScript**: 类型安全

## 注意事项

1. 用户必须先进行认证才能使用房间和任务功能
2. 用户断开连接时会自动清理相关的房间关联
3. 空房间会被自动删除
4. 所有事件都包含时间戳信息
5. 使用了数据验证管道确保数据格式正确

## 扩展功能

可以根据业务需求扩展以下功能：

- 私聊功能
- 文件传输
- 音视频通话
- 消息持久化
- 用户权限管理
- 房间权限控制
- 消息加密
- 离线消息推送