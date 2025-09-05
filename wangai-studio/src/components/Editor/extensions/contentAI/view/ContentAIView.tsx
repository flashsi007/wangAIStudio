
import { Editor, NodeViewWrapper } from '@tiptap/react'
import { useMemo, useState } from 'react'
import AIInput from '@/components/AIInput'
import { useModelConfig } from '@/components/Editor/context/ModelConfigContext'
import { useMentionData, MentionDataType } from '@/components/Editor/context/mentionData'
import { useSetMindmapChapter, SetMindmapChapterType } from '@/components/Editor/context/mindmapChapters'
import { usePrompters, PromptersType } from "@/components/Editor/context/promptersData"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import MarkdownRender from "./MarkdownRender"

import { X } from 'lucide-react';
import type { ModelConfig } from "@/app/api"
import { chatStream } from "@/app/api"


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




/**
 * 
 * @param param
 * @returns 
 */
export const ContentAIView = ({ editor, getPos }: { editor: Editor; getPos: () => number }) => {
    const [content, setContent] = useState('');
    const modelConfig = useModelConfig();

    // @ts-ignore
    const mentionData: Array<MentionDataType | null> = useMentionData();

    // @ts-ignore
    const mindmapChapter: Array<SetMindmapChapterType | null> = useSetMindmapChapter();

    // @ts-ignore
    const prompters: Array<PromptersType | null> = usePrompters();

    const [aiAnswer, setAiAnswer] = useState('');
    const [loadding, setLoadding] = useState(false)
    const $mentionData = useMemo(() => mentionData || [], [mentionData])




    const handleContentChange = (newContent: string) => {
        setContent(newContent);
    };



    const handleonSend = (content: string, selectedNode: any) => {
        setAiAnswer('')
        if (loadding || content == "") return

        if (!modelConfig || content === '') return;

        const list = [...new Map(selectedNode.map((item: any) => [item.id, item])).values()];

        let related = ""
        for (let i = 0; i < list.length; i++) {
            let item: any = list[i]
            related += `<${item.title}>
                    ${item.content}
                 </${item.title}> \n`
        }


        let prompter = `
          <用户需求>
           ${content} 
          </用户需求>
          <AI回复>
            1. 直接回答不要出现 好的xxxx或者分析xxxx之类的词，这样会让人感到不舒服。
            2. 只能有一个 # h1 标题，开头必须是 # 标题。 
          </AI回复> 
           <关联内容>${related}</关联内容>
        `
        setLoadding(true)
        chatStream({
            message: prompter,
            ...modelConfig,
            onData: (chunk: string) => {

                setAiAnswer(prev => prev += `${chunk} \n`)
            },
            onError: (error: any) => {
                setLoadding(false)
            },
            onComplete: () => {
                setLoadding(false)
            }
        })


    };

    const useAiAnswer = () => {
        // 根据以下内容生成完整的 第一章网文，符合番茄小说平台的文风 2000字左右
        const pos = getPos();
        editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + 1 })
            .insertContent(md2html(aiAnswer))
            .run();
    }

    const AiAnswer = () => {


        if (aiAnswer === '') return null

        return (
            <div className='w-full flex flex-col space-y-2 p-4 relative'>
                {
                    loadding && (
                        <div className="w-full h-14 absolute top-0 left-0 right-0 m-auto flex   justify-center items-center ">
                            <LoaderCircle className='w-6 h-6 animate-spin' />
                        </div>
                    )
                }
                <ScrollArea className="h-[38rem]  space-y-4" >
                    <MarkdownRender content={aiAnswer} />
                </ScrollArea>

                <div className='flex items-center justify-end space-x-2'>
                    <Button className='cursor-pointer' onClick={useAiAnswer}> 应用</Button>
                </div>
            </div>
        )
    }

    const close = () => {
        const pos = getPos(); // 获取当前节点在文档中的起始位置
        if (pos !== undefined) {
            editor.commands.deleteRange({ from: pos, to: pos + 1 });
        }

    }
    return (
        <NodeViewWrapper>
            <div className='w-full min-h-32  my-2 overflow-y-auto rounded-lg scrollbar-hide shadow-lg'>

                <AiAnswer />

                <div className='flex flex-col px-4 py-2'>
                    {/* 操作指引 */}
                    <div className='mb-3 text-sm text-gray-600'>
                        <div className='flex flex-wrap gap-4'>
                            <span className='flex items-center'>
                                <kbd className='px-1.5 py-0.5 text-xs bg-gray-100 border rounded mr-1'>#</kbd>
                                关联思维导图节点
                            </span>
                            <span className='flex items-center'>
                                <kbd className='px-1.5 py-0.5 text-xs bg-gray-100 border rounded mr-1'>、</kbd>
                                关联章节与思维导图
                            </span>
                            <span className='flex items-center'>
                                <kbd className='px-1.5 py-0.5 text-xs bg-gray-100 border rounded mr-1'>/</kbd>
                                导入提示词
                            </span>
                        </div>
                    </div>
                    
                    {/* @ts-ignore */}
                    <AIInput mentionData={$mentionData}
                        placeholder='输入内容开始创作...'
                        value={content}
                        prompters={prompters}
                        setMindmapChapters={mindmapChapter}
                        onSend={handleonSend}
                        onChange={handleContentChange} >
                        <Button onClick={close}
                            className='cursor-pointer' size='xs'>
                            <X className='w-4 h-4 mr-2' />
                            <span> 关闭 </span>
                        </Button>
                    </AIInput>
                </div>
            </div>
        </NodeViewWrapper>
    )
}