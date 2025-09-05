import { create } from 'zustand';

interface CharacterStore {
    characterTitle: string;

    getCharacterTitle: () => string;
    setCharacterTitle: (payload: string) => void;

    clearCharacterTitle: () => void;

}
 
export  const characterTitleStore = create<CharacterStore>((set, get) => ({
    characterTitle: '',

    getCharacterTitle: () => get().characterTitle,
    setCharacterTitle: (payload) => set({ characterTitle: payload }),

    clearCharacterTitle: () => set({ characterTitle: '' }),
})) 
