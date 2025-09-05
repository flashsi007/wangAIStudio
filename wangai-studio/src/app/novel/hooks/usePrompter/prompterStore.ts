import { create } from 'zustand';
import { PrompterType } from './prompterType';

interface PrompterStore {
    prompterList: PrompterType[];
    setPrompterList: (prompterList: PrompterType[]) => void;
}

export const usePrompterStore = create<PrompterStore>((set) => ({
    prompterList: [],
    setPrompterList: (prompterList) => set({ prompterList }),
}));
