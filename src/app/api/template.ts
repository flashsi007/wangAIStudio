// /api/template
import { http } from '@/app/utils/http';

/**
 * @description 获取模板列表
 * @returns 
 */
export const getTemplates = () => {
    // @ts-ignore
    return http.get('/api/template');
}