
// 编辑器状态类型
export interface EditorState {
    doc: any; // 文档内容 (Tiptap JSON 格式)
    history: any; // Tiptap 历史状态
    timestamp: number; // 时间戳
    branch: string; // 所属分支
}

// 分支类型
export interface Branch {
    name: string; // 分支名称
    createdAt: number; // 创建时间戳
}

// 版本列表项
export interface VersionListItem {
    timestamp: number;
    preview: string;
    branch: string;
}

// 历史服务接口
export interface HistoryService {
    
    saveState(state: Omit<EditorState, 'timestamp' | 'branch'>, branch?: string): Promise<EditorState>;
    getBranchHistory(branch?: string): Promise<EditorState[]>;
    getAllHistory(): Promise<EditorState[]>;
    restoreVersion(timestamp: number): Promise<EditorState | null>;
    createBranch(sourceTimestamp: number, branchName: string): Promise<void>;
    getAllBranches(): Promise<Branch[]>;
    deleteBranch(branchName: string): Promise<void>;
    clearHistory(): Promise<void>;
}