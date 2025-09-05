import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import {
  AuthDto,
  TaskSubmitDto,
  AuthSuccessDto,
  TaskStatusDto,
  StatsResponseDto,
  ConnectedDto,
  PongDto,
  RoomDto,
  RoomMessageDto,
  RoomResponseDto,
  RoomInfoDto,
} from './dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(private readonly socketService: SocketService) {}

  /**
   * 客户端连接时触发
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    
    // 设置服务器实例到service中
    this.socketService.setServer(this.server);
    
    // 发送连接成功消息
    client.emit('connected', {
      message: 'Connected to server',
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 客户端断开连接时触发
   */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.socketService.removeUserConnection(client.id);
  }

  /**
   * 用户认证/注册
   */
  @SubscribeMessage('auth')
  @UsePipes(new ValidationPipe())
  handleAuth(
    @MessageBody() data: AuthDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { userId } = data;
    
    if (!userId) {
      client.emit('auth:error', {
        message: 'userId is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 添加用户连接
    this.socketService.addUserConnection(client, userId);
    
    // 发送认证成功消息
    client.emit('auth:success', {
      message: 'Authentication successful',
      userId,
      timestamp: new Date().toISOString(),
    });

    // 发送在线用户统计
    this.server.emit('stats:online', {
      onlineUsers: this.socketService.getOnlineUsersCount(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 处理用户任务请求
   */
  @SubscribeMessage('task:submit')
  @UsePipes(new ValidationPipe())
  async handleTaskSubmit(
    @MessageBody() data: TaskSubmitDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = this.socketService.getUserIdBySocketId(client.id);
    
    if (!userId) {
      client.emit('task:error', {
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { taskType, taskData } = data;
    
    if (!taskType) {
      client.emit('task:error', {
        message: 'taskType is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 处理用户任务
    await this.socketService.processUserTask(userId, taskType, taskData);
  }

  /**
   * 获取在线用户统计
   */
  @SubscribeMessage('stats:request')
  handleStatsRequest(@ConnectedSocket() client: Socket): void {
    client.emit('stats:response', {
      onlineUsers: this.socketService.getOnlineUsersCount(),
      onlineUserIds: this.socketService.getOnlineUserIds(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 心跳检测
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 加入房间
   */
  @SubscribeMessage('room:join')
  @UsePipes(new ValidationPipe())
  handleJoinRoom(
    @MessageBody() data: RoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const userId = this.socketService.getUserIdBySocketId(client.id);
    
    if (!userId) {
      client.emit('room:error', {
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { roomId } = data;
    
    if (!roomId) {
      client.emit('room:error', {
        message: 'roomId is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const success = this.socketService.joinRoom(userId, roomId);
    
    if (success) {
      client.emit('room:joined', {
        message: `Joined room ${roomId}`,
        roomId,
        timestamp: new Date().toISOString(),
      });
      
      // 通知房间内其他用户
      this.socketService.sendToRoom(roomId, 'room:user_joined', {
        userId,
        roomId,
        timestamp: new Date().toISOString(),
      });
    } else {
      client.emit('room:error', {
        message: 'Failed to join room',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 离开房间
   */
  @SubscribeMessage('room:leave')
  @UsePipes(new ValidationPipe())
  handleLeaveRoom(
    @MessageBody() data: RoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const userId = this.socketService.getUserIdBySocketId(client.id);
    
    if (!userId) {
      client.emit('room:error', {
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { roomId } = data;
    
    if (!roomId) {
      client.emit('room:error', {
        message: 'roomId is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const success = this.socketService.leaveRoom(userId, roomId);
    
    if (success) {
      client.emit('room:left', {
        message: `Left room ${roomId}`,
        roomId,
        timestamp: new Date().toISOString(),
      });
      
      // 通知房间内其他用户
      this.socketService.sendToRoom(roomId, 'room:user_left', {
        userId,
        roomId,
        timestamp: new Date().toISOString(),
      });
    } else {
      client.emit('room:error', {
        message: 'Failed to leave room',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 向房间发送消息
   */
  @SubscribeMessage('room:message')
  @UsePipes(new ValidationPipe())
  handleRoomMessage(
    @MessageBody() data: RoomMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const userId = this.socketService.getUserIdBySocketId(client.id);
    
    if (!userId) {
      client.emit('room:error', {
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { roomId, message } = data;
    
    if (!roomId || !message) {
      client.emit('room:error', {
        message: 'roomId and message are required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 向房间内所有用户发送消息
    this.socketService.sendToRoom(roomId, 'room:message', {
      userId,
      roomId,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 获取房间信息
   */
  @SubscribeMessage('room:info')
  @UsePipes(new ValidationPipe())
  handleRoomInfo(
    @MessageBody() data: RoomDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const userId = this.socketService.getUserIdBySocketId(client.id);
    
    if (!userId) {
      client.emit('room:error', {
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { roomId } = data;
    
    if (!roomId) {
      client.emit('room:error', {
        message: 'roomId is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const users = this.socketService.getRoomUsers(roomId);
    
    client.emit('room:info', {
      roomId,
      users,
      userCount: users.length,
      timestamp: new Date().toISOString(),
    });
  }
}