import { create } from 'zustand'; 
import { EditorState } from "@/types/history"

interface CheckCharacter {
    checkCharacter: EditorState;

    getCheckCharacter: () => EditorState;
    setCheckCharacter: (payload: EditorState) => void;
    clearCheckCharacter: () => void;

}

export const useCharacterStore = create<CheckCharacter>((set, get) => ({
    checkCharacter: { doc: null, history: [], timestamp: 0, branch: "master" },

    clearCheckCharacter: () => set(() => ({
        checkCharacter: { doc: null, history: [], timestamp: 0, branch: "master" }
    })),

    getCheckCharacter: () => get().checkCharacter,
    setCheckCharacter: (payload: EditorState) => set(() => ({ checkCharacter: payload })),
}))

interface ShowCharacter {
  IsShowCharacter: boolean;
  setIsShowCharacter: (payload: boolean) => void;
}

export const ShowCharacterStore = create<ShowCharacter>((set) => ({
  IsShowCharacter: false,
  setIsShowCharacter: (payload) => set({ IsShowCharacter: payload }),
}));

// Preview
