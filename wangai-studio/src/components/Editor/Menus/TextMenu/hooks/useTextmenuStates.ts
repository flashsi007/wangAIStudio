import { Editor } from '@tiptap/react'
import { useCallback, useMemo } from 'react'
import { ShouldShowProps } from '../../types'
import { isCustomNodeSelected } from "@/lib/isCustomNodeSelected"
import { isTextSelected } from "@/lib/isTextSelected"

export const useTextmenuStates = (editor: Editor) => {



    const shouldShow = useCallback(
        ({ view, from }: ShouldShowProps) => {
            if (!view) {
                return false
            }

            const domAtPos = view.domAtPos(from || 0).node as HTMLElement
            const nodeDOM = view.nodeDOM(from || 0) as HTMLElement
            const node = nodeDOM || domAtPos

            if (isCustomNodeSelected(editor, node)) {
                return false
            }

            return isTextSelected({ editor })
        },
        [editor],
    )

    return {
        isBold: editor && editor.isActive('bold'),
        isItalic: editor && editor.isActive('italic'),
        isStrike: editor && editor.isActive('strike'),
        isUnderline: editor && editor.isActive('underline'),
        isCode: editor && editor.isActive('code'),
        isSubscript: editor && editor.isActive('subscript'),
        isSuperscript: editor && editor.isActive('superscript'),
        isAlignLeft: editor && editor.isActive({ textAlign: 'left' }),
        isAlignCenter: editor && editor.isActive({ textAlign: 'center' }),
        isAlignRight: editor && editor.isActive({ textAlign: 'right' }),
        isAlignJustify: editor && editor.isActive({ textAlign: 'justify' }),
        currentColor: editor && editor.getAttributes('textStyle')?.color || undefined,
        currentHighlight: editor && editor.getAttributes('highlight')?.color || undefined,
        currentFont: editor && editor.getAttributes('textStyle')?.fontFamily || undefined,
        currentSize: editor && editor.getAttributes('textStyle')?.fontSize || undefined,
        shouldShow,
    }
}
