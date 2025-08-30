import { createContext, useContext, useMemo } from 'react'

export type PromptersType = Array<{
    _id: string,
    title: string,
    content: any
}>;

export const PromptersContext = createContext<PromptersType | null>(null)

export const usePrompters = () => {
    const context = useContext(PromptersContext)
    const Prompters = useMemo(() => context, [context])
    if (!context) {
        throw new Error('useMindmaps must be used within a MindmapsProvider')
    }
    return Prompters
}