


export const updateData = (payload: { uid: string; newData: any }, rootData: any) => {
    const { uid, newData } = payload;

    // 深拷贝原对象（避免副作用）
    const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

    // 递归替换匹配 uid 的节点 data
    const walk = (node: any): any => {
        if (node?.data?.uid === uid) {
            node.data = { ...node.data, ...newData };
            return node;
        }
        if (Array.isArray(node?.children)) {
            node.children = node.children.map(walk);
        }
        return node;
    };

    // 从根开始遍历
    const result = walk(clone(rootData));

    // 更新 updatedAt
    result.updatedAt = new Date().toISOString();
    if (result.children?.[0]?.updatedAt) {
        result.children[0].updatedAt = result.updatedAt;
    }

    return result;
};