import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

/**
 * 用户认证DTO
 */
export class AuthDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

/**
 * 任务提交DTO
 */
export class TaskSubmitDto {
  @IsString()
  @IsNotEmpty()
  taskType: string;

  @IsOptional()
  @IsObject()
  taskData?: any;
}

/**
 * Socket响应基础DTO
 */
export class SocketResponseDto {
  @IsString()
  message: string;

  @IsString()
  timestamp: string;
}

/**
 * 认证成功响应DTO
 */
export class AuthSuccessDto extends SocketResponseDto {
  @IsString()
  userId: string;
}

/**
 * 任务状态响应DTO
 */
export class TaskStatusDto extends SocketResponseDto {
  @IsString()
  taskType: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  result?: any;

  @IsOptional()
  @IsString()
  error?: string;
}

/**
 * 在线统计响应DTO
 */
export class StatsResponseDto extends SocketResponseDto {
  @IsString()
  onlineUsers: number;

  @IsOptional()
  onlineUserIds?: string[];
}

/**
 * 连接响应DTO
 */
export class ConnectedDto extends SocketResponseDto {
  @IsString()
  socketId: string;
}

/**
 * Ping响应DTO
 */
export class PongDto {
  @IsString()
  timestamp: string;
}

/**
 * 房间操作DTO
 */
export class RoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

/**
 * 房间消息DTO
 */
export class RoomMessageDto extends RoomDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

/**
 * 房间响应DTO
 */
export class RoomResponseDto extends SocketResponseDto {
  @IsString()
  roomId: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * 房间信息响应DTO
 */
export class RoomInfoDto extends RoomResponseDto {
  @IsOptional()
  users?: string[];

  @IsOptional()
  userCount?: number;
}