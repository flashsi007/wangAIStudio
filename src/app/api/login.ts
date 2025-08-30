import { http } from '@/app/utils/http';

/**
 * @description 获取验证码 SVG
 * @returns 
 */
export function captcha() {
    // @ts-ignore
    return http.get('/api/auth/captcha');
}

/**
 * @description 忘记密码
 * @param data 
 * @returns 
 */
export function forgotPassword(data: any) {
    // @ts-ignore
    return http.post('/api/auth/forgot-password', data);
}

/**
 * @description 发送邮箱验证码
 * @param data [type:"register", email: string] reset忘记密码  register 注册
 * @returns 
 */
export function sendCode(data: any) {
    // @ts-ignore
    return http.post('/api/auth/send-register-code', data);
}

/**
 * @description 登录
 * @param data 
 * @returns 
 */
export function login(data: any) {
    // @ts-ignore
    return http.post('/api/auth/login', data);
}

/**
 * @description 注册
 * @param data 
 * @returns 
 */
export function register(data: any) {
    // @ts-ignore
    return http.post('/api/auth/register', data);
}