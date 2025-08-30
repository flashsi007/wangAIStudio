"use client"
import { Icon } from '@/components/Icon'
import { memo } from 'react'
import { Toolbar } from '@/components/ui/Toolbar'
import { BubbleMenu, Editor } from '@tiptap/react';
import { ContentTypePicker } from './components/ContentTypePicker'
import { useTextmenuStates } from './hooks/useTextmenuStates'
import { useTextmenuCommands } from './hooks/useTextmenuCommands'

import { useModelConfig } from '@/components/Editor/context/ModelConfigContext'

import { useRef } from 'react';
import { useState } from 'react';

const MemoButton = memo(Toolbar.Button)

import './index.css'


export type TextMenuProps = {
    editor: Editor

}

const MemoContentTypePicker = memo(ContentTypePicker)

/*****  *****/
import aiHelper from "./aiHelper"



export const TextMenu = ({ editor, }: TextMenuProps) => {
    const commands = useTextmenuCommands(editor)
    const states = useTextmenuStates(editor)

    const modelConfig = useModelConfig();
    const aiHelperRef = useRef<HTMLDivElement>(null);
    // aiHelper


    // 获取AI助手的答案
    const useAiAnswer = (text: string) => {

        const { state } = editor;
        const { from, to } = state.selection;

        editor.commands.insertContentAt({ from, to }, text);
    }

    const openAiHelper = () => {
        if (!aiHelperRef.current) return

        const { state } = editor
        const { from, to } = state.selection
        const selectText = state.doc.textBetween(from, to, '\n')

        aiHelper({
            selectText,
            article: editor.getText(),
            useAiAnswer: useAiAnswer,
            modelConfig: modelConfig as any,
            target: aiHelperRef.current
        })




    }



    return (
        <BubbleMenu
            tippyOptions={{ popperOptions: { placement: 'top-start' } }}
            editor={editor}
            pluginKey="textMenu"
            updateDelay={100}
            shouldShow={states.shouldShow}
        >
            <Toolbar.Wrapper ref={aiHelperRef} className='p-2 toolbarBox'>

                <MemoButton tooltip="AI助手" active={states.isStrike} onClick={openAiHelper} >
                    <div className='flex items-center space-x-1 cursor-pointer'>
                        <Icon name="Sparkles" />
                    </div>
                </MemoButton>

                <Toolbar.Divider />

                <MemoButton tooltip="清除格式" onClick={commands.removeFormatting} active={states.isStrike}>
                    <Icon name="RemoveFormatting" />
                </MemoButton>


                <MemoButton tooltip="粗体" tooltipShortcut={['Mod', 'B']} onClick={commands.onBold} active={states.isBold}>
                    <Icon name="Bold" />
                </MemoButton>
                <MemoButton tooltip="斜体" tooltipShortcut={['Mod', 'I']} onClick={commands.onItalic} active={states.isItalic}>
                    <Icon name="Italic" />
                </MemoButton>

                <MemoButton tooltip="下划线" tooltipShortcut={['Mod', 'U']} onClick={commands.onUnderline} active={states.isUnderline}>
                    <Icon name="Underline" />
                </MemoButton>

                <MemoButton tooltip="删除线" tooltipShortcut={['Mod', 'Shift', 'S']} onClick={commands.onStrike} active={states.isStrike}>
                    <Icon name="Strikethrough" />
                </MemoButton>

                <Toolbar.Divider />

                <MemoButton
                    tooltip="居左"
                    onClick={() => editor.commands.setTextAlign('left')}
                >
                    <Icon name="AlignLeft" />
                </MemoButton>

                <MemoButton
                    tooltip="居中"

                    onClick={() => editor.commands.setTextAlign('center')}
                >
                    <Icon name="AlignCenter" />
                </MemoButton>

                <MemoButton
                    tooltip="居右"

                    onClick={() => editor.commands.setTextAlign('right')}
                >
                    <Icon name="AlignRight" />
                </MemoButton>

                <Toolbar.Divider />

                <MemoButton tooltip="标题2"
                    onClick={() => editor.commands.toggleHeading({ level: 2 })}
                >
                    <div className='flex items-center space-x-1 cursor-pointer'>
                        <Icon name="Heading2" />
                    </div>
                </MemoButton>

                <MemoButton tooltip="标题3"
                    onClick={() => editor.commands.toggleHeading({ level: 3 })}>
                    <div className='flex items-center space-x-1 cursor-pointer'>
                        <Icon name="Heading3" />
                    </div>
                </MemoButton>
            </Toolbar.Wrapper>
        </BubbleMenu>
    )
}