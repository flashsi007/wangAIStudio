
import useWordCount from './wordCountStore'

export  function useWordCountHook() {
    const { words, paragraphs, setWords, setParagraphs } = useWordCount()

    return {
        words,
        paragraphs,
        setWords,
        setParagraphs,
    }
}