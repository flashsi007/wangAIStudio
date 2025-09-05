'use client'
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input";
import { History } from 'lucide-react';
import useTheme from "@/hooks/useTheme"
import { ThemeTokens } from '@/app/config';
import { useVw } from "@/hooks/useVwHv"
import {useCharacterTitle,useEditorHistory,useCheckCharacter,useNovel,useSidebarsidebarSize} from '../../hooks'

import { LAYOUT_RATIO } from '@/app/config';
import { EditorState } from '@/types/history';




/**
 * 按规则返回首字母或首字
 * - 英文：取前两位并大写
 * - 中文：返回第一个汉字
 */
function takeInitial(str: string): string {
    // 用正则检测首字符是否为英文字母
    if (/^[A-Za-z]/.test(str)) {
        return str.slice(0, 2).toUpperCase();   // 英文
    }
    // 否则视为中文（或其他非英文字符）
    return str.charAt(0);                      // 中文
}

/**
 * 把毫秒时间戳转成「今天/昨天/前天/具体日期」格式
 * 1755247435474 -> "今天, 14:32"
 */
function formatRelativeTime(ts: number): string {
    const now = new Date();
    const then = new Date(ts);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const h = pad(then.getHours());
    const m = pad(then.getMinutes());

    // 去掉时分秒，只比较日期部分
    const toDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor(
        (toDate(now).getTime() - toDate(then).getTime()) / (24 * 3600 * 1000)
    );

    if (diffDays === 0) return `今天, ${h}:${m}`;
    if (diffDays === 1) return `昨天, ${h}:${m}`;
    if (diffDays === 2) return `前天, ${h}:${m}`;

    // 更久：2024-3-1 14:32
    return `${then.getFullYear()}-${then.getMonth() + 1}-${then.getDate()} ${h}:${m}`;
}


export function PanelHistory() {
 const {novelId} = useNovel() 
 const cardWidth = useVw(LAYOUT_RATIO.right);
 const {characterTitle} = useCharacterTitle()
 const {options,getVersionsByBranch} = useEditorHistory()
 const {setCheckCharacter,stShowCharacter} = useCheckCharacter()
const [open, setOpen] = React.useState(false)
const [value, setValue] = React.useState(characterTitle )
const [versions, setVersions] = useState([])

 const { theme } = useTheme()
  const [style, setStyle] = useState<ThemeTokens>(theme)

  const { setsidebarSize } = useSidebarsidebarSize()

 useEffect(() => {
  initData(characterTitle)
  console.log('🔥 PanelHistory mounted',characterTitle);
  return () => console.log('💀 PanelHistory unmounted');
}, []);



   const hanleClick = (item: EditorState) => {
        setCheckCharacter(item); ;
        stShowCharacter(true)
        setsidebarSize(50)
    }

 const initData = async (characterTitle = '') => {


        let result = await getVersionsByBranch(novelId) 
        let list = result.filter(item => item.history.title === characterTitle)
 
        // @ts-ignore
        setVersions(list);
    }


     const handleSlectValue = (currentValue: string) => {

        // @ts-ignore
        setValue(currentValue === value ? "" : currentValue)
        setOpen(false)
        initData(currentValue)
    }

  return (
    <div  className="pl-2 pt-5 pr-4"  style={{ width:"19rem",border:`1px solid ${style.rightColor}`  }} > 

   <div className="title w-full flex justify-center items-center border-b-1 ">
                <div className='flex items-center justify-center'>
                    <History className="font-bold w-8 h-8" />
                    <h2 className="text-2xl font-bold"> 版本历史 </h2>
                </div>
            </div>

         <div className='mt-4 flex justify-center items-center'>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild  style={{  border: 'none',  backgroundColor: theme.mainColor }}>
                        <Button variant="outline" role="combobox" aria-expanded={open}

                            className="w-full max-w-sm hover:bg-accent hover:text-accent-foreground bg-transparent justify-between" >
                            {/* @ts-ignore */}
                            {value ? options.find((option) => option.value === value)?.label : "选择章节..."}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" style={{  border: 'none',  backgroundColor: theme.mainColor }} >
                        <Command  >
                            <CommandInput placeholder="搜索章节..." className="h-9" />
                            <CommandList >
                                <CommandEmpty>选择章节</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option:any,index) => (
                                        // @ts-ignore 
                                        <CommandItem key={index} value={option.value} 
                                         onSelect={(currentValue) => handleSlectValue(currentValue)}
                                        >
                                            {/* @ts-ignore */}
                                            {option.label}
                                            {/* @ts-ignore */}
                                            <Check className={cn("ml-auto", value === option.value ? "opacity-100" : "opacity-0")} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

            </div>

            {/*  */}
      

       <div className="mt-4">
                <ScrollArea className="h-screen max-h-screen sm:max-h-screen" style={{ height: '75vh' }}>

                <div className=' p-4 space-y-3'>

                    {
                        versions.map((item, index) => {
                            return (
                                <div key={index}
                                    onClick={() => hanleClick(item)}
                                    className='p-4 rounded-lg relative  text-sm space-y-3 cursor-pointer'
                                    style={{
                                        width: "16rem",
                                        backgroundColor: style.backgroundImage ? '' : style.rightColor
                                    }}>
                                     

                                    <div className='flex items-center justify-between'>
                                        <div className='max-w-xs overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {/* @ts-ignore */}
                                            <h3>{item?.history.title}</h3>
                                        </div>

                                        <div className='max-w-24 overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {/* @ts-ignore */}
                                            <span> {formatRelativeTime(item.timestamp)}</span>
                                        </div>
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <div
                                            className='flex items-center justify-center space-x-2 font-bold text-xs text-gray-400 rounded-full w-10 h-10 bg-gray-100'>
                                            {/* @ts-ignore */}
                                            {takeInitial(item?.history.userName)}
                                        </div>

                                        <div className='max-w-72 overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {/* @ts-ignore */}
                                            {item?.history.userName}
                                        </div>
                                    </div>

                                    <div className='p-4 rounded-lg '
                                        style={{ backgroundColor: style.backgroundImage ? '' : style.mainColor }}>
                                        <div className='max-w-full overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {/* @ts-ignore */}
                                            <span>{item?.history.describe}</span>
                                        </div>
                                    </div>

                                    <div className='w-full flex items-center space-x-2'>
                                      
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>
            </ScrollArea>
            </div>

    </div>
  );
}
