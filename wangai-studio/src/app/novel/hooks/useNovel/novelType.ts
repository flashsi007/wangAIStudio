/* ========================= 通用节点 ========================= */
export interface NodeStats {
  wordCount: number;
  paragraphs: number;
}

/** 任意节点的最小结构 */
export interface BaseNode {
  _id: string;
  novelId: string;
  userId: string;
  parentId: string;   // 根节点把 parentId 设成 novelId
  type: 'outline' | 'chapter' | 'mindmap'; // 可按实际继续追加
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  description?: string;
}

/** 大纲 / 思维导图节点（允许 children 嵌套） */
export interface TreeNode extends BaseNode {
  content?: Record<string, any> | null;
  stats?: NodeStats;
  children?: TreeNode[];
}

/* ========================= 根对象 ========================= */
export interface NovelInfo {
  _id: string;
  novel: {
    title: string;
  };
  nodes: string[]; // 这里是顶层 node 的 id 列表，与 TreeNode[] 区分开
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/* ========================= 顶层响应 ========================= */
export interface NovelResponse {
  novel: NovelInfo;
  nodes: TreeNode[]; // 真正的节点树
}

/* ========================= 思维导图 ========================= */
export interface IData {
    uid: string;
    text: string
}

export interface IMinMapContent {
    data: IData;
    children: IMinMapContent[]
}

export interface IMinMap {
    _id: string;
    userId: string;
    type: string;
    title: string;
    parentId: string;
    novelId: string;
    content: IMinMapContent;
}