import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,          // 允许 html 标签
    linkify: true,       // 自动识别链接
    typographer: true    // 智能引号、省略号
});

/**
 * @description 转换 markdown 到 html
 * @param markdown 
 * @returns 
 */
export function md2html(markdown: string) {
    return md.render(markdown || '');
}