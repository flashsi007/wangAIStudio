import { Group } from './types'
export const GROUPS: Group[] = [
    {
        name: 'AI',
        title: '万事用AI',
        commands: [
            {
                name: 'contentAI',
                label: 'AI 写文章',
                iconName: 'Sparkles',
                description: '使用 AI 助手生成文章',
                aliases: ['ai'],
                action: editor => editor.chain().focus().insertContent({ type: 'contentAI' }).run(),
            },
        ]
    }
]