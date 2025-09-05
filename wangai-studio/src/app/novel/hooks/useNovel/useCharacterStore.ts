
import { create } from 'zustand';
interface CharacterStore {
    characterTitle: string;

    character: Record<string, unknown> | null;
    getCharacter: () => Record<string, unknown> | null;
    setCharacter: (payload: Record<string, unknown>) => void;
    clearCharacter: () => void;

}

export const useCharacterStore = create<CharacterStore>((set) => ({
    characterTitle: '',
    character: null,
    getCharacter: () => null,
    setCharacter: (payload) => set({ character: payload }),
    clearCharacter: () => set({ character: null }),
}))


interface IsShowCharacterStore {
    isShowCharacter: boolean;
    setIsShowCharacter: (payload: boolean) => void;
}

export const useIsShowCharacterStore = create<IsShowCharacterStore>((set) => ({
    isShowCharacter: false,
    setIsShowCharacter: (payload) => set({ isShowCharacter: payload }),
}))
