import { http } from '@/app/utils';

/**
 * @description 获取模型列表
 * @returns 
 */
export function getModels() {
    // @ts-ignore
    return http.get('/api/chat/models');
}

/**
 * @description 清除 Chat上下文
 * @param userId 
 */
export function clearChatHistory(userId: string) {
    // @ts-ignore
    return http.get(`/api/chat/clear/${userId}`);
}