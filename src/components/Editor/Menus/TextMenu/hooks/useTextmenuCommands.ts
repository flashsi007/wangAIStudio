import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

export const useTextmenuCommands = (editor: Editor, externalCallbacks?: {
    foreshadowing?: (data: string) => void;
    onNewSetting?: (data: string) => void;
    onNewCharacter?: (data: string) => void;
}) => {

    const removeFormatting = useCallback(() => editor.commands.unsetAllMarks(), [editor])

    const onBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor])

    const onItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor])

    const onStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor])
    // @ts-ignore  
    const onUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor])

    const onCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor])

    const onCodeBlock = useCallback(() => editor.chain().focus().toggleCodeBlock().run(), [editor])

    // @ts-ignore
    const onSubscript = useCallback(() => editor.chain().focus().toggleSubscript().run(), [editor])

    // @ts-ignore
    const onSuperscript = useCallback(() => editor.chain().focus().toggleSuperscript().run(), [editor])

    // @ts-ignore
    const onAlignLeft = useCallback(() => editor.chain().focus().setTextAlign('left').run(), [editor])

    // @ts-ignore
    const onAlignCenter = useCallback(() => editor.chain().focus().setTextAlign('center').run(), [editor])

    // @ts-ignore
    const onAlignRight = useCallback(() => editor.chain().focus().setTextAlign('right').run(), [editor])

    // @ts-ignore
    const onAlignJustify = useCallback(() => editor.chain().focus().setTextAlign('justify').run(), [editor])

    // @ts-ignore
    const onChangeColor = useCallback((color: string) => editor.chain().setColor(color).run(), [editor])

    // @ts-ignore
    const onClearColor = useCallback(() => editor.chain().focus().unsetColor().run(), [editor])

    // @ts-ignore
    const onChangeHighlight = useCallback((color: string) => editor.chain().setHighlight({ color }).run(), [editor])

    // @ts-ignore
    const onClearHighlight = useCallback(() => editor.chain().focus().unsetHighlight().run(), [editor])

    const onLink = useCallback(
        (url: string, inNewTab?: boolean) =>
            editor
                .chain()
                .focus() // @ts-ignore
                .setLink({ href: url, target: inNewTab ? '_blank' : '' })
                .run(),
        [editor],
    )

    const onSetFont = useCallback(
        (font: string) => {
            if (!font || font.length === 0) { // @ts-ignore
                return editor.chain().focus().unsetFontFamily().run()
            } // @ts-ignore
            return editor.chain().focus().setFontFamily(font).run()
        },
        [editor],
    )

    const onSetFontSize = useCallback(
        (fontSize: string) => {
            if (!fontSize || fontSize.length === 0) { // @ts-ignore
                return editor.chain().focus().unsetFontSize().run()
            } // @ts-ignore
            return editor.chain().focus().setFontSize(fontSize).run()
        },
        [editor],
    )



    return {
        removeFormatting,
        onBold,
        onItalic,
        onStrike,
        onUnderline,
        onCode,
        onCodeBlock,
        onSubscript,
        onSuperscript,
        onAlignLeft,
        onAlignCenter,
        onAlignRight,
        onAlignJustify,
        onChangeColor,
        onClearColor,
        onChangeHighlight,
        onClearHighlight,
        onSetFont,
        onSetFontSize,
        onLink,
    }
}
