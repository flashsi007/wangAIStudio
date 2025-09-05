
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface IData {
    sidebarSize: number|string;
    setsidebarSize: (sidebarSize: number|string) => void;
    getsidebarSize: () => number|string;
}


export  const useSidebarsidebarSize = create<IData>()(
      persist(
        (set, get) => ({
          sidebarSize: 2.5,
          setsidebarSize: (sidebarSize: number|string) => set({ sidebarSize }),
          getsidebarSize: () => get().sidebarSize,
        }),
        {
          name: 'sidebarSize',
        }
      )
)