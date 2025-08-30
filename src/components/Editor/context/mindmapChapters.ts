
import { createContext, useContext, useMemo } from 'react'

export type SetMindmapChapterType = Array<{
    id: string,
    title: string,
    type: string,
    content: any
}>;

export const SetMindmapChapterContext = createContext<SetMindmapChapterType | null>(null)

export const useSetMindmapChapter = () => {
    const context = useContext(SetMindmapChapterContext)
    const mindmapChapter = useMemo(() => context, [context])
    if (!context) {
        throw new Error('useMindmaps must be used within a MindmapsProvider')
    }
    return mindmapChapter
}
