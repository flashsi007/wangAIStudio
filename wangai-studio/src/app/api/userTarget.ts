import { http } from '@/app/utils';


/**
 * @description: 获取今日码字字数
 * @param userId
 * @returns
 */
export async function getTodayWords(userId: string) {
    // @ts-ignore
    return await http.get(`/api/user-target/get-today-words/${userId}`);
}


/**
 * @description: 获取一周码字字数
 * @param userId 
 * @returns 
 */
export async function getOneWeekWords(userId: string) {
    // @ts-ignore
    return await http.get(`/api/user-target/get-one-week-words/${userId}`);
}