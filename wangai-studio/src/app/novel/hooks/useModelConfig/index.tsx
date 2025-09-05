

import { useModelConfigStore } from './modelConfigStore'

export const useModelConfig = () => {
    const {modelConfig,setModelConfig} = useModelConfigStore()
    return {
        modelConfig,
        setModelConfig
    }
}