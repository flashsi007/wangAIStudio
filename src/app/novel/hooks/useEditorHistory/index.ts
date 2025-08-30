import { useHistoryStore,useHistoryCharacter,useHistoryOptions} from './historyStore';
import {useCharacterTitle}  from '../useCharacterTitle';
export  function useEditorHistory() {
    
 const saveVersion = useHistoryStore(state => state.saveVersion);
 const getVersionsByBranch = useHistoryStore(state => state.getVersionsByBranch);
 const getAllHistory = useHistoryStore(state => state.getAllHistory);
 
 const versions = useHistoryCharacter((s)=>s.versions);
 const version = useHistoryCharacter((s)=>s.version);
 const setVersion = useHistoryCharacter((s)=>s.setVersion);
 const setVersions = useHistoryCharacter((s)=>s.setVersions);
 const options = useHistoryOptions((s)=>s.options);
 const setOptions = useHistoryOptions((s)=>s.setOptions);


    return {
       
        versions,
        version,
        options,
        saveVersion,
        setOptions,
        setVersions,
        setVersion,
        getVersionsByBranch,
        getAllHistory,

    }

}