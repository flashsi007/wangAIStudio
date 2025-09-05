import {useCharacterStore,ShowCharacterStore} from "./useCharacterStore" 


export   function useCheckCharacter() {
    const { getCheckCharacter, setCheckCharacter } = useCharacterStore();
   const IsShowCharacter = ShowCharacterStore((s)=>s.IsShowCharacter)
    const stShowCharacter = ShowCharacterStore((s)=>s.setIsShowCharacter)
    return {
        IsShowCharacter,
        stShowCharacter,
        checkCharacter: getCheckCharacter(),
        getCheckCharacter,
        setCheckCharacter,
    };

}