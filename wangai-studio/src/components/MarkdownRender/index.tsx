
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import style from './index.module.css';

/**
 * Markdown 渲染组件
 * @param {string} content  Markdown 原文本
 * @param {object} [sx]     最外层容器 style 对象
 * @param {object} [theme]  react-syntax-highlighter 主题对象
 */
export default function MarkdownRender({ content = '', sx = {}, theme = atomDark, }) {
    return (
        <div style={{ ...styles.wrapper, ...sx }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 代码块高亮
                    // @ts-ignore
                    code({ node, inline, className, children, ...rest }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            //  @ts-ignore
                            <SyntaxHighlighter style={{ Color: 'var(--color-text-1)' }} language={match[1]} PreTag="div"  {...rest}  >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...rest}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

/* 简单默认样式，可覆盖 */
const styles = {
    wrapper: {
        lineHeight: 1.65,
        fontSize: 15,
        color: 'var(--text-color)',
    },
};
