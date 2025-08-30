import {useAIModelsStore,useModelStore} from "./useAIModelStore"

export function useAIModels () {
    const { models, addModel, removeModel, updateModel, getModel, clearModels } = useAIModelsStore()
    const { getValue,setValue,value } =useModelStore()
    return {
      models,
      model:value,
      gwtModel:getValue,
      setModel:setValue,
      addModel,
      removeModel,
      updateModel,
      getModel,
      clearModels,
    }
  }