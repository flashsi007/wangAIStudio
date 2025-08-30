import { createContext, useContext } from 'react'
import type { ModelConfig } from '@/app/api'


export const ModelConfigContext = createContext<ModelConfig | undefined>(undefined)

export const useModelConfig = () => {
    const context = useContext<ModelConfig | undefined>(ModelConfigContext)
    return context
}