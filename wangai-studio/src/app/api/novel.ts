import { http } from '@/app/utils';
import { FUNCTIONS_CONFIG_MANIFEST } from 'next/dist/shared/lib/constants';
/* 思维导图节点 */
interface MindMapNode {
    data: { text: string };
    children?: MindMapNode[];
}

/* 思维导图顶层对象 */
interface MindMap {
    title: string;
    type: 'mindmap';
    content: {
        data: { text: string };
        children?: MindMapNode[];
    };
}

/* 章节（outline 子项） */
interface Chapter {
    title: string;
    type: 'chapter';
    content: {
        html: string;
    };
}

/* 大纲（outline 顶层对象） */
interface Outline {
    title: string;
    type: 'outline';
    children: Chapter[];
}

/* 小说信息 */
interface Novel {
    title: string;
}

/* 根结构：前端提交数据类型 */
export interface CreateNovelProps {
    userId: string;
    novel: Novel;
    nodes: (MindMap | Outline)[];
}



export function createNovel(params: CreateNovelProps) {
    // @ts-ignore
    return http.post('/api/novel/createNovel', params);
}
export function getByIdNovelInfo(params: { userId: string, id: string }) {
    // @ts-ignore
    return http.post('/api/novel/info', params);
}

export function getChapterById(params: { userId: string, id: string }) {
    // @ts-ignore
    return http.post('/api/novel/chapter', params);
}




export interface createCharacterProps {
    userId: string; // 用户id 

    title: string; // 章节标题 
    novelId: string; // 小说id 
    parentId: string; // 父章节id  
    type: string; // 类型  

    description?: string; // 剧情描述 可选 
    content?: any;// 内容 可选
}

export function createCharacter(params: createCharacterProps) {
    // @ts-ignore
    return http.post('/api/novel/createCharacter', params);
}

/**
 * 更新章节信息
 * @param params 
 * @returns 
 */
export function updateCharacter(params: any) {
    // @ts-ignore
    return http.post('/api/novel/updateCharacter', params);
}

export function deleteCharacterById(params: { userId: string, id: string, novelId: string }) {
    // @ts-ignore
    return http.post('/api/novel/deleteCharacterById', params);
}


/**
 * @description 根据关键字获取小说章节列表
 * @param params { userId: string, novelId: string,keywords: string }
 * @returns 
 */
export function getCharacterKeywords(params: { userId: string, novelId: string, keyword: string }) {
    // @ts-ignore
    return http.post('/api/novel/getCharacterKeyword', params);
}

export function getNovelList(userId: string) {
    // @ts-ignore
    return http.get(`/api/novel/getNovelList?userId=${userId}`);
}

// 删除小说
export function deleteNovelById(params: { userId: string, novelId: string }) {
    // @ts-ignore
    return http.post('/api/novel/deleteNovel', params);
}

// 重命名小说
export function novelRename(params: { userId: string, novelId: string, title: string }) {
    // @ts-ignore
    return http.post('/api/novel/novelRename', params);
}

// 获取小说章节列表
export function getAllCharacter(userId: string, novelId: string, type: string) {
    // @ts-ignore
    return http.get(`/api/novel/getAllCharacter/${userId}/${novelId}/${type}`);

}