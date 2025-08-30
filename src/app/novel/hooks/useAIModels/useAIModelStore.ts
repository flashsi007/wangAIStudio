import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { uuid} from '@/lib/utils'

export interface Model {
    id: string;
    modelName: string;
    api: string;
    model: string; 
    key: string; 
}


 
interface AIModelsState {
  models: Model[];
  addModel: (model: Omit<Model, 'id' | 'createdAt'>) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, model: Partial<Omit<Model, 'id' | 'createdAt'>>) => void;
  getModel: (id: string) => Model | undefined;
  clearModels: () => void;
}



export const useAIModelsStore = create<AIModelsState>()(
  persist(
    (set, get) => ({
      models: [],
      
      addModel: (model) => {
        const newModel: Model = {
          ...model,
          id: uuid(), 
        };
        set((state) => ({
          models: [...state.models, newModel],
        }));
      },
      
      removeModel: (id) => {
        set((state) => ({
          models: state.models.filter((model) => model.id !== id),
        }));
      },
      
      updateModel: (id, updatedModel) => {
        set((state) => ({
          models: state.models.map((model) =>
            model.id === id ? { ...model, ...updatedModel } : model
          ),
        }));
      },
      
      getModel: (id) => {
        return get().models.find((model) => model.id === id);
      },
      
      clearModels: () => {
        set({ models: [] });
      },
    }),
    {
      name: 'ai-models-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);



// useModel

 
interface IModel {
    value: Model;
    setValue: (value: Model) => void;
    getValue: () => Model;
}



export const useModelStore = create<IModel>()(
    persist(
        (set, get) => ({
            value: { 
                id: '',
                modelName: '',
                api: '',
                key: '', 
                model: '', 
            },
            setValue: (value: Model) => set({ 
                value: {
                    ...value,
                }
             }),
            getValue: () => get().value,
        }),
        {
            name: 'model-storage',            // sessionStorage 中的 key
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);