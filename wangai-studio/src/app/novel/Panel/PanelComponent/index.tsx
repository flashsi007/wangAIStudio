
import { useEffect, useMemo } from "react";
import { useRightMenu, useModelConfig, useNovel, usePrompter, useSidebarsidebarSize, IMinMap, useCheckCharacter } from "../../hooks"

import { PanelAi } from "../PanelAi"
import { PanelChapters } from "../PanelChapters"
import { PanelHistory } from "../PanelHistory";
import { PanelMinMap } from "../PanelMinMap"
import { PaenelPreview } from "../PaenelPreview"
import styles from "../../styles/novel.module.css"

import { ChevronLeft, ChevronRight } from 'lucide-react';
import useTheme from "@/hooks/useTheme";

import MindMapSection from "../PanelMinMap/MindMapSection";

import { useSocket } from '@/hooks/useSocket'

import { htmlToText } from 'html-to-text'
// 提取纯文本内容的辅助函数
const extractText = (html: string) => {
    const plainText = htmlToText(html, {
        wordwrap: false, // 禁用自动换行
        preserveNewlines: false // 不保留换行符
    })
    return plainText
};



enum stutas {
    init = 0,
    openPanelAi = 1,
    openPanelHistory = 2,
    openPanelMinMap = 3,
    openPanelChapters = 4,
}

export function PanelComponent() {
    const { theme } = useTheme();
    const style = useMemo(() => theme, [theme]);
    const { IsShowCharacter, stShowCharacter } = useCheckCharacter()
    const { submitTask, } = useSocket()
    const { menu, clearMenu } = useRightMenu()
    const { isShowMindmap, mindmap, mindmapList,
        mindmapChapters, userId, character, getMindmapList
        , setIsShowMindmap, setMindmap } = useNovel()
    const { modelConfig } = useModelConfig()
    const { prompterList } = usePrompter()
    const { setsidebarSize, sidebarSize } = useSidebarsidebarSize()


    const onChangePanelMinMap = (data: IMinMap) => {
        // setMindmapChapters(data) 
        let params = {
            id: data._id,
            userId: userId,
            title: extractText(data.content.data.text),
            novelId: data.novelId,
            parentId: data.parentId,
            content: data.content,
        }

        submitTask("updataMinimap", params);

    }


    const closePanel = () => {
        setsidebarSize(0)
        setIsShowMindmap(false)
        stShowCharacter(false)

        clearMenu()
    }




    const fullScreenPanel = () => {
        setsidebarSize(100)
    }
    const renderContent = () => {
        switch (menu?.key) {
            case '1':
                return (
                    <div className='flex w-full  justify-end relative'>
                        <div onClick={() => closePanel()}
                            className={` h-screen flex justify-center items-center  `}
                            style={{ borderRight: '1px solid #e5e5e5' }}>
                            <div className={`${styles.IconBox}`}>
                                <ChevronRight />
                            </div>
                        </div>
                        <PanelAi />
                    </div>
                )
            case '2':
                return (
                    <div className='flex w-full  justify-end relative'>
                        <div
                            onClick={() => closePanel()}
                            className={` h-screen flex justify-center items-center  `}
                            style={{ borderRight: '1px solid #e5e5e5' }}>
                            <div className={`${styles.IconBox}`}>
                                <ChevronRight />
                            </div>
                        </div>

                        {
                            IsShowCharacter && (<PaenelPreview />)
                        }

                        <PanelHistory />

                    </div>
                )
            case '3':
                return (
                    <div className='flex w-full  justify-end relative'>
                        {
                            sidebarSize == 100 && (
                                <div
                                    onClick={() => {
                                        setsidebarSize(55)
                                    }}
                                    className={` h-screen flex justify-center items-center  `}
                                    style={{ borderRight: '1px solid #e5e5e5' }}>
                                    <div className={`${styles.IconBox}`}>
                                        <ChevronRight />
                                    </div>
                                </div>
                            )
                        }

                        {
                            sidebarSize == 55 && (
                                <div
                                    onClick={() => closePanel()}
                                    className={` h-screen flex justify-center items-center  `}
                                    style={{ borderRight: '1px solid #e5e5e5' }}>
                                    <div className={`${styles.IconBox}`}>
                                        <ChevronRight />
                                    </div>
                                </div>
                            )

                        }

                        {
                            Number(sidebarSize) == 50 && (
                                <div
                                    onClick={() => fullScreenPanel()}
                                    className={` h-screen flex justify-center items-center  `}
                                    style={{ borderRight: '1px solid #e5e5e5' }}>
                                    <div className={`${styles.IconBox}`}>
                                        <ChevronLeft />
                                    </div>
                                </div>
                            )

                        }

                        {
                            isShowMindmap && (
                                <div className="h-screen"
                                    style={{
                                        width: sidebarSize == 100 ? "76%" : "70%",
                                        backgroundColor: style.mainColor,
                                    }}>
                                    <MindMapSection
                                        mindmap={mindmap}
                                        modelConfig={modelConfig}
                                        mentionData={mindmapList}
                                        setMindmapChapters={mindmapChapters}
                                        prompters={prompterList}
                                        onChangePanelMinMap={onChangePanelMinMap}
                                    />
                                </div>
                            )
                        }
                        <PanelMinMap />
                    </div>
                )
            case '4':
                return (<div className='flex w-full  justify-end relative'>
                    <div
                        onClick={() => closePanel()}
                        className={` h-screen flex justify-center items-center  `}
                        style={{ borderRight: '1px solid #e5e5e5' }}>
                        <div className={`${styles.IconBox}`}>
                            <ChevronRight />
                        </div>
                    </div>
                    <PanelChapters />
                </div>)

            default:
                return null
        }
    }


    useEffect(() => {
        return () => {

            closePanel()
        }
    }, [])
    return renderContent()
}