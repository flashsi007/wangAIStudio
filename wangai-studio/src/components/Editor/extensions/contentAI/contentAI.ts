// 导入 Tiptap 的核心模块和 React 节点视图渲染器
import { Node, ReactNodeViewRenderer } from '@tiptap/react'
// 导入自定义的 React 组件用于渲染节点
import { ContentAIView } from './view/ContentAIView'

// 声明模块扩展：为 Tiptap 的 Commands 接口添加自定义命令
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        contentAI: {
            // 定义 setContentAI 命令，用于插入 AI 内容节点
            setContentAI: () => ReturnType
        }
    }
}

// 创建自定义节点插件
export const ContentAI = Node.create({
    // 节点唯一标识名
    name: 'contentAI',

    // 节点分组（块级节点）
    group: 'block',

    // 节点属性配置
    draggable: true,   // 允许拖拽
    selectable: true,  // 允许选中
    inline: false,     // 非内联元素（块级元素）

    // 定义如何从 HTML 解析为节点
    parseHTML() {
        return [
            {
                // 匹配带有特定 data-type 属性的 div 标签
                tag: `div[data-type="${this.name}"]`,
            },
        ]
    },

    // 定义节点如何渲染为 HTML
    renderHTML() {
        return [
            'div',  // 外层标签
            {
                'data-type': this.name,  // 添加识别属性
                style: ''                // 可添加内联样式
            },
            'AI 生成的内容将显示在这里'  // 默认占位文本
        ]
    },

    // 添加自定义命令
    addCommands() {
        return {
            setContentAI: () => ({ commands }) => {
                // 插入包含特定结构的 HTML 内容
                return commands.insertContent(
                    `<div data-type="${this.name}" style="">AI 生成的内容将显示在这里</div>`
                )
            },
        }
    },

    // 添加节点视图（使用 React 组件渲染）
    addNodeView() {
        // 使用 ReactNodeViewRenderer 包装自定义组件
        return ReactNodeViewRenderer(ContentAIView)
    },
})

export default ContentAI