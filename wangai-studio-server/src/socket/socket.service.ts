import { Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { novelService } from '../novel/novel.service';
import { UserTargetService } from "../userTarget/userTarget.service"



interface UserConnection {
  socket: Socket;
  userId: string;
  connectedAt: Date;
}

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private userConnections = new Map<string, UserConnection>();
  private socketToUserId = new Map<string, string>();
  private server: Server;
  private rooms = new Map<string, Set<string>>(); // roomId -> Set of userIds

  constructor(
    private readonly novelService: novelService,
    private readonly userTargetService: UserTargetService
  ) { }

  /**
 * 处理用户任务
 */
  async processUserTask(userId: string, taskType: string, taskData: any): Promise<void> {

    /**
     * 更新文档
     */
    const updateDocument = async () => {
      let words = taskData.words
      let paragraphs = taskData.paragraphs
      delete taskData.words
      delete taskData.paragraphs
      // 更新文章 
      const childNode = await this.novelService.updateCharacter(taskData)


      await this.userTargetService.setWords(taskData.userId, words, taskData.id)

      // 更新文章字数
      await this.novelService.updateStats({
        id: taskData.id,
        userId: taskData.userId,
        novelId: taskData.novelId,
        wordCount: words,
        paragraphs: paragraphs
      })

      // 发送任务完成通知
      this.sendToUser(userId, 'task:completed', { taskType, result: childNode, timestamp: new Date().toISOString() });
    }


    const updataMinimap = async () => {// 更新思维导图

      console.log('------- updataMinimap ------');
      console.log(taskData);
      const childNode = await this.novelService.updateCharacter(taskData)


      this.sendToUser(userId, 'task:completed', { taskType, result: childNode, timestamp: new Date().toISOString() });

    }




    try {

      // 发送任务开始通知
      this.sendToUser(userId, 'task:started', { taskType, taskId: `task_${Date.now()}`, timestamp: new Date().toISOString(), });

      switch (taskType) {
        case 'updateDocument':
          updateDocument()
          break;

        case 'updataMinimap':
          updataMinimap()
          break;


      }


    } catch (error) {
      this.logger.error(`Task failed for user ${userId}:`, error);

      // 发送任务失败通知
      this.sendToUser(userId, 'task:failed', { taskType, error: error.message, timestamp: new Date().toISOString(), });
    }
  }

  /**
   * 添加用户连接
   */
  addUserConnection(socket: Socket, userId: string): void {
    // 如果用户已经有连接，先断开旧连接
    if (this.userConnections.has(userId)) {
      const oldConnection = this.userConnections.get(userId);
      if (oldConnection) {
        oldConnection.socket.disconnect();
        this.socketToUserId.delete(oldConnection.socket.id);
        this.logger.log(`Disconnected old connection for user: ${userId}`);
      }
    }

    // 添加新连接
    const connection: UserConnection = {
      socket,
      userId,
      connectedAt: new Date(),
    };

    this.userConnections.set(userId, connection);
    this.socketToUserId.set(socket.id, userId);

    this.logger.log(`User connected: ${userId}, socket: ${socket.id}`);
  }

  /**
   * 移除用户连接
   */
  removeUserConnection(socketId: string): void {
    const userId = this.socketToUserId.get(socketId);
    if (userId) {
      this.userConnections.delete(userId);
      this.socketToUserId.delete(socketId);
      this.cleanupUserRooms(userId);
      this.logger.log(`User disconnected: ${userId}, socket: ${socketId}`);
    }
  }

  /**
   * 获取用户连接
   */
  getUserConnection(userId: string): UserConnection | undefined {
    return this.userConnections.get(userId);
  }

  /**
   * 根据 socket ID 获取用户 ID
   */
  getUserIdBySocketId(socketId: string): string | undefined {
    return this.socketToUserId.get(socketId);
  }

  /**
   * 向特定用户发送消息
   */
  sendToUser(userId: string, event: string, data: any): boolean {
    const connection = this.userConnections.get(userId);
    if (connection) {
      connection.socket.emit(event, data);
      this.logger.log(`Message sent to user ${userId}: ${event}`);
      return true;
    }
    this.logger.warn(`User ${userId} not connected`);
    return false;
  }



  /**
   * 模拟任务处理
   */
  private async simulateTaskProcessing(taskData: any): Promise<void> {
    // 模拟异步任务处理时间
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * 获取在线用户数量
   */
  getOnlineUsersCount(): number {
    return this.userConnections.size;
  }

  /**
   * 获取所有在线用户 ID
   */
  getOnlineUserIds(): string[] {
    return Array.from(this.userConnections.keys());
  }

  /**
   * 设置Socket.IO服务器实例
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * 向所有在线用户广播消息
   */
  broadcastToAll(event: string, data: any): void {
    if (this.server) {
      this.server.emit(event, data);
      this.logger.log(`Broadcast message sent: ${event}`);
    }
  }

  /**
   * 加入房间
   */
  joinRoom(userId: string, roomId: string): boolean {
    const connection = this.userConnections.get(userId);
    if (!connection) {
      this.logger.warn(`User ${userId} not connected, cannot join room ${roomId}`);
      return false;
    }

    // 将用户socket加入房间
    connection.socket.join(roomId);

    // 更新房间用户列表
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);

    this.logger.log(`User ${userId} joined room ${roomId}`);
    return true;
  }

  /**
   * 离开房间
   */
  leaveRoom(userId: string, roomId: string): boolean {
    const connection = this.userConnections.get(userId);
    if (!connection) {
      this.logger.warn(`User ${userId} not connected, cannot leave room ${roomId}`);
      return false;
    }

    // 将用户socket离开房间
    connection.socket.leave(roomId);

    // 更新房间用户列表
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    this.logger.log(`User ${userId} left room ${roomId}`);
    return true;
  }

  /**
   * 向房间内所有用户发送消息
   */
  sendToRoom(roomId: string, event: string, data: any): boolean {
    if (!this.server) {
      this.logger.warn('Server not initialized');
      return false;
    }

    this.server.to(roomId).emit(event, data);
    this.logger.log(`Message sent to room ${roomId}: ${event}`);
    return true;
  }

  /**
   * 获取房间内的用户列表
   */
  getRoomUsers(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }

  /**
   * 获取所有房间信息
   */
  getAllRooms(): { [roomId: string]: string[] } {
    const result: { [roomId: string]: string[] } = {};
    this.rooms.forEach((users, roomId) => {
      result[roomId] = Array.from(users);
    });
    return result;
  }

  /**
   * 清理用户的所有房间关联
   */
  private cleanupUserRooms(userId: string): void {
    this.rooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        if (users.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    });
  }
}