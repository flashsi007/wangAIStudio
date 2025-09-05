import { characterTitleStore } from './characterTitleStore';

export function useCharacterTitle() {

    const { characterTitle, setCharacterTitle ,getCharacterTitle} = characterTitleStore((state) => state);

    return {
        characterTitle,
        setCharacterTitle,
        getCharacterTitle
    } 
}
