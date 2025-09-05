import { isTextSelection } from '@tiptap/core'
import { Editor } from '@tiptap/react'

export const isTextSelected = ({ editor }: { editor: Editor }) => {
    const {
        state: {
            doc,
            selection,
            selection: { empty, from, to },
        },
    } = editor

    // 有时仅仅检查“是否为空”是不够的。
    // 双击一个空白段落，其节点大小将变为 2 。
    // 所以我们还会检查文本的长度是否为空。
    const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection)

    if (empty || isEmptyTextBlock || !editor.isEditable) {
        return false
    }

    return true
}

export default isTextSelected
