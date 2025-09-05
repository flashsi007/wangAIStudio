import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './mention.css'
import tippy from 'tippy.js';
import { removeExternalHash, nodeToMarkdown } from './function';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IMinMap } from "./function/types"
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { X, Network, ChevronRight, Send, SquareM } from 'lucide-react';

import useTheme from "@/hooks/useTheme"
import { ThemeTokens } from '@/app/config';

import { htmlToText } from 'html-to-text'
// 提取纯文本内容的辅助函数
const extractText = (html: string) => {
    const plainText = htmlToText(html, {
        wordwrap: false, // 禁用自动换行
        preserveNewlines: false // 不保留换行符
    })
    return plainText
};

/**
* 把类似
*   《我在养老院学折神》/《养老院学折神》/世界观概述
* 的 path 规整为
*   《养老院学折神》/世界观概述
*/
function normalizePath(path: string): string {
    if (!path) return '';

    // 1. 按 “/” 拆成章节数组
    const parts = path.split('/');

    // 2. 去掉每段首尾的书名号《》
    const clean = (s: string) => s.replace(/^《|》$/g, '');

    // 3. 去重：如果后面的段落文本和前面某一段文本相同，则丢弃
    const deduped: string[] = [];
    for (const p of parts) {
        const text = clean(p);
        if (!deduped.some(exist => clean(exist) === text)) {
            deduped.push(p);          // 保留原始段落（带书名号）
        }
    }

    // 4. 重新拼成路径
    return deduped.join('/');
}

function buildPath(targetText: string, root: any): string[] {
    if (root.type === 'document') return [root.title];

    if (root.type !== 'mindmap' || !root.content) return [];

    const res: string[] = [];

    /** 收集从 start 节点开始的所有后代路径 */
    function collectPaths(start: any, prefix: string[]) {
        if (!start?.data?.text) return;
        const curPath = [...prefix, start.data.text].join('/');
        res.push(curPath);
        start.children?.forEach((c: any) => collectPaths(c, [...prefix, start.data.text]));
    }

    /** 找到目标节点后，以它为根调用 collectPaths */
    function dfs(node: any, prefix: string[]): boolean {
        if (!node?.data?.text) return false;

        const nextPrefix = [...prefix, node.data.text];
        if (node.data.text === targetText) {
            // 找到了：把目标及其所有后代全部收集
            collectPaths(node, prefix);
            return true;
        }

        // 往下继续找
        return node.children?.some((c: any) => dfs(c, nextPrefix)) ?? false;
    }

    dfs(root.content, [root.title]);
    return res;
}

interface TippyProps {
    target: HTMLElement;
    selecteData?: Array<IMinMap>;
    onSelectedPath?: (path: string[]) => void;
}

let tip: any = null;
let tippyRoot: any = null;
const showTippy = ({ target, selecteData, onSelectedPath }: TippyProps) => {

    const handleSelect = (selectedItem: any, rootItem: any) => {

        const fullPath = buildPath(selectedItem.data.text, rootItem);
        onSelectedPath && onSelectedPath(fullPath);
        // 这里可以添加其他处理逻辑

        tip && tip.destroy();
        tippyRoot.unmount();
        tip = null;
        tippyRoot = null;
    }


    const container = document.createElement('div');

    // 清理之前的root
    if (tippyRoot) {
        tippyRoot.unmount();
    }

    // 创建新的root并渲染JSX
    tippyRoot = ReactDOM.createRoot(container);
    tippyRoot.render(
        <div className="w-96  overflow-y-auto p-2 bg-white rounded-lg flex items-center ">
            <ScrollArea className="h-80  space-y-4" >
                <ul className=''>
                    { // @ts-ignore
                        selecteData.map((item, index) => {

                            // 递归渲染菜单项
                            const renderMenuItems = (children: any[], rootItem: any): React.ReactNode => {
                                return children.map((child) => {
                                    if (child.children && child.children.length > 0) {
                                        return (
                                            <DropdownMenuSub key={child.data.uid}>
                                                <DropdownMenuSubTrigger onClick={() => handleSelect(child, rootItem)}>

                                                    <div
                                                        title={extractText(child.data.text)}
                                                        className='w-50 overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer'>
                                                        <span className='overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer'>
                                                            {extractText(child.data.text)}
                                                        </span>
                                                    </div>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent >
                                                        {renderMenuItems(child.children, rootItem)}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        );
                                    }
                                    return (
                                        <DropdownMenuItem key={child.data.uid} onClick={() => handleSelect(child, rootItem)}>
                                            <div
                                                title={extractText(child.data.text)}
                                                className='w-50 overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer'>
                                                <span className='overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer'>
                                                    {extractText(child.data.text)}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    );
                                });
                            };

                            // 思维导图类型
                            if (item.type === 'mindmap') return (
                                <li key={index}
                                    className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center"
                                    style={{ userSelect: 'none' }}>
                                    <Network className='w-4 h-4 mr-2' />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            {/* @ts-ignore */}
                                            <div title={extractText(item.content.data.text)}
                                                className='w-80 text-left overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer flex items-center'>
                                                {/* @ts-ignore */}
                                                <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                                                    {extractText(item.content.data.text)}
                                                </span>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="start">
                                            {/* @ts-ignore */}
                                            {item.content?.children && renderMenuItems(item.content.children, item)}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <ChevronRight className='w-4 h-4' />
                                </li>
                            )
                        })
                    }

                    { // @ts-ignore
                        selecteData.length === 0 && <li className='flex items-center justify-center py-2 '>暂无内容...</li>
                    }
                </ul>
            </ScrollArea>
        </div >
    );

    // 销毁之前的tippy实例
    if (tip) {
        tip.destroy();
    }

    tip = tippy(target, {
        content: container,
        trigger: 'manual',
        placement: 'top',
        hideOnClick: false,
        allowHTML: true,
        interactive: true, // 允许与tippy内容交互
        appendTo: () => document.body, // 确保tippy添加到body中
    });
    tip.show();
};

interface TippyProps2 {
    target: HTMLElement;
    list: Array<any>;
    selectChapter?: (item: any) => void;
    selectMindmap?: (item: any) => void;
}

let tip2: any = null;
let tippyRoot2: any = null;
const showTippy2 = ({ target, list, selectChapter, selectMindmap }: TippyProps2) => {

    const handleSelectChapter = (item: any) => {

        selectChapter && selectChapter(item);
        // 这里可以添加其他处理逻辑

        tip2 && tip2.destroy();
        tippyRoot2.unmount();
        tip2 = null;
        tippyRoot2 = null;
    }

    const handleselectMindmap = (item: any) => {
        selectMindmap && selectMindmap(item);
        tip2 && tip2.destroy();
        tippyRoot2.unmount();
        tip2 = null;
        tippyRoot2 = null;
    }


    const container = document.createElement('div');

    // 清理之前的root
    if (tippyRoot2) {
        tippyRoot2.unmount();
    }

    // 创建新的root并渲染JSX
    tippyRoot2 = ReactDOM.createRoot(container);
    tippyRoot2.render(
        <div className="w-96  overflow-y-auto p-2 bg-white rounded-lg flex items-center ">
            <ScrollArea className="h-80  space-y-4" >
                <ul >
                    { // @ts-ignore
                        list.map((item, index) => {

                            if (item.type === 'chapter') return (
                                <li key={index}
                                    onClick={() => handleSelectChapter(item)}
                                    className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center"
                                    style={{ userSelect: 'none' }}>
                                    <SquareM className='w-4 h-4 mr-2' />
                                    {/* @ts-ignore */}
                                    <div title={item.title}
                                        className='w-80 text-left overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer flex items-center'>
                                        {/* @ts-ignore */}
                                        <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {item.title}
                                        </span>
                                    </div>
                                </li>
                            )


                            if (item.type === 'mindmap') return (
                                <li key={index}
                                    onClick={() => handleselectMindmap(item)}
                                    className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center"
                                    style={{ userSelect: 'none' }}>
                                    <Network className='w-4 h-4 mr-2' />
                                    {/* @ts-ignore */}
                                    <div title={extractText(item.content.data.text)}
                                        className='w-80 text-left overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer flex items-center'>
                                        {/* @ts-ignore */}
                                        <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {extractText(item.content.data.text)}
                                        </span>
                                    </div>
                                </li>
                            )
                        })
                    }

                    { // @ts-ignore
                        list.length === 0 && <li className='flex items-center justify-center py-2 '>暂无内容...</li>
                    }
                </ul>
            </ScrollArea>
        </div >
    );

    // 销毁之前的tippy实例
    if (tip2) {
        tip2.destroy();
    }

    tip2 = tippy(target, {
        content: container,
        trigger: 'manual',
        placement: 'top',
        hideOnClick: false,
        allowHTML: true,
        interactive: true, // 允许与tippy内容交互
        appendTo: () => document.body, // 确保tippy添加到body中
    });
    tip2.show();
};



// prompter

let tip3: any = null;
let tippyRoot3: any = null;
interface TippyProps3 {
    target: HTMLElement;
    list: Array<any>;
    selectPrompter?: (item: any) => void;
}

const showTippy3 = ({ target, list, selectPrompter }: TippyProps3) => {

    const onSelectPrompter = (item: any) => {
        selectPrompter && selectPrompter(item);

        tip3 && tip3.destroy();
        tippyRoot3.unmount();
        tip3 = null;
        tippyRoot3 = null;

    }

    const container = document.createElement('div');

    // 清理之前的root
    if (tippyRoot3) {
        tippyRoot3.unmount();
    }

    // 创建新的root并渲染JSX
    tippyRoot3 = ReactDOM.createRoot(container);
    tippyRoot3.render(
        <div className="w-96  overflow-y-auto p-2 bg-white rounded-lg flex items-center ">
            <ScrollArea className="h-80  space-y-4" >
                <ul >
                    { // @ts-ignore
                        list.map((item, index) => {

                            return (
                                <li key={index}
                                    onClick={() => onSelectPrompter(item)}
                                    className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center"
                                    style={{ userSelect: 'none' }}>
                                    <SquareM className='w-4 h-4 mr-2' />
                                    {/* @ts-ignore */}
                                    <div title={item.content}
                                        className='w-80 text-left overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer flex items-center'>
                                        {/* @ts-ignore */}
                                        <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {item.title}
                                        </span>
                                    </div>
                                </li>
                            )
                        })
                    }

                    { // @ts-ignore
                        list.length === 0 && <li className='flex items-center justify-center py-2 '>暂无内容...</li>
                    }
                </ul>
            </ScrollArea>
        </div >
    );

    // 销毁之前的tippy实例
    if (tip3) {
        tip3.destroy();
    }

    tip3 = tippy(target, {
        content: container,
        trigger: 'manual',
        placement: 'top',
        hideOnClick: false,
        allowHTML: true,
        interactive: true, // 允许与tippy内容交互
        appendTo: () => document.body, // 确保tippy添加到body中
    });
    tip3.show();
}



interface MentionProps {
    value?: string;
    placeholder?: string;
    mentionData?: Array<IMinMap>;
    prompters?: Array<any>;
    setMindmapChapters?: Array<any>;     //  思维导图数据及章节
    onChange?: (value: string) => void;
    onSend?: (value: string, select: any) => void;
    close?: () => void;
    // tags?: Array<{ id: string; label: string; }>;
    // onTagClick?: (tagId: string) => void;
}

 let selectTempData: any = []

export default function Mention({ value = '', mentionData, setMindmapChapters, onChange, onSend, close, prompters=[], placeholder = '# 可以关联' }: MentionProps) {
   

    const editorRef = useRef<HTMLDivElement>(null);
    const isComposingRef = useRef(false); // 用于中文输入法处理
    const lastValueRef = useRef(value); // 记录上一次的值

    const { theme } = useTheme()
    const [style, setStyle] = useState<ThemeTokens>(theme)

    const $mentionData = useMemo(() => {
        return mentionData
    }, [mentionData])

    const clear = () => {
        if (!editorRef.current) return;
        editorRef.current.innerHTML = '';
        editorRef.current.focus();
        setCaretToEnd();
    }

    // 将光标放到末尾的工具函数
    function placeCaretAtEnd(el: HTMLDivElement) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    }



    const getCaretOffset = (range: Range): number => {
        if (!editorRef.current) return 0;
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        return preCaretRange.toString().length;
    };

    const setCaretToEnd = () => {
        if (!editorRef.current) return;
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    // 保存和恢复光标位置
    const saveCaretPosition = (): { range: Range | null; offset: number } => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const offset = getCaretOffset(range);
            return { range: range.cloneRange(), offset };
        }
        return { range: null, offset: 0 };
    };

    const restoreCaretPosition = (savedData: { range: Range | null; offset: number }) => {
        if (!savedData.range || !editorRef.current) return;

        try {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedData.range);
            }
        } catch (error) {
            // 如果恢复失败，设置光标到末尾
            setCaretToEnd();
        }
    };

    // 插入标签
    const insertTag = (tag: { id: string; label: string }) => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // 创建标签元素
            const tagElement = document.createElement('span');
            tagElement.className = 'ai-tag';
            tagElement.contentEditable = 'false';
            tagElement.dataset.id = tag.id;
            tagElement.textContent = tag.label;

            // 插入标签
            range.deleteContents();
            range.insertNode(tagElement);

            // 在标签后添加空格并设置光标
            const spaceNode = document.createTextNode(' ');
            range.setStartAfter(tagElement);
            range.insertNode(spaceNode);
            range.setStartAfter(spaceNode);
            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);

            // 触发变化事件
            handleInput();
        }
    };




    // 选择路径的回调
    const onSelectedPath = (path: string[]) => {

        if (!editorRef.current) return;

        let str = removeExternalHash(editorRef.current.innerHTML)

        //  创建标签
        let result = ''

        let tabs = path.map((tab, index) => {
            let text = extractText(tab)
            return (`<span class="ai-tag" title="${text}" contenteditable="false">${normalizePath(text)}</span >`)
        })

        result = `${str} ${tabs.join(' ')}`

        if (editorRef.current) editorRef.current.innerHTML = result;

        if (lastValueRef.current) lastValueRef.current = result;

        editorRef.current && editorRef.current.focus();                       // 1. 聚焦
        editorRef.current && placeCaretAtEnd(editorRef.current);             // 2. 光标到末尾

    }




    const selectChapter = (chapter: any) => {
        if (!editorRef.current) return;

        selectTempData.push({
            title: chapter.title,
            content: extractText(chapter.content.html),
            id: chapter._id,
            type: chapter.type
        })


        let result = `${editorRef.current.innerHTML}<span class="ai-tag" contenteditable="false">${chapter.title}</span >`
        if (editorRef.current) editorRef.current.innerHTML = result;

        if (lastValueRef.current) lastValueRef.current = result;

        editorRef.current && editorRef.current.focus();                       // 1. 聚焦
        editorRef.current && placeCaretAtEnd(editorRef.current);
    }

    const selectMindmap = (mindmap: any) => {
        if (!editorRef.current) return;



        selectTempData.push({
            title: mindmap.title,
            content: nodeToMarkdown(mindmap.content),
            id: mindmap._id,
            type: mindmap.type
        })



        let result = `${editorRef.current.innerHTML}<span class="ai-tag" contenteditable="false">${mindmap.title}</span >`
        if (editorRef.current) editorRef.current.innerHTML = result;

        if (lastValueRef.current) lastValueRef.current = result;

        editorRef.current && editorRef.current.focus();                       // 1. 聚焦
        editorRef.current && placeCaretAtEnd(editorRef.current);


    }

    // 使用提示词
    const onSelectPrompter = (item: any) => {

        if (!editorRef.current) return;
        if (editorRef.current) editorRef.current.innerHTML = item.content;
        if (lastValueRef.current) lastValueRef.current = item.content;
        editorRef.current && editorRef.current.focus();                       // 1. 聚焦
        editorRef.current && placeCaretAtEnd(editorRef.current);
    }

    // 提及思维导图
    const match1 = (text: string) => {
        if (!editorRef.current || isComposingRef.current) return;
        const regex = /#([\w\u4e00-\u9fa5]*)$/;
        const match1 = text.match(regex);

        if (match1) {
            const query = match1[1];
            showTippy({
                target: editorRef.current,
                selecteData: mentionData || [],
                onSelectedPath: (path) => onSelectedPath(path)
            });
        } else {

            tip && tip.destroy();
            tippyRoot && tippyRoot.unmount();
            tip = null;
            tippyRoot = null;
        }
    }

    // 导入文件内容
    const match2 = (text: string) => {
        if (!editorRef.current || isComposingRef.current) return;
        const regex = /、([\w\u4e00-\u9fa5]*)$/;
        const match = text.match(regex);

        if (match) {
            const query = match[1];
            showTippy2({
                target: editorRef.current,
                list: setMindmapChapters || [],
                selectChapter: selectChapter,
                selectMindmap: selectMindmap
            });
        } else {

            tip2 && tip2.destroy();
            tippyRoot2 && tippyRoot2.unmount();
            tip2 = null;
            tippyRoot2 = null;

        }
    }


    // 导入文件内容
    const match3 = (text: string) => {
        if (!editorRef.current || isComposingRef.current) return;

        // 将原来的 "、" 改为 "/"
        const regex = /\/([\w\u4e00-\u9fa5]*)$/;
        const match = text.match(regex);

        if (match) {
            const query = match[1];
            showTippy3({
                selectPrompter: onSelectPrompter,
                target: editorRef.current,
                list: prompters
                //     [
                //     {
                //         _id: "1",
                //         title: "提示词",
                //         content: "提示词提示词提示词提示词提示词"
                //     }
                // ],
            });
        } else {
            tip3 && tip3.destroy();
            tippyRoot3 && tippyRoot3.unmount();
            tip3 = null;
            tippyRoot3 = null;
        }
    };

    // 处理输入变化
    const handleInput = () => {
        if (!editorRef.current || isComposingRef.current) return;
        tip && tip.hide();

        const html = editorRef.current.innerHTML;

        // 检测 # 提及
        const text = editorRef.current.textContent || '';
        match1(text);
        match2(text);
        match3(text);
        // 调用 onChange 回调
        if (onChange && html !== lastValueRef.current) {
            onChange(html);
            lastValueRef.current = html;
        }
    };

    // 处理外部值变化
    useEffect(() => {
        if (editorRef.current && value !== lastValueRef.current) {
            const savedData = saveCaretPosition();

            editorRef.current.innerHTML = value;
            lastValueRef.current = value;

            if (savedData.range) {
                setTimeout(() => restoreCaretPosition(savedData), 0);
            } else {
                setTimeout(() => setCaretToEnd(), 0);
            }
        }
    }, [value]);

    // 处理键盘事件，支持删除标签
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // 处理 Backspace 键
        if (e.key === 'Backspace') {
            // 获取所有标签元素
            const tags = editorRef.current.querySelectorAll('.ai-tag');
            if (tags.length === 0) return;

            // 获取当前光标位置的文本内容
            const textContent = editorRef.current.textContent || '';
            const caretPosition = getCaretOffset(range);

            // 如果光标在文本开头且没有选中内容，尝试删除最后一个标签
            if (caretPosition === 0 && range.collapsed) {
                e.preventDefault();
                const lastTag = tags[tags.length - 1];
                if (lastTag) {
                    // 删除标签及其相邻的空格
                    const nextSibling = lastTag.nextSibling;
                    const prevSibling = lastTag.previousSibling;

                    lastTag.remove();

                    // 删除标签后面的空格
                    if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent?.startsWith(' ')) {
                        nextSibling.textContent = nextSibling.textContent.substring(1);
                    }
                    // 删除标签前面的空格
                    if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE && prevSibling.textContent?.endsWith(' ')) {
                        prevSibling.textContent = prevSibling.textContent.slice(0, -1);
                    }

                    // 重新设置光标位置到开头
                    setTimeout(() => {
                        const newRange = document.createRange();
                        const newSelection = window.getSelection();
                        newRange.setStart(editorRef.current!, 0);
                        newRange.collapse(true);
                        newSelection?.removeAllRanges();
                        newSelection?.addRange(newRange);
                    }, 0);

                    // 触发变化事件
                    handleInput();
                }
                return;
            }

            // 如果光标在文本中间，查找光标前面的标签
            let tagToDelete: Element | null = null;
            let tagEndPosition = 0;

            // 遍历所有标签，找到光标前面最近的标签
            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                const tagText = tag.textContent || '';
                const tagStartInText = textContent.indexOf(tagText, tagEndPosition);
                const tagEndInText = tagStartInText + tagText.length;

                if (tagEndInText <= caretPosition) {
                    tagToDelete = tag;
                    tagEndPosition = tagEndInText;
                } else {
                    break;
                }
            }

            // 如果找到了要删除的标签且光标紧跟在标签后面
            if (tagToDelete && range.collapsed) {
                const tagText = tagToDelete.textContent || '';
                const tagEndInText = textContent.lastIndexOf(tagText) + tagText.length;

                // 检查光标是否紧跟在标签后面（允许有空格）
                if (caretPosition === tagEndInText ||
                    (caretPosition === tagEndInText + 1 && textContent[tagEndInText] === ' ')) {
                    e.preventDefault();

                    const nextSibling = tagToDelete.nextSibling;
                    const prevSibling = tagToDelete.previousSibling;

                    tagToDelete.remove();

                    // 删除相邻的空格
                    if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent?.startsWith(' ')) {
                        nextSibling.textContent = nextSibling.textContent.substring(1);
                    }
                    if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE && prevSibling.textContent?.endsWith(' ')) {
                        prevSibling.textContent = prevSibling.textContent.slice(0, -1);
                    }

                    // 重新设置光标位置
                    setTimeout(() => {
                        const newRange = document.createRange();
                        const newSelection = window.getSelection();

                        if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
                            newRange.setStart(prevSibling, prevSibling.textContent?.length || 0);
                        } else {
                            newRange.setStart(editorRef.current!, 0);
                        }

                        newRange.collapse(true);
                        newSelection?.removeAllRanges();
                        newSelection?.addRange(newRange);
                    }, 0);

                    // 触发变化事件
                    handleInput();
                }
            }
        }

        // 处理 Delete 键
        else if (e.key === 'Delete') {
            const tags = editorRef.current.querySelectorAll('.ai-tag');
            if (tags.length === 0) return;

            const textContent = editorRef.current.textContent || '';
            const caretPosition = getCaretOffset(range);

            // 查找光标后面的第一个标签
            let tagToDelete: Element | null = null;
            let searchPosition = 0;

            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                const tagText = tag.textContent || '';
                const tagStartInText = textContent.indexOf(tagText, searchPosition);

                if (tagStartInText >= caretPosition) {
                    tagToDelete = tag;
                    break;
                }
                searchPosition = tagStartInText + tagText.length;
            }

            if (tagToDelete && range.collapsed) {
                e.preventDefault();

                const nextSibling = tagToDelete.nextSibling;
                const prevSibling = tagToDelete.previousSibling;

                tagToDelete.remove();

                // 删除相邻的空格
                if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent?.startsWith(' ')) {
                    nextSibling.textContent = nextSibling.textContent.substring(1);
                }
                if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE && prevSibling.textContent?.endsWith(' ')) {
                    prevSibling.textContent = prevSibling.textContent.slice(0, -1);
                }

                // 触发变化事件
                handleInput();
            }
        }
    };

    // 处理中文输入法
    const handleCompositionStart = () => {
        isComposingRef.current = true;
    };

    const handleCompositionEnd = () => {
        isComposingRef.current = false;
        handleInput(); // 中文输入结束后触发处理
    };

    // 禁止拖动处理函数
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };


    const handleSend = () => {
        if (!editorRef.current) return;
        let str = editorRef.current.textContent || ''
        onSend && onSend(str, selectTempData);
        setTimeout(() => {

            selectTempData = []
        }, 10)
        clear();
    }


    // 初始渲染时设置内容
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
            lastValueRef.current = value;

            editorRef.current.focus();                       // 1. 聚焦
            placeCaretAtEnd(editorRef.current);             // 2. 光标到末尾
        }
    }, []);

    // 处理标签点击事件
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleClick = (e: MouseEvent) => {
            // const target = e.target as HTMLElement;
            // if (target.classList.contains('ai-tag')) {
            //     e.preventDefault();
            //     e.stopPropagation();
            //     const tagId = target.dataset.id;
            //     if (tagId && onTagClick) {
            //         onTagClick(tagId);
            //     }
            //     console.log('AI标签被点击:', tagId);
            // }
        };

        editor.addEventListener('click', handleClick);
        return () => {
            tip && tip.destroy();
            tippyRoot && tippyRoot.unmount();
            tip = null;
            tippyRoot = null;

            //------------

            tip2 && tip2.destroy();
            tippyRoot2 && tippyRoot2.unmount();
            tip2 = null;
            tippyRoot2 = null;

            //------------

            tip3 && tip3.destroy();
            tippyRoot3 && tippyRoot3.unmount();
            tip3 = null;
            tippyRoot3 = null;

            editor.removeEventListener('click', handleClick);
        };
    }, [ /* onTagClick */]);

    // 暴露插入标签的方法
    useEffect(() => {
        if (editorRef.current) {
            (editorRef.current as any).insertTag = insertTag;
        }
    }, []);



    return (
        <div id='MentionBox' className='relative'>
            {/* 占位符样式 */}
            <style>{`
                .Mention[data-placeholder]:empty::before {
                    content: attr(data-placeholder);
                    color: #9ca3af;          /* gray-400 */
                    pointer-events: none;
                }
                `}</style>


            {/* 输入编辑器 styles*/}
            <div
                className={` Mention w-full min-h-36 max-h-36 scrollbar-hide overflow-y-auto rounded-lg p-3 text-base border border-gray-300 shadow-sm focus:outline-none focus:ring-2`}
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onDragStart={handleDragStart}
                draggable={false}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
                onFocus={() => {
                    tip && tip.hide();
                }}
                style={{
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
                    lineHeight: '1.5'
                }}
            />

            {/* 关闭按钮 */}
            <div className='absolute bottom-2 right-22 z-10'>
                <Button className='cursor-pointer bg-[#CF2C2C] ' onClick={close} size='xs'>
                    <X className='w-4 h-4 mr-1' />
                    <span> 关闭 </span>
                </Button>
            </div>

            {/* 发送按钮 */}
            <div className='absolute bottom-2 right-2 z-10'>
                <Button className='cursor-pointer bg-[#CF2C2C] ' onClick={handleSend} size='xs'>
                    <Send className='w-4 h-4 mr-1' />
                    <span> 发送 </span>
                </Button>
            </div>
        </div>
    );
}