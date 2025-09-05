import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryService } from '@/services/HistoryService';
import type { EditorState, Branch } from '@/types/history';

interface HistoryState {
    // 状态
    currentBranch: string;
    branches: Branch[];
    versions: EditorState[];
    isLoading: boolean;
    error: string | null;
    autoSaveInterval: number;
    isAutoSaveEnabled: boolean;

    // 操作
    initStore: () => Promise<void>;
    saveVersion: (state: EditorState) => Promise<void>;
    restoreVersion: (timestamp: number) => Promise<EditorState | null>;
    createBranch: (name: string, sourceTimestamp?: number) => Promise<void>;
    switchBranch: (branch: string) => Promise<void>;
    deleteBranch: (branch: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    setAutoSaveInterval: (interval: number) => void;
    toggleAutoSave: (enabled: boolean) => void;

    manualSave: (state: Omit<EditorState, 'timestamp' | 'branch'>) => Promise<void>;
    getVersionsByBranch: (branch: string) => Promise<EditorState[]>;
    getAllHistory: () => Promise<EditorState[]>;

}

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set, get) => ({
            currentBranch: 'master',
            branches: [{ name: 'master', createdAt: Date.now() }],
            versions: [],
            isLoading: false,
            error: null,
            autoSaveInterval: 30000,
            isAutoSaveEnabled: true,

            // 初始化存储
            initStore: async () => {
                set({ isLoading: true });
                try {
                    const branches = await HistoryService.getAllBranches();


                    const currentBranch = get().currentBranch;
                    const versions = await HistoryService.getBranchHistory(currentBranch);

                    set({
                        branches,
                        versions,
                        isLoading: false
                    });
                } catch (error) {
                    set({
                        error: '初始化历史存储失败',
                        isLoading: false
                    });
                }
            },

            // 保存版本（自动保存使用）
            saveVersion: async (state: EditorState) => {
                if (!get().isAutoSaveEnabled) return;

                try {

                    const newVersion = await HistoryService.saveState(state, state.branch);

                    set((prev) => ({
                        versions: [newVersion, ...prev.versions]
                    }));
                } catch (error) {
                    set({ error: '自动保存失败' });
                }
            },

            // 手动保存
            // @ts-ignore
            manualSave: async (state) => {
                try {
                    const newVersion = await HistoryService.saveState(
                        state,
                        get().currentBranch
                    );

                    set((prev) => ({
                        versions: [newVersion, ...prev.versions]
                    }));

                    return newVersion;
                } catch (error) {
                    set({ error: '手动保存失败' });
                    throw error;
                }
            },

            // 恢复特定版本
            restoreVersion: async (timestamp) => {
                try {
                    const state = await HistoryService.restoreVersion(timestamp);
                    if (!state) return null;

                    // 保存为当前分支的新版本
                    const newVersion = await HistoryService.saveState(
                        { doc: state.doc, history: state.history },
                        get().currentBranch
                    );

                    set((prev) => ({
                        versions: [newVersion, ...prev.versions]
                    }));

                    return newVersion;
                } catch (error) {
                    set({ error: '恢复版本失败' });
                    return null;
                }
            },

            // 创建新分支
            createBranch: async (name, sourceTimestamp) => {
                try {
                    const source = sourceTimestamp || get().versions[0]?.timestamp;
                    if (!source) throw new Error('没有可用的源版本');

                    await HistoryService.createBranch(source, name);

                    const newBranch: Branch = {
                        name,
                        createdAt: Date.now()
                    };

                    set((prev) => ({
                        branches: [...prev.branches, newBranch]
                    }));

                    // 切换到新分支
                    get().switchBranch(name);
                } catch (error) {
                    // @ts-ignore
                    set({ error: `创建分支失败: ${error.message}` });
                }
            },

            // 切换分支
            switchBranch: async (branch) => {
                set({ isLoading: true, currentBranch: branch });

                try {
                    const versions = await HistoryService.getBranchHistory(branch);
                    set({
                        versions,
                        isLoading: false
                    });
                } catch (error) {
                    set({
                        error: '切换分支失败',
                        isLoading: false
                    });
                }
            },

            // 删除分支
            deleteBranch: async (branch) => {
                if (branch === 'master') {
                    set({ error: '不能删除主分支' });
                    return;
                }

                try {
                    await HistoryService.deleteBranch(branch);

                    set((prev) => ({
                        branches: prev.branches.filter(b => b.name !== branch),
                        currentBranch: prev.currentBranch === branch ? 'master' : prev.currentBranch
                    }));

                    // 如果删除的是当前分支，切换到 master
                    if (get().currentBranch === branch) {
                        get().switchBranch('master');
                    }
                } catch (error) {
                    set({ error: '删除分支失败' });
                }
            },

            // 清除历史
            clearHistory: async () => {
                await HistoryService.clearHistory();
                set({
                    versions: [],
                    branches: [{ name: 'master', createdAt: Date.now() }],
                    currentBranch: 'master'
                });
            },

            // 设置自动保存间隔
            setAutoSaveInterval: (interval) => {
                set({ autoSaveInterval: interval });
            },

            // 切换自动保存
            toggleAutoSave: (enabled) => {
                set({ isAutoSaveEnabled: enabled });
            },

            // 根据分支获取版本列表
            getVersionsByBranch: async (branch) => {
                const versions = await HistoryService.getBranchHistory(branch)
                return versions;
            },

            getAllHistory: async () => {
                const allHistory = await HistoryService.getAllHistory();
                return allHistory;
            }

        }),
        {
            name: 'history-settings',
            partialize: (state) => ({
                currentBranch: state.currentBranch,
                branches: state.branches,
                autoSaveInterval: state.autoSaveInterval,
                isAutoSaveEnabled: state.isAutoSaveEnabled
            }),
        }
    )
);


interface CharacterHistory {
   versions: EditorState[] ;
   version: EditorState | null; 
   setVersion: (version: EditorState) => void;
   setVersions: (versions: EditorState[]) => void;
}

  export const useHistoryCharacter = create<CharacterHistory>( (set, get) => ({
        versions: [],
        version: null,
        setVersion: (version) => {
          set({ version });
        },
        setVersions: (versions) => {
          set({ versions });
        },
      })) 


 interface Option{
    title: string;
    label: string;
 }
 interface  HistoryOptions{
    options: Option[];
    setOptions: (options: Option[]) => void;
 }
export const useHistoryOptions = create<HistoryOptions>( (set, get) => ({
    options: [],
    setOptions: (options) => {
      set({ options });
    },
  })) 