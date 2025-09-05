import { http } from '@/app/utils';

/**
 * @description 创建 prompter
 * @param params 
 * @returns 
 */
export function createPrompter(params: any) {
    // @ts-ignore
    return http.post('/api/prompter/createPrompter', params);
}

/**
 * @description 更新 prompter
 * @param params 
 * @returns 
 */
export function updatePrompter(params: any) {
    // @ts-ignore
    return http.post('/api/prompter/updatePrompter', params);
}

export function deletePrompter(params: any) {
    // @ts-ignore
    return http.post('/api/prompter/deletePrompter', params);
}

export function getPrompterList(params: any) {
    // @ts-ignore
    return http.get(`/api/prompter/getPrompterList?${http.toParams(params)}`);
}