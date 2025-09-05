// components/Markdown.tsx
import { useEffect, useState, FC } from 'react';

interface Props { text: string, style?: any }
import 'github-markdown-css/github-markdown-light.css';

export const Markdown: FC<Props> = ({ text, style }) => {
    const [html, setHtml] = useState('');

    useEffect(() => {
        // 浏览器端才加载
        import('markdown-it').then(MarkdownIt => {
            const md = new MarkdownIt.default({ html: true, breaks: true });
            setHtml(md.render(text));
        });
    }, [text]);

    return <div style={style} className="markdown-body " dangerouslySetInnerHTML={{ __html: html }} />;
};