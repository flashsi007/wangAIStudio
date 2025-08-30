import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import tippy, { Instance } from 'tippy.js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, CircleX, ArrowUpFromLine, ArrowUp } from 'lucide-react';

import type { ModelConfig } from "@/app/api"
import { chatStream } from "@/app/api"
import MarkdownRender from "./components/MarkdownRender"


/**
 * @description 获取上下文
 * @param text 全部文章内容
 * @param key 关键词
 * @param half    半径，默认100
 * @returns 
 */
function getContext(text: string, key: string, half: number = 100): string {
    if (!key) return '';

    const idx = text.indexOf(key);
    if (idx === -1) return '';

    const start = Math.max(0, idx - half);
    const end = Math.min(text.length, idx + key.length + half);

    // 尽可能保持完整句子：向前找换行/句号，向后找换行/句号
    const sentenceStart = text.lastIndexOf('\n', idx);
    const sentenceEnd = text.indexOf('\n', idx + key.length);

    const finalStart = sentenceStart !== -1 && sentenceStart < start ? sentenceStart + 1 : start;
    const finalEnd = sentenceEnd !== -1 && sentenceEnd > end ? sentenceEnd : end;

    return text.slice(finalStart, finalEnd).trim();
}



// -------------------------------------------------
// 1. 真正的 React 组件，里面随便用 Hook
// -------------------------------------------------
interface AiPanelProps {
    modelConfig: ModelConfig
    selectText: string;
    context: string;
    onClose: () => void;
    // 应用AI回答
    useAiAnswer?: (text: string) => void;
}


const AiPanel: React.FC<AiPanelProps> = ({ onClose, useAiAnswer, modelConfig, selectText, context }) => {

    const [value, setValue] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);


    const sendMsg = () => {
        const msg = value.trim();
        if (!msg || msg == '') return;
        setValue('');
        setAiAnswer('')

        let prompter = `
          <用户需求>
           ${msg}
           
          </用户需求>
          <AI回复>
            直接回答不要出现 好的xxxx或者分析xxxx之类的词，这样会让人感到不舒服。
          </AI回复>

          <选中文本>
            ${selectText}
          </选中文本>

          <上下文让AI更了解>
            ${context}
          </上下文让AI更了解> 
        `

        setLoading(true)
        chatStream({
            message: prompter,
            ...modelConfig,
            onData: (chunk: string) => {
                setLoading(false)
                setAiAnswer(prev => prev += `${chunk} \n`)
            },
            onError: (e: string) => {
                setLoading(false)
                setAiAnswer(e);
            },
            onComplete: () => {
                setLoading(false)
                // setAiAnswer('');
            },
        })

    }



    // 自动聚焦
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const AiAnswer = () => {
        if (aiAnswer && loading == false) {
            return (
                <div className="w-full max-h-80 overflow-y-auto bg-white mb-2 rounded-md p-4">
                    <MarkdownRender content={aiAnswer} />
                </div>
            )
        }
        if (loading) {
            return (
                <div className="w-full h-14 overflow-y-auto bg-white mb-2 rounded-md p-4 flex justify-center items-center'">
                    <LoaderCircle className='w-6 h-6 animate-spin' />
                </div>
            )
        }
        return null
    }
    return (
        <div className="toolbarBox w-96 relative">
            <AiAnswer />

            <div className="w-full relative">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type="search"
                    className="pr-10"
                    placeholder="告诉我接下来该怎么做？例如，帮我把内容翻译成英语。"
                />
                <Button className="absolute top-1 right-1 w-6 h-6 cursor-pointer" onClick={sendMsg}>
                    <ArrowUp className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-50 toolbarBox absolute border-2 p-4 bottom-[-6.5rem] left-2 rounded-md">
                <ul className="space-y-2">
                    <li className="cursor-pointer flex items-center space-x-2">
                        <CircleX className="w-4 h-4 text-red-600" />
                        <button onClick={onClose} className="cursor-pointer w-full text-red-600 text-left text-sm">
                            取消
                        </button>
                    </li>
                    <li className="cursor-pointer flex items-center space-x-2">
                        <ArrowUpFromLine className="w-4 h-4" />
                        <button
                            onClick={() => useAiAnswer && useAiAnswer(aiAnswer)}
                            className="cursor-pointer w-full text-left text-sm">应用</button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

// -------------------------------------------------
// 2. 纯命令式函数：负责挂载/卸载
// -------------------------------------------------
interface TippyProps {
    target: HTMLElement;
    modelConfig: ModelConfig
    selectText: string;
    // 全部文章内容
    article: string;
    // 应用AI回答
    useAiAnswer?: (text: string) => void;
}

let tip: Instance | null = null;
let tippyRoot: ReactDOM.Root | null = null;

export default function aiHelper({ target, useAiAnswer, modelConfig, selectText, article }: TippyProps) {
    // 清理上一次
    if (tippyRoot) tippyRoot.unmount();
    if (tip) tip.destroy();

    const container = document.createElement('div');

    const close = () => {
        tippyRoot?.unmount();
        tip?.destroy();
        container.remove();
        tippyRoot = null;
        tip = null;
    };

    tippyRoot = ReactDOM.createRoot(container);
    tippyRoot.render(<AiPanel
        useAiAnswer={(aiAnswer) => {
            close();
            useAiAnswer && useAiAnswer(aiAnswer);
        }}
        onClose={close}
        modelConfig={modelConfig}
        selectText={selectText}
        context={getContext(article, selectText)} />);

    tip = tippy(target, {
        content: container,
        trigger: 'manual',
        placement: 'bottom',
        hideOnClick: false,
        allowHTML: true,
        interactive: true,
        appendTo: () => document.body,
    });
    tip.show();
}