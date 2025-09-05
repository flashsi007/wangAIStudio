import { create } from 'zustand'
import {  devtools } from 'zustand/middleware'

interface WordCountState {
    words: number       // 字数
    paragraphs: number  // 段落数
}

interface WordCountActions {
    setWords: (words: number) => void
    setParagraphs: (paragraphs: number) => void
    getWordCount: () => number
    getParagraphs: () => number
}

type WordCountStore = WordCountState & WordCountActions

/**
 * 已帮你顺手改成小写 `getParagraphs`
 * 如需持久化，打开 persist(...) 即可
 */
const useWordCount = create<WordCountStore>()(
    devtools(
        /* 想要持久化就把下面这一行注释解开 */
        // persist(
        (set, get) => ({
            words: 0,
            paragraphs: 0,

            setWords: (words: number) => set({ words }),
            setParagraphs: (paragraphs: number) => set({ paragraphs }),
            getWordCount: () => get().words,
            getParagraphs: () => get().paragraphs,
        }),
        /* persist 的第二个参数
        {
          name: 'word-count-store', // localStorage key
        }
        */
        // )
    )
)

export default useWordCount