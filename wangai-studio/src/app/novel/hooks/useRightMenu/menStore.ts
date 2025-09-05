import { create } from 'zustand';
import type {RightMenu} from "@/app/config"

interface MenuState {
  menu: RightMenu | null;                   
  setNovelInfo: (payload: RightMenu) => void;
  clearMenu: () => void;
}
 
export const useNovelStore  = create<MenuState>((set) => ({
  menu: null,
  setNovelInfo: (payload) => set({ menu: payload }),
  clearMenu: () => set({ menu: null }),
}));
