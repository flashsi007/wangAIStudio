import axios from "axios"
import '@ant-design/v5-patch-for-react-19';
import { message } from "antd";

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_AXIOS_BASE_URL,
    withCredentials: false,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },

})


// 
/**
 * @description 请求拦截器
 */
request.interceptors.request.use(
    (config) => {
        let token = "";
        // @ts-ignore
        const storage = window.localStorage.getItem('user-storage')
        if (storage) {
            const user = JSON.parse(storage)
            token = user.state.userInfo.token
        }

        config.headers['Authorization'] = 'Bearer ' + token
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)



/**
 * @description 响应拦截器
 */
request.interceptors.response.use(
    (response) => {

        // @ts-ignore 
        return response.data
    },
    (error) => {
        if (error.response.data.code == "VALIDATION_ERROR") {

            message.error(`参数错误 ${error.response.data.message}`)
            return
        }


        if (error.response.data.code == "AUTH_REQUIRED") {

            // 跳转到登录页
            window.location.href = '/login'
            window.localStorage.clear()
            window.sessionStorage.clear()
            // message.error(`参数错误 ${error.response.data.message}`)
            return
        }

        
         message.error(`网络错误 ${error.response.data.message}`)

        return Promise.reject(error)
    }
)
type NonEmptyString<T> = T extends string ? (T extends '' ? never : T) : T;
export const http = {

    get(url: string, config: any) {
        return request.get(url, config)
    },
    post(url: string, data: any, config: any) {
        return request.post(url, data, config)
    },
    delete(url: string, config: any) {
        return request.delete(url, config)
    },
    put(url: string, data: any, config: any) {
        return request.put(url, data, config)
    },

    toParams<T extends Record<string, any>>(obj: T): string {
        return Object.entries(obj)
            .filter(([, v]) => v != null && !(typeof v === 'string' && v === ''))
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join('&');
    }
}
