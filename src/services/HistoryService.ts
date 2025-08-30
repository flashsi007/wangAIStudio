import { get, set } from 'idb-keyval';
import { EditorState, Branch } from "@/types/history"

// 历史版本服务类
export class HistoryService {
    private static readonly DB_KEY = 'tiptap-history';
    private static readonly BRANCHES_KEY = 'tiptap-branches';

    // 保存当前状态
    static async saveState(state: Omit<EditorState, 'timestamp' | 'branch'>, branch: string): Promise<EditorState> {
        const history = await this.getBranchHistory(branch);
        const newState: EditorState = {
            ...state,
            timestamp: Date.now(),
            branch
        };

        // 添加新版本
        history.unshift(newState);
        await this.saveBranchHistory(branch, history);

        return newState;
    }

    // 获取分支历史
    static async getBranchHistory(branch: string): Promise<EditorState[]> {
        const allHistory = await this.getAllHistory();
        return allHistory.filter(item => item.branch === branch).sort((a, b) => b.timestamp - a.timestamp);
    }

    // 获取所有历史记录
    static async getAllHistory(): Promise<EditorState[]> {
        return (await get<EditorState[]>(this.DB_KEY)) || [];
    }

    // 保存分支历史
    private static async saveBranchHistory(branch: string, history: EditorState[]) {
        const allHistory = await this.getAllHistory();

        
        // 移除该分支旧记录
        const filteredHistory = allHistory.filter(item => item.branch !== branch);

        // 添加新记录
        const newHistory = [...filteredHistory, ...history];
        await set(this.DB_KEY, newHistory);
    }

    // 恢复特定版本
    static async restoreVersion(timestamp: number): Promise<EditorState | null> {
        const allHistory = await this.getAllHistory();
        return allHistory.find(item => item.timestamp === timestamp) || null;
    }

    // 创建新分支
    static async createBranch(sourceTimestamp: number, branchName: string): Promise<void> {
        const sourceState = await this.restoreVersion(sourceTimestamp);
        if (!sourceState) throw new Error('源版本不存在');

        // 检查分支是否已存在
        const branches = await this.getAllBranches();
        if (branches.some(b => b.name === branchName)) {
            throw new Error('分支名称已存在');
        }

        // 创建新分支
        const newState: EditorState = {
            ...sourceState,
            timestamp: Date.now(),
            branch: branchName
        };

        // 保存分支历史
        await this.saveBranchHistory(branchName, [newState]);

        // 更新分支列表
        const newBranch: Branch = {
            name: branchName,
            createdAt: Date.now()
        };

        await set(this.BRANCHES_KEY, [...branches, newBranch]);
    }

    // 获取所有分支
    static async getAllBranches(): Promise<Branch[]> {
        return (await get<Branch[]>(this.BRANCHES_KEY)) || [{ name: 'master', createdAt: Date.now() }];
    }

    // 删除分支
    static async deleteBranch(branchName: string): Promise<void> {
        if (branchName === 'master') throw new Error('不能删除主分支');

        // 从历史记录中删除分支
        const allHistory = await this.getAllHistory();
        const filteredHistory = allHistory.filter(item => item.branch !== branchName);
        await set(this.DB_KEY, filteredHistory);

        // 从分支列表中删除
        const branches = await this.getAllBranches();
        const filteredBranches = branches.filter(b => b.name !== branchName);
        await set(this.BRANCHES_KEY, filteredBranches);
    }

    // 清除所有历史记录
    static async clearHistory(): Promise<void> {
        await set(this.DB_KEY, []);
        await set(this.BRANCHES_KEY, [{ name: 'master', createdAt: Date.now() }]);
    }
}