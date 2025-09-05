

import {rightMenus} from "@/app/config"
import type {RightMenu} from "@/app/config"
import { useNovelStore } from "./menStore";
import {useSidebarsidebarSize} from "../useSidebarSize"
import {useNovel} from "../useNovel"

export function useRightMenu(){
   const {setIsShowMindmap} = useNovel()
  const {setsidebarSize} = useSidebarsidebarSize()
    const menu = useNovelStore((s) => s.menu);
    const setMenu = useNovelStore((s) => s.setNovelInfo);
    const clearMenu = useNovelStore((s) => s.clearMenu);

    const handleRightanel = (menu:RightMenu) =>{ 
      if(menu.key != '3'){
        setIsShowMindmap(false)
        setsidebarSize(menu.size)
      }
       setMenu(menu)
    }


    return {
       menu,
      rightMenus,
      clearMenu,
      handleRightanel
    }

}