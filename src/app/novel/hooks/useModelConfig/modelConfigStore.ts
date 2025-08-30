import { create } from 'zustand'
import { ModelConfig } from './modelConfigType'

export type ModelConfigState = {
    modelConfig: ModelConfig,
    setModelConfig: (modelConfig: ModelConfig) => void
}


export const useModelConfigStore = create<ModelConfigState>((set) => ({
    modelConfig: {
        userId: "",
        model: "",
        key: "",
        api: ""
    },
    setModelConfig: (modelConfig: ModelConfig) => set({  modelConfig: modelConfig})
}))
