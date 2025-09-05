import { http } from '@/app/utils';


/**
 * @description 创建文档
 * @param params
 * @returns
 */
export const createDocuments = (params: any) => {
    // @ts-ignore
    return http.post('/api/documents', params);
}


/**
 * @description 更新文档
 * @param params
 * @returns
 */
export const updateDocuments = (params: any) => {
    // @ts-ignore
    return http.put('/api/documents', params);
}

export const updateChildren = (params: any, childId: string) => {
    // @ts-ignore
    return http.put(`/api/children/${childId}`, params);
}

/**
 * @description 创建子文档
 * @param params
 * @returns
 */
export const createChildDocuments = (params: any) => {
    // @ts-ignore
    return http.post('/api/documents/children', params);
}

/**
 * @default 获取最近创建的文档
 * @param userId
 * @returns
 */
export const getRecentlyDocuments = (userId: string) => {
    // @ts-ignore
    return http.get(`/api/documents/recently/${userId}`);
}


/**
 * @description 获取文档列表
 * @param userId
 * @param page
 * @param limit
 * @returns
 */
export const getDocuments = (userId: string, page: number, limit: number) => {
    // @ts-ignore
    return http.get(`/api/documents?userId=${userId}&page=${page}&limit=${limit}`);
}

/**
 * @description 获取子文档列表
 * @param userId
 * @param documentId
 * @param childId
 * @returns
 */
export const getChildNodeById = (userId: string, childId: string) => {
    // @ts-ignore
    return http.get(`/api/children/${childId}?userId=${userId}`);
}

/**
 * @description 删除文档
 * @param userId
 * @param documentId
 * @returns
 */
export const deleteDocuments = (userId: string, documentId: string) => {
    // @ts-ignore
    return http.delete(`/api/documents?userId=${userId}&documentId=${documentId}`);
}

/**
 * @description 删除子文档列表
 * @param childId
 * @returns
 */
export const deleteChildDocuments = (childId: string) => {
    // @ts-ignore
    return http.delete(`/api/children/${childId}`);
}

export const createBatchDoc = (params: any) => {
    // @ts-ignore
    return http.post('/api/documents/batch', params);
}

/**
  * @description 父节点批量排序
  */
export const parentSort = (params: any) => {
    // @ts-ignore
    return http.put('/api/documents/parent-sort', params);
}


/**
 * @description 子节点批量排序
 * @param params
 * @returns
 */
export const childSort = (params: any) => {
    // @ts-ignore
    return http.post('/api/children/child-sort', params);
}
