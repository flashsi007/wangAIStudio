import { getPrompterList } from '@/app/api';
import { useUserStore } from '@/store/useUserInfo'
import { usePrompterStore } from './prompterStore';
import { PrompterType } from './prompterType';
import { useState } from 'react';

export function usePrompter(){
 const { prompterList, setPrompterList } = usePrompterStore();
 const userId = useUserStore((state) => state.userInfo?.userId)


//  const [prompterList, setPrompterList] = useState<PrompterType[]>([]);

  const fetchPrompterList = async () => {
        const { data } = await getPrompterList({
            userId: userId,
            page: 1,
            pageSize: 1000,
        });

        setPrompterList(data);  
    };

    return {
        prompterList,
        fetchPrompterList,
    }
}