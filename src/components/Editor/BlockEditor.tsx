"use client"
import "./css/BlockEditor.css"
import { useState, useMemo, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import extensions from './extensions'
import { TextMenu } from './Menus/TextMenu'
import { ContentItemMenu } from './Menus/ContentItemMenu'
import { ModelConfigContext } from "../Editor/context/ModelConfigContext"
import { MentionDataContext } from "../Editor/context/mentionData"
import { SetMindmapChapterContext } from '../Editor/context/mindmapChapters'
import { PromptersContext } from "../Editor/context/promptersData"
import type { MentionDataType } from "../Editor/context/mentionData"
import useTheme from "@/hooks/useTheme"
import { themeToCssVars } from '@/app/config';
import type { ModelConfig } from "@/app/api"


interface BlockEditorProps {
    content: any;
    modelConfig?: ModelConfig;
    mentionData?: MentionDataType;
    prompters?: Array<any>;
    setMindmapChapters?: Array<any>
    editable?: boolean;// 是否可编辑


    // 内容变化回调 
    onStateChange?: (state: { html: string, text: string, json: any, words: number, paragraphs: number }) => void;
}

export const BlockEditor = ({ content, editable = true, onStateChange, modelConfig, mentionData, prompters, setMindmapChapters }: BlockEditorProps) => {

    const { theme } = useTheme()


    const editor = useEditor({
        // @ts-ignore
        extensions,
        content: content || '',

        editable, // 是否可编辑

        onUpdate: ({ editor }) => {
            if (onStateChange) {
                onStateChange({
                    html: editor.getHTML(),
                    text: editor.getText(),
                    json: editor.getJSON(),
                    paragraphs: editor.storage.characterCount.words(), // 段落数统计
                    words: editor.storage.characterCount.characters(), // 字数统计 words
                });

            }

        }

    });

    /* 根据 theme 生成 CSS 变量字符串 */
    const cssVarString = useMemo(
        () => themeToCssVars(theme),
        [theme]
    );

    useEffect(() => {
        if (editor) editor.commands.setContent(content)
    }, [content])







    return (
        <ModelConfigContext.Provider value={modelConfig}>
            <MentionDataContext.Provider value={mentionData || []}>
                <SetMindmapChapterContext value={setMindmapChapters || []}>
                    <PromptersContext.Provider value={prompters || []}>


                        {/* 1️⃣ 把变量注入全局 */}
                        <style jsx global>{`
                            :root {
                            ${cssVarString}
                            }
                        `}</style>


                        <TextMenu editor={editor} />
                        {/* <ContentItemMenu editor={editor} /> */}
                        <EditorContent editor={editor} />



                    </PromptersContext.Provider>
                </SetMindmapChapterContext>
            </MentionDataContext.Provider>
        </ModelConfigContext.Provider>
    );


}