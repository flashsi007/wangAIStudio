import { htmlToText } from 'html-to-text'
// 提取纯文本内容的辅助函数
export const extractText = (html: string) => {
    const plainText = htmlToText(html, {
        wordwrap: false, // 禁用自动换行
        preserveNewlines: false // 不保留换行符
    })


    return plainText
};

/**
 * 将树形结构转为 Markdown
 * @param node  根节点
 * @param depth 当前深度（根节点为 1）
 * @param indent 当前缩进字符串
 */
export function nodeToMarkdown(
    node: { data: { text: string }; children?: any[] },
    depth = 1,
    indent = ''
): string {
    const { data, children = [] } = node;

    // 1. 处理当前节点的标题 / 列表前缀
    let prefix: string;
    if (depth <= 6) {
        prefix = '#'.repeat(depth) + ' ';
    } else {
        // 计算有序列表序号：同层第几个节点
        // 由于函数是递归调用，这里简单用 children 的下标即可
        const order = depth - 6; // 仅示意，真实序号需父节点计算
        prefix = `${order}. `;
    }

    // 2. 转义文本中的 Markdown 保留字符
    const escapedText = data.text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');

    // 3. 拼接当前行
    let md = indent + prefix + extractText(escapedText) + '\n';

    // 4. 递归处理子节点，增加缩进
    const childIndent = indent + '  ';
    children.forEach((child, idx) => {
        // 在深度 > 6 时，需要把当前层序号传给子节点
        const childDepth = depth + 1;
        md += nodeToMarkdown(child, childDepth, childIndent);
    });

    return md;
}

