import { createContext, useContext, useMemo } from 'react'

export type MentionDataType = Array<{
    _id: string,
    title: string,
    type: string,
    content: any
}>;

export const MentionDataContext = createContext<MentionDataType | null>(null)

export const useMentionData = () => {
    const context = useContext(MentionDataContext)
    const mentionData = useMemo(() => context, [context])
    if (!context) {
        throw new Error('useMindmaps must be used within a MindmapsProvider')
    }
    return mentionData
}