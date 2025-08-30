
import '@ant-design/v5-patch-for-react-19';
import { message as antdMessage } from 'antd';

// AI模型配置接口
// export interface ModelConfig {
//     message?: string; // 提示词
//     userId: string; // 用户ID
//     model: string;    // 模型名称
//     key?: string;    // API令牌
//     apiUrl: string;   // API地址
//     onData?: Function; // 数据回调函数
//     onError?: Function; // 错误回调函数
//     onComplete?: Function; // 完成回调函数
// }



// AI模型配置接口
export interface ModelConfig {
    message?: string; // 提示词 
    model: string;    // 模型ID
    key: string;    // API令牌
    api: string;   // API地址
    userId: string; // 用户ID
    onData?: Function; // 数据回调函数
    onError?: Function; // 错误回调函数
    onComplete?: Function; // 完成回调函数
}

/**
 * @description 流式请求函数，使用fetch API处理流式响应
 * @param message  请求消息
 * @param onData 数据回调函数
 * @param onError 错误回调函数
 * @param onComplete  完成回调函数
 * @returns
 */
export async function chatStream({
    message,
    userId,
    model,
    key,
    api,
    onData, onError, onComplete }: ModelConfig) {


    let reader = null;
    let baseURL = `${process.env.NEXT_PUBLIC_AXIOS_BASE_URL}/api/chat/userChatStream`;

    try {
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时 
       
        let token = ''
          const userStore = window.localStorage.getItem('user-storage');
           if (userStore) { 
              const storage = JSON.parse(userStore);
              token = storage.state?.userInfo?.token || '';
           }

        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                message, 
                userId, 
                model,
                key, 
                api,
             }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 详细的HTTP错误处理
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            console.log('errorMessage---------', response);

            let code = ""

            try {
                const errorBody = await response.text();
                if (errorBody) {
                    const errorData = JSON.parse(errorBody);
                    code = errorData.code
                    errorMessage = errorData.message || errorData.error || errorMessage;
                }

            } catch (parseError) {
                // 如果无法解析错误响应，使用默认错误信息
            }


            const error = new Error(errorMessage);


            error.name = 'HTTPError';
            // @ts-ignore
            error.status = response.status;
            // @ts-ignore
            error.statusText = response.statusText;
            // @ts-ignore
            error.code = code
            throw error;
        }

        if (!response.body) {
            const error = new Error('浏览器不支持流式响应');
            error.name = 'StreamNotSupportedError';
            throw error;
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            // 检查是否是服务器错误信息
                            if (line.startsWith('data: ')) {
                                const dataContent = line.slice(6); // 移除 'data: ' 前缀
                                if (dataContent === '[DONE]') {
                                    onComplete?.(); // 调用完成回调
                                    return; // 流结束
                                }
                                const data = JSON.parse(dataContent);




                                // 检查是否包含错误信息
                                if (data.error) {

                                    const error = new Error(data.error.message || '服务器返回错误');
                                    error.name = 'ServerError';
                                    // @ts-ignore
                                    error.code = data.error.code;
                                    throw error;
                                }

                                onData?.(data);
                            } else {
                                const data = JSON.parse(line);

                                // 检查是否包含错误信息
                                if (data.error) {
                                    const error = new Error(data.error.message || '服务器返回错误');
                                    error.name = 'ServerError';
                                    // @ts-ignore
                                    error.code = data.error.code;
                                    throw error;
                                }

                                onData?.(data);
                            }
                        } catch (parseError) {

                            // 如果不是JSON格式，检查是否是错误信息
                            if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')) {
                                const error = new Error(`服务器错误: ${line}`);
                                error.name = 'ServerError';
                                throw error;
                            }
                            onData?.(line);
                        }
                    }
                }
            }
        } finally {
            if (reader) {

                reader.releaseLock();
            }
        }

        // 处理剩余的buffer数据
        if (buffer.trim()) {
            try {

                const data = JSON.parse(buffer);


                if (data.error) {
                    const error = new Error(data.error.message || '服务器返回错误');
                    error.name = 'ServerError';
                    // @ts-ignore
                    error.code = data.error.code;
                    throw error;
                }
                onData?.(data);
            } catch (parseError) {
                if (buffer.toLowerCase().includes('error') || buffer.toLowerCase().includes('exception')) {
                    const error = new Error(`服务器错误: ${buffer}`);
                    error.name = 'ServerError';
                    throw error;
                }
                onData?.(buffer);
            }
        }

        // 流正常结束，调用完成回调
        onComplete?.();

    } catch (error) {

        // @ts-ignore
        if (error.code == 'VALIDATION_ERROR') {
            console.log(error);

            antdMessage.error("请选择正确的模型")
        }

        // 统一错误处理
        let processedError = null;

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                processedError = new Error('请求超时，请稍后重试');
                processedError.name = 'TimeoutError';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                processedError = new Error('网络连接失败，请检查网络连接');
                processedError.name = 'NetworkError';
            } else {
                processedError = error;
            }
        } else {
            processedError = new Error('未知错误');
            processedError.name = 'UnknownError';
        }

        onError?.(processedError);
        throw processedError;
    }
}





// /**
//  * @description 使用用户自有AI模型
//  * @param message 
//  * @param onData 
//  * @param onError 
//  * @param onComplete 
//  */
// export async function  chatStream({message,model,key,api,onData, onError, onComplete }: ModelConfig) { 
    
//     let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    
//     try {
//         // 添加超时控制
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
//         // 构建OpenAI兼容的请求体
//         const requestBody = {
//             model:model,
//             messages: [
//                 {
//                     role: 'user',
//                     content: message
//                 }
//             ],
//             stream: true,
//             temperature: 0.7,
//             max_tokens: 2000
//         };
        
//         // 使用代理路径进行请求  
//         const response = await fetch('/api/user-ai', {
//             method: 'POST',
//             // @ts-ignore
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${key}`,
//                 'X-Custom-Api-Url': api, // 直接使用用户提供的完整API地址
//                 'X-Custom-Model-key': key
//             },
//             body: JSON.stringify(requestBody),
//             signal: controller.signal
//         });
        
//         clearTimeout(timeoutId);
        
//         if (!response.ok) {
//             let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
//             try {
//                 const errorBody = await response.text();
//                 if (errorBody) {
//                     const errorData = JSON.parse(errorBody);
//                     errorMessage = errorData.error?.message || errorData.message || errorMessage;
//                 }
//             } catch (parseError) {
//                 // 如果无法解析错误响应，使用默认错误信息
//             }
//             throw new Error(errorMessage);
//         }
        
//         if (!response.body) {
//             throw new Error('响应体为空');
//         }
        
//         reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';
        
//         while (true) {
//             const { done, value } = await reader.read();
            
//             if (done) {
//                 onComplete?.();
//                 break;
//             }
            
//             buffer += decoder.decode(value, { stream: true });
//             const lines = buffer.split('\n');
//             buffer = lines.pop() || ''; // 保留最后一个不完整的行
            
//             for (const line of lines) {
//                 const trimmedLine = line.trim();
//                 if (trimmedLine === '' || trimmedLine === 'data: [DONE]') {
//                     continue;
//                 }
                
//                 if (trimmedLine.startsWith('data: ')) {
//                     try {
//                         const jsonStr = trimmedLine.slice(6); // 移除 'data: ' 前缀
//                         const data = JSON.parse(jsonStr);
                        
//                         // 处理OpenAI格式的流式响应
//                         if (data.choices && data.choices[0] && data.choices[0].delta) {
//                             const content = data.choices[0].delta.content;

//                             console.log('处理OpenAI格式的流式响应:',content);
                            
//                             if (content) {
//                                 onData?.({
//                                     content: content,
//                                     type: 'content'
//                                 });
//                             }
//                         }
//                     } catch (parseError) {
//                         console.warn('解析流式数据失败:', parseError, '原始数据:', trimmedLine);
//                     }
//                 }
//             }
//         }
        
//     } catch (error: any) {
//         console.error('用户AI模型请求失败:', error);
        
//         if (error.name === 'AbortError') {
//             onError?.(new Error('请求超时，请检查网络连接或API配置'));
//         } else if (error.message.includes('Failed to fetch')) {
//             onError?.(new Error('网络连接失败，请检查API地址配置'));
//         } else {
//             onError?.(error);
//         }
//     } finally {
//         if (reader) {
//             try {
//                 reader.releaseLock();
//             } catch (e) {
//                 console.warn('释放reader锁失败:', e);
//             }
//         }
//     }
// }

 


