import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/* ⭐ 运行时强制第一行必须是 H1 */
const EnforceFirstHeading = Extension.create({
    name: 'enforceFirstHeading',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('enforceFirstHeading'),
                filterTransaction: (tr, _state) => {
                    const doc = tr.doc
                    const first = doc.firstChild

                    // 允许空文档（首次加载）
                    if (!first) return true

                    // 第一行必须是 level 1 的 heading
                    if (first.type.name !== 'heading' || first.attrs.level !== 1) {
                        return false
                    }

                    return true
                },
            }),
        ]
    },
})


export default EnforceFirstHeading