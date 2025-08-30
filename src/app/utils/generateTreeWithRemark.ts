import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { md2html } from './md2html';

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateUid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

}

/**
 * 根据节点类型和层级生成带样式的HTML文本
 * @param {string} text - 原始文本
 * @param {number} level - 层级
 * @param {string} type - 节点类型 (heading, listItem, paragraph)
 * @returns {string} 带样式的HTML文本
 */
function generateStyledText(text: string, level: number, type: string) {
    const baseStyle = 'font-family: "PingFang SC", "Microsoft YaHei", sans-serif;';

    switch (type) {
        case 'heading':
            const headingSize = Math.max(16 - level, 12); // 根据标题级别调整字体大小
            const headingColor = level === 1 ? '#1a1a1a' : level === 2 ? '#333333' : '#555555';

            return md2html(text)
        case 'listItem':
            return md2html(text)

        case 'paragraph':
        default:
            return md2html(text)
    }
}

/**
 * 从mdast节点中提取纯文本
 * @param {object} node - mdast节点
 * @returns {string} 纯文本
 */
function extractText(node: any) {
    if (node.type === 'text') {
        return node.value;
    }
    if (node.children) {
        return node.children.map(extractText).join('');
    }
    return '';
}

/**
 * 将mdast节点转换为扁平的节点数组
 * @param {object} mdastNode - mdast节点
 * @param {array} result - 结果数组
 * @returns {void}
 */
function flattenMdastNodes(mdastNode: any, result = []) {
    if (!mdastNode) return;

    const { type, children } = mdastNode;

    switch (type) {
        case 'heading':
            const headingText = extractText(mdastNode);
            if (headingText.trim()) {
                // @ts-ignore
                result.push({

                    type: 'heading',
                    text: headingText.trim(),
                    level: mdastNode.depth,
                    data: {
                        text: generateStyledText(headingText.trim(), mdastNode.depth, 'heading'),
                        uid: generateUid(),
                        expand: true,
                        richText: true,
                        isActive: false
                    },
                    children: []
                });
            }
            break;

        case 'listItem':
            const listText = extractText(mdastNode);
            if (listText.trim()) {
                // @ts-ignore
                result.push({
                    type: 'listItem',
                    text: listText.trim(),
                    level: 0, // 将在后续处理中确定
                    data: {
                        text: generateStyledText(listText.trim(), 0, 'listItem'),
                        uid: generateUid(),
                        expand: true,
                        richText: true,
                        isActive: false
                    },
                    children: []
                });
            }
            break;

        case 'paragraph':
            const paraText = extractText(mdastNode);
            if (paraText.trim()) {
                // @ts-ignore
                result.push({
                    type: 'paragraph',
                    text: paraText.trim(),
                    level: 0, // 将在后续处理中确定
                    data: {
                        text: generateStyledText(paraText.trim(), 0, 'paragraph'),
                        uid: generateUid(),
                        expand: true,
                        richText: true,
                        isActive: false
                    },
                    children: []
                });
            }
            break;

        case 'list':
        case 'root':
        default:
            // 递归处理子节点
            if (children && children.length > 0) {
                // @ts-ignore
                children.forEach(child => flattenMdastNodes(child, result));
            }
            break;
    }
}

/**
 * 构建层级树结构
 * @param {array} nodes - 扁平的节点数组
 * @returns {object} 根节点
 */
function buildHierarchy(nodes: Array<any>) {
    if (!nodes || nodes.length === 0) return null;

    // 找到第一个标题作为根节点
    let rootIndex = -1;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type === 'heading' && nodes[i].level === 1) {
            rootIndex = i;
            break;
        }
    }

    let root;
    let startIndex = 0;

    if (rootIndex >= 0) {
        root = {
            data: nodes[rootIndex].data,
            children: []
        };
        startIndex = rootIndex + 1;
    } else {
        // 如果没有一级标题，创建一个根节点
        root = {
            data: {
                text: generateStyledText('思维导图', 0, 'heading'),
                uid: generateUid(),
                expand: true,
                richText: true,
                isActive: false
            },
            children: []
        };
    }

    const stack = [{ level: 0, node: root }];
    let lastHeadingLevel = 0;

    for (let i = startIndex; i < nodes.length; i++) {
        const nodeData = nodes[i];
        if (!nodeData) continue;

        let level = 1;

        if (nodeData.type === 'heading') {
            level = nodeData.level;
            lastHeadingLevel = level;
        } else if (nodeData.type === 'listItem') {
            level = lastHeadingLevel + 1;
        } else {
            level = lastHeadingLevel + 1;
        }

        // 调整栈，找到正确的父节点
        while (stack.length > 1 && level <= stack[stack.length - 1].level) {
            stack.pop();
        }

        const treeNode = {
            data: nodeData.data,
            children: []
        };

        // 添加到父节点
        // @ts-ignore
        stack[stack.length - 1].node.children.push(treeNode);
        stack.push({ level, node: treeNode });
    }

    return root;
}

/**
 * 使用remark将 Markdown 文本转换为 treeData 结构
 * @param {string} AiAnswer - 包含Markdown格式内容的字符串
 * @returns {object} - 转换后的treeData结构
 */
export function generateTreeWithRemark(AiAnswer: string) {
    if (!AiAnswer || typeof AiAnswer !== 'string') {
        return null;
    }

    try {
        // 使用remark解析Markdown
        const processor = unified().use(remarkParse);
        const mdast = processor.parse(AiAnswer);

        // 将mdast转换为扁平的节点数组
        const nodes: any = [];
        flattenMdastNodes(mdast, nodes);

        // 构建层级结构
        return buildHierarchy(nodes);

    } catch (error) {
        console.error('Error parsing markdown with remark:', error);
        return null;
    }
}