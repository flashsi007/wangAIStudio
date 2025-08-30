
import { htmlToText } from 'html-to-text'
import { useUserStore } from '@/store/useUserInfo'
import { useParams } from 'next/navigation';
import { useMindmapState, useIsShowMindmap } from './novelStore';
import type { createCharacterProps } from "@/app/api"
import { useCharacterStore, useIsShowCharacterStore } from "./useCharacterStore"

import {
    getChapterById,
    updateCharacter,
    getByIdNovelInfo,
    getAllCharacter,
    createCharacter,
    deleteCharacterById,
    chatStream,
} from "@/app/api"
import {
    useNovelStore,
    useMindmapmindmapChaptersStore,
    MindmapChaptersState,
    useMindmapStore
} from './novelStore';

import { useModelConfigStore } from "../useModelConfig/modelConfigStore"
import { IMinMap, NovelResponse } from "./novelType"
import { generateTreeWithRemark } from "@/app/utils"


// 提取纯文本内容的辅助函数
const extractText = (html: string) => {
    const plainText = htmlToText(html, {
        wordwrap: false, // 禁用自动换行
        preserveNewlines: false // 不保留换行符
    })
    return plainText
};

type TreeNode = {
    data: { text: string };
    children: TreeNode[];
};

function formatText(node: TreeNode): void {
    node.data.text = extractText(node.data.text)
    node.children.forEach(formatText);
}




export function useNovel() {

    const { id } = useParams();
    const { getUserId, userInfo } = useUserStore()
    const novelId = id as string
    const userId = getUserId()

    const setMindmap = useMindmapState((s) => s.setMindmap)
    const mindmap = useMindmapState((s) => s.mindmap)
    const isShowMindmap = useIsShowMindmap((s) => s.isShowMindmap)
    const setIsShowMindmap = useIsShowMindmap((s) => s.setMindmap)

    const novelInfo = useNovelStore((s) => s.novelInfo);
    const setNovelInfo = useNovelStore((s) => s.setNovelInfo);
    const mindmapChapters = useMindmapmindmapChaptersStore((s: MindmapChaptersState) => s.mindmapChapters);
    const setMindmapChapters = useMindmapmindmapChaptersStore((s: MindmapChaptersState) => s.setmindmapChapters);

    const setCharacter = useCharacterStore((s) => s.setCharacter);
    const character = useCharacterStore((s) => s.character);
    const clearCharacter = useCharacterStore((s) => s.clearCharacter);

    const isShowCharacter = useIsShowCharacterStore((s) => s.isShowCharacter);
    const setIsShowCharacter = useIsShowCharacterStore((s) => s.setIsShowCharacter);

    const mindmapList = useMindmapStore((s) => s.mindmapList);
    const setMindmapList = useMindmapStore((s) => s.setmindmapList);
    const { modelConfig, setModelConfig } = useModelConfigStore()

    // const modelConfig =  modelConfigStore((s)=>s)


    const getMindmapChapter = async () => {
        // @ts-ignore
        const { data } = await getAllCharacter(userId, novelId, 'chapter')
        let chapterlist: Array<any> = []
        if (data) chapterlist = data

        let mindmap: any = []
        // @ts-ignore
        const result = await getAllCharacter(userId, novelId, 'mindmap')
        // @ts-ignore
        if (result.status == "success") mindmap = result.data
        mindmap.forEach((item: any) => {
            formatText(item.content)
        })
        setMindmapList(mindmap)

        return mindmap.concat(chapterlist)
    }

    const getNovelInfo = async () => {
        let params = {
            id: novelId,
            userId: userId || ""
        }
        let { data } = await getByIdNovelInfo(params) as { data: NovelResponse }
        setNovelInfo(data)

        let list = await getMindmapChapter()
        setMindmapChapters(list)
    }

    const editCharacter = async (data: any) => {
        let result = await updateCharacter({ userId, novelId, ...data })
        // @ts-ignore
        if (result.status == "success") {
            await getNovelInfo()
        }
    }


    const addMindmap = async (title: string) => {
        let params: createCharacterProps = {
            novelId,
            userId: userId as string,
            title,
            type: "mindmap",
            parentId: novelId,
            content: {
                data: {
                    text: `${title}`,
                },
                children: [],
            },
        }
        let result = await createCharacter(params)
        // @ts-ignore
        if (result.status == "success") {
            await getMindmapList()
           await getNovelInfo()
        }
    }

    const importMarkdownMindmap = async (markdown: string) => {

        const content: any = generateTreeWithRemark(markdown)
        let title = extractText(content.data.text)

        let params: createCharacterProps = {
            novelId,
            userId: userId as string,
            title,
            type: "mindmap",
            parentId: novelId,
            content: content,
        }
        let result = await createCharacter(params)
        // @ts-ignore
        if (result.status == "success") {
            await getMindmapList()
             await getNovelInfo()
        }

    }

    const deleteMindmap = async (id: string) => {
        let params = {
            id,
            novelId,
            userId: userId as string,
        }
        let result = await deleteCharacterById(params);
        // @ts-ignore
        if (result.status == "success") {
            await getMindmapList()
        }

    }

    const getMindmapList = async () => {
        // @ts-ignore
        const result = await getAllCharacter(userId, novelId, 'mindmap')
        // @ts-ignore
        if (result.status == "success") {
            setMindmapList(result.data)
        }

    }


    const setCharacterInfo = async (id: string) => {
        const { data } = await getChapterById({ userId: userId as string, id })
        if (data && data.content) {
            setCharacter(data)
        }
    }

    const addCharacter = async (data: { title: string, parentId: string, type: string }) => {

        const result = await createCharacter({
            ...data, novelId, parentId: data.parentId, userId: userId as string
        })
        // @ts-ignore
        if (result.status == "success") {
            await getNovelInfo()
            return result.data
        }

    }


    const removeCharacter = async (id: string) => {
        let result = await deleteCharacterById({ userId: userId as string, id, novelId })
        // @ts-ignore
        if (result.status === "success") {
            if ((character && character._id === id) || (character && character.parentId === id)) {
                clearCharacter()
            }
            await getNovelInfo()
        }
        return { status: "success" }
    }



    const getCharacterInfo = async (id: string) => {
        const { data } = await getChapterById({ userId: userId as string, id })
        return data
    }

    const extractCharacterDesc = (message: string): Promise<string> => {
        let text = ""

        return new Promise((revolve, reject) => {

            chatStream({
                message,
                userId: userId as string,
                model: modelConfig.model,
                key: modelConfig.key,
                api: modelConfig.api,
                onData: (data: string) => {
                    text += data
                },
                onError: (error: string) => {
                    reject(error)
                },
                onComplete: () => {
                    revolve(text)
                }
            })


        })

    }

    return {
        mindmapList,
        novelInfo,
        mindmapChapters,
        novelId,
        userId,
        userInfo,
        mindmap,
        isShowMindmap,
        character,
        isShowCharacter,
        setCharacter,
        setIsShowCharacter,
        extractCharacterDesc,
        getCharacterInfo,
        removeCharacter,
        addCharacter,
        setCharacterInfo,
        getNovelInfo,
        editCharacter,
        importMarkdownMindmap,
        getMindmapList,
        addMindmap,
        deleteMindmap,
        setMindmap,
        setIsShowMindmap,
    }
}


