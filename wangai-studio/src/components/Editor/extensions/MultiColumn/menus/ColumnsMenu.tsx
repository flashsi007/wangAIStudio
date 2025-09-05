import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react'
import { useCallback } from 'react'
import { sticky } from 'tippy.js'
import { v4 as uuid } from 'uuid'

import { MenuProps } from '@/components/Editor/Menus/types'
import { getRenderContainer } from '@/lib/utils'
import { Toolbar } from '@/components/ui/Toolbar'
import { ColumnLayout } from '../Columns'
import { Icon } from '@/components/Icon'

export const ColumnsMenu = ({ editor, appendTo }: MenuProps) => {
    const getReferenceClientRect = useCallback(() => {
        const renderContainer = getRenderContainer(editor, 'columns')
        const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0)


        return rect
    }, [editor])

    const shouldShow = useCallback(() => {
        const isColumns = editor.isActive('columns')
        return isColumns
    }, [editor])

    const onColumnLeft = useCallback(() => {
        editor.chain().focus().setLayout(ColumnLayout.SidebarLeft).run()
    }, [editor])

    const onColumnRight = useCallback(() => {
        editor.chain().focus().setLayout(ColumnLayout.SidebarRight).run()
    }, [editor])

    const onColumnTwo = useCallback(() => {
        editor.chain().focus().setLayout(ColumnLayout.TwoColumn).run()
    }, [editor])

    return (
        <BaseBubbleMenu
            editor={editor}
            pluginKey={`columnsMenu-${uuid()}`}
            shouldShow={shouldShow}
            updateDelay={0}
            tippyOptions={{
                offset: [0, 8],
                popperOptions: {
                    modifiers: [
                        { name: 'flip', enabled: false },
                    ],
                },
                getReferenceClientRect,

                appendTo: () => appendTo?.current,
                plugins: [sticky],
                sticky: 'popper',
            }}
        >
            <Toolbar.Wrapper>
                <Toolbar.Button
                    tooltip="左侧边栏"
                    active={editor.isActive('columns', { layout: ColumnLayout.SidebarLeft })}
                    onClick={onColumnLeft}
                >
                    <Icon name="PanelLeft" />
                </Toolbar.Button>
                <Toolbar.Button
                    tooltip="两栏布局"
                    active={editor.isActive('columns', { layout: ColumnLayout.TwoColumn })}
                    onClick={onColumnTwo}
                >
                    {/* @ts-ignore */}
                    <Icon name="Columns" />
                </Toolbar.Button>
                <Toolbar.Button
                    tooltip="右侧边栏"
                    active={editor.isActive('columns', { layout: ColumnLayout.SidebarRight })}
                    onClick={onColumnRight}
                >
                    <Icon name="PanelRight" />
                </Toolbar.Button>
            </Toolbar.Wrapper>
        </BaseBubbleMenu>
    )
}

export default ColumnsMenu
