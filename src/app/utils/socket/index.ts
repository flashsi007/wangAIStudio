import { io, Socket } from 'socket.io-client'

class SocketManager {
  private static instance: SocketManager
  url: string | undefined
  socket: Socket | null
  isConnected: boolean
  eventCallbacks: Map<string, Function[]>
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 10000
  private isManualDisconnect: boolean = false

  private constructor(url = process.env.NEXT_PUBLIC_AXIOS_BASE_URL) {
    this.url = url
    this.socket = null
    this.isConnected = false
    this.eventCallbacks = new Map()
  }

  public static getInstance(url?: string): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager(url)
    }
    return SocketManager.instance
  }

  // 连接到服务器
  connect() {
    // 如果已经有连接，先清理
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    this.isManualDisconnect = false

    // Socket.IO 连接配置
    this.socket = io(this.url, {
      transports: ['websocket', 'polling'], // 支持多种传输方式
      timeout: 20000, // 连接超时时间
      reconnection: false, // 禁用内置自动重连，使用自定义重连逻辑
      forceNew: true, // 强制创建新连接
      autoConnect: true, // 自动连接
    })

    // 基础连接事件 - 只绑定一次
    this.socket.once('connect', () => {
      this.isConnected = true
      this.reconnectAttempts = 0 // 重置重连计数
      this.emit('connect', { message: '连接到服务器成功', socketId: this.socket?.id })
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      this.emit('disconnect', { message: '与服务器断开连接', reason })

      // 如果不是手动断开且不是客户端主动断开，尝试重连
      // @ts-ignore
      if (!this.isManualDisconnect && reason !== 'io client disconnect' && reason !== 'client namespace disconnect') {
        this.scheduleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      this.isConnected = false
      this.emit('connect_error', error)

      // 连接错误时也尝试重连
      if (!this.isManualDisconnect) {
        this.scheduleReconnect()
      }
    })

    // 业务事件监听
    this.socket.on('connected', (data) => {
      this.emit('connected', data)
    })

    this.socket.on('auth:success', (data) => {
      this.emit('auth:success', data)
    })

    this.socket.on('auth:error', (data) => {
      this.emit('auth:error', data)
    })

    this.socket.on('task:started', (data) => {
      this.emit('task:started', data)
    })

    this.socket.on('task:completed', (data) => {
      this.emit('task:completed', data)
    })

    this.socket.on('task:failed', (data) => {
      this.emit('task:failed', data)
    })

    this.socket.on('task:error', (data) => {
      this.emit('task:error', data)
    })

    this.socket.on('stats:online', (data) => {
      this.emit('stats:online', data)
    })

    this.socket.on('stats:response', (data) => {
      this.emit('stats:response', data)
    })

    this.socket.on('pong', (data) => {
      this.emit('pong', data)
    })

    return this
  }

  // 断开连接
  disconnect() {
    this.isManualDisconnect = true // 标记为手动断开

    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.reconnectAttempts = 0
      this.emit('disconnect', { message: '主动断开连接' })
    }
  }

  // 调度重连
  private reconnectTimer: NodeJS.Timeout | null = null

  private scheduleReconnect() {
    // 清除之前的重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts || this.isManualDisconnect) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('reconnect_failed', { message: '重连失败，已达到最大重连次数' })
      }
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)

    this.emit('reconnect_attempt', {
      message: `准备重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      attemptNumber: this.reconnectAttempts,
      delay
    })

    this.reconnectTimer = setTimeout(() => {
      if (!this.isConnected && !this.isManualDisconnect) {
        this.performReconnect()
      }
      this.reconnectTimer = null
    }, delay)
  }

  // 执行重连
  private performReconnect() {
    try {
      this.connect()
    } catch (error) {
      console.error('重连失败:', error)
      this.emit('reconnect_error', { message: '重连失败', error })

      // 如果重连失败，继续调度下一次重连
      if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isManualDisconnect) {
        this.scheduleReconnect()
      }
    }
  }

  // 手动重连
  reconnect() {
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.isManualDisconnect = false
    this.reconnectAttempts = 0
    this.connect()
    return this
  }

  // 设置重连配置
  setReconnectConfig(maxAttempts: number = 5, delay: number = 1000) {
    this.maxReconnectAttempts = maxAttempts
    this.reconnectDelay = delay
    return this
  }

  // 认证
  authenticate(userId: string) {


    console.log('开始认证:', userId);

    if (!this.socket || !this.isConnected) {
      throw new Error('请先连接到服务器')
    }

    if (!userId) {
      throw new Error('请提供用户ID')
    }
    this.socket.emit('auth', { userId })
    return this
  }

  /**
   * @description 提交任务
   * @param {string} taskType 任务类型  analysis |processing |generation
   * @param {any} taskData 任务数据
   * @returns {SocketManager}
   */
  submitTask(taskType: string, taskData: any) {

    if (!this.socket || !this.isConnected) {
      throw new Error('请先连接到服务器');
    }

    if (!taskType) {
      throw new Error('请提供任务类型');
    }

    // 如果taskData是字符串，尝试解析为JSON
    let parsedTaskData = taskData;
    if (typeof taskData === 'string') {
      try {
        parsedTaskData = JSON.parse(taskData);
      } catch (e) {
        throw new Error('任务数据格式错误，请提供有效的JSON格式数据');
      }
    }
 
    this.socket.emit('task:submit', { taskType, taskData: parsedTaskData }); 
    return this;
  }

  // 获取统计信息
  getStats() {
    if (!this.socket || !this.isConnected) {
      throw new Error('请先连接到服务器')
    }

    this.socket.emit('stats:request')
    return this
  }

  // 心跳检测
  ping() {
    if (!this.socket || !this.isConnected) {
      throw new Error('请先连接到服务器')
    }

    this.socket.emit('ping')
    return this
  }

  // 事件监听
  on(event: string, callback: Function) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }

    this.eventCallbacks.get(event)!.push(callback);
    return this;
  }

  // 移除事件监听
  off(event: string, callback: Function) {
    if (this.eventCallbacks.has(event)) {
      const callbacks = this.eventCallbacks.get(event)!;
      const index = callbacks.indexOf(callback);
      
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    
    return this;
  }

  // 触发事件
  emit(event: string, data?: any) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      url: this.url,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      isManualDisconnect: this.isManualDisconnect
    }
  }

  // 清理所有事件监听器
  removeAllListeners() {
    this.eventCallbacks.clear()
    if (this.socket) {
      this.socket.removeAllListeners()
    }
    return this
  }

  // 检查连接健康状态
  checkHealth() {
    if (!this.socket || !this.isConnected) {
      return { healthy: false, reason: '未连接' }
    }

    return {
      healthy: true,
      socketId: this.socket.id,
      connected: this.socket.connected,
      transport: this.socket.io.engine?.transport?.name
    }
  }
}

// 导出类和获取实例的方法
export { SocketManager }
export default SocketManager.getInstance()
