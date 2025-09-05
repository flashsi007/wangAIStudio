import { create } from 'zustand';
import { persist } from 'zustand/middleware';
 


import {NovelResponse} from "./novelType"

interface NovelState {
  novelInfo: NovelResponse | null;                    // 整包 JSON
  setNovelInfo: (payload: NovelResponse) => void;
}

export const useNovelStore  = create<NovelState>((set) => ({
  novelInfo: null,
  setNovelInfo: (payload) => set({ novelInfo: payload }),
}));


import type {IMinMap, TreeNode as NodeType,IMinMapContent } from "./novelType"

export interface MindmapChaptersState {
 mindmapChapters: NodeType[];
    setmindmapChapters: (mindmapChapters: NodeType[]) => void;
}

export const useMindmapmindmapChaptersStore = create<MindmapChaptersState> ((set) => ({
    mindmapChapters: [],
    setmindmapChapters: (mindmapChapters) => set({ mindmapChapters }),
}))


export interface mindmapStore {
    mindmapList: IMinMap[];
    setmindmapList: (mindmapList: IMinMap[]) => void;
}

export const useMindmapStore = create<mindmapStore> ((set) => ({
    mindmapList: [],
    setmindmapList: (mindmapList) => set({ mindmapList }),
}))



interface IMindMapInfo {
  _id: string;
  userId: string;
  type: string;
  title: string;
  parentId: string;
  novelId: string;
  content: IMinMapContent | null;
}

interface MindMapState {
  mindmap: IMindMapInfo | null;                    // 实时快照
  getMindmap: () => IMindMapInfo  | null;           // 取快照（React 外）
  setMindmap: (payload: IMindMapInfo) => void; // 整颗替换
  clearMindmap: () => void;                 // 清空
}

export const useMindMapState = create<MindMapState>()((set, get) => ({
  /* 初始值 */
  mindmap:  null, 
  /* actions */
  getMindmap: () => get().mindmap ||null,
  setMindmap: (payload) => set({ mindmap: payload }),
  clearMindmap: () =>set({  mindmap: null }),

}));


interface MindmaplStore {
  mindmap: IMinMap | null;
  setMindmap: (payload: IMinMap) => void;
}
 
/**
 * 思维导图状态管理
 */
export const useMindmapState = create<MindmaplStore>()((set, get) => ({
  /* 初始值 */
  mindmap:  null, 
  /* actions */
  getMindmap: () => get().mindmap ||null,
  setMindmap: (payload) => set({ mindmap: payload }),
  clearMindmap: () =>set({  mindmap: null }),

}));


interface IsShowMindmapStore {
  isShowMindmap : boolean;
  setMindmap: (payload: boolean) => void;
}
 
export const useIsShowMindmap = create<IsShowMindmapStore>((set) => ({
  isShowMindmap: false,
  setMindmap: (payload) => set({ isShowMindmap: payload }),
}))
