'use client';
import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/Icon'
import useTheme from "@/hooks/useTheme"
import {useRightMenu,useSidebarsidebarSize } from '../../hooks'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeTokens } from '@/app/config';
import type {RightMenu} from "@/app/config"

export  function RightLayout() {
    const { rightMenus, handleRightanel } = useRightMenu()
    const {setsidebarSize} = useSidebarsidebarSize()
    const [rightLayoutStyle, setRightLayoutStyle] = useState<ThemeTokens>()
    const [style, setStyle] = useState({})
    const { theme } = useTheme() 
    const getStyle = () => {
        setRightLayoutStyle(theme)
        setStyle({
            backgroundColor: (theme.backgroundImage) ? "" : theme.rightColor
        })
    }

    const handleClick = (menu: RightMenu) => { 
        setsidebarSize(menu.size )
        handleRightanel(menu) 
    }

    useEffect(() => {
        getStyle()
    }, [theme])

    return (
        <div style={style} className={`main-right hidden md:block w-12 z-50  h-screen absolute top-0 right-0  border-gray-200 bg-gradient-to-b  shadow-lg`}>
            <ul className="pt-4 px-3 space-y-2" style={{ height: '80vh' }}>
                {rightMenus.map((menu, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger onClick={() => handleClick(menu)}>

                                <Icon name={menu.icon as any}
                                    className="w-5 h-5 mb-1.5 cursor-pointer  group-hover:text-foreground transition-colors duration-200" />

                            </TooltipTrigger>

                            <TooltipContent className=" p-2 rounded-md shadow-lg "  style={{
                                zIndex:300,
                                border: 'none',
                                background: '#0a0a0a'
                            }} >

                                <li className='list-none flex items-center justify-between space-x-2'>
                                    <Icon name={menu.icon as any} className="w-5 h-5 mb-1.5  cursor-pointer  text-white  group-hover:text-foreground transition-colors duration-200" />


                                    <span className="text-xs text-center text-white  group-hover:text-foreground font-medium transition-colors duration-200 leading-tight">
                                        {menu.title}
                                    </span>
                                </li>

                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </ul>
        </div>
    )
}