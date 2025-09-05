"use client";
import '@ant-design/v5-patch-for-react-19';
import {Layout,Header,Sidebar,Main,LayoutContainer} from "../layout";
import Container from "@/components/container"
import { useState,useEffect, useMemo } from "react";

 import { ScrollArea } from "@/components/ui/scroll-area";
 import { BlockEditor } from "@/components/Editor";

/************* HOOKS *********/
import { 
  useSidebarsidebarSize,
  useNovel,
  usePrompter,
  useModelConfig
 } from "../hooks"
 
import {useWordCountHook,useEditorHistory,useCharacterTitle} from '../hooks'

import useTheme from "@/hooks/useTheme";
import { ThemeTokens } from "@/app/config";
import { useSocket } from '@/hooks/useSocket';
import { useWidthById } from '@/hooks/useVwHv';

/** ---------------------- Panel -------------------------- **/
import { 
    RightLayout,
    PanelHeader,
    PanelComponent, 
} from "../Panel" 

 

/**
 * 防抖函数 - 减少函数执行频率
 */
const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};


function MainContainer (){   
     const {modelConfig} = useModelConfig()
    const  {character,mindmapChapters,mindmapList,novelId,userId,userInfo} = useNovel()

    const { theme } = useTheme()
    const [style, setStyle] = useState<ThemeTokens>(theme)

 
   

    const { setParagraphs, setWords } = useWordCountHook()
    const { saveVersion } = useEditorHistory();
    const { setCharacterTitle } = useCharacterTitle();
    const { submitTask } = useSocket();
    const { prompterList} = usePrompter() 
    
      const article = useMemo(() => {
          if (!character) return false;  
          return character;
        }, [character]);




      const saveEditorState = (doc: { json: any, text: string, html: string, paragraphs: number, words: number })=>{
        setParagraphs(doc.paragraphs)
        setWords(doc.words)

        let id = character && character._id;
        let title = "1.0.0";


        if (
            (doc.json.content && doc.json.content[0] && doc.json.content[0].attrs) &&
            doc.json.content[0].attrs.level == 1
          ) {
            title = doc.json.content[0].content[0].text;
          }

          let params = {
                id,
                novelId,
                userId: userId,
                title,
                words: doc.words,
                paragraphs: doc.paragraphs,
                type: "chapter",
                content: {
                  html: doc.html
                },
              };

                if (doc.json.content[doc.json.content.length - 1].content) {
                    // 处理版本控制
                    const state = {
                      doc: doc.json,  // 文档内容 (Tiptap  格式)
                      branch: novelId,  // 分支名
                      history: {
                        userName: userInfo?.userName || "匿名用户",
                        title: title,
                        describe: doc.json.content[doc.json.content.length - 1].content[0].text,
                      }
                    };
                    // @ts-ignore
                    saveVersion(state);
                    setCharacterTitle(title);
                  } 
                 submitTask("updateDocument", params); 

      }

/**
   * @description 编辑器内容变化时触发
   */
  const onEditorChange = useMemo(() => debounce(saveEditorState, 3000), [saveEditorState]);

  
   return <Main style={{backgroundColor: style.backgroundImage ? "": style.mainColor}}> 
          <div id="main-container" className='w-full m-auto'>
            <ScrollArea style={{height:'90vh'}}>

              {/* @ts-ignore */}
           <BlockEditor content={article.content.html}
             setMindmapChapters={mindmapChapters}
             prompters={prompterList}
             onStateChange={onEditorChange}
             mentionData={mindmapList}
             modelConfig={modelConfig}
           /> 
            </ScrollArea>
          </div>
        </Main> 

}


export default  function ArticlePage () {
    const  {getNovelInfo,character,getMindmapList} = useNovel()
    const {sidebarSize,setsidebarSize} = useSidebarsidebarSize()
    const {fetchPrompterList} = usePrompter()
    const { theme } = useTheme()
    const [style, setStyle] = useState<ThemeTokens>(theme)
    const { connect, disconnect, submitTask, onTaskCompleted, isConnected } = useSocket()

   
      // 统一的任务完成监听器
    useEffect(() => {
        // 确保Socket已连接后再注册事件监听器
        if (!isConnected) {
            return;
        }

        const cleanup = onTaskCompleted(async (completed) => {
            // 根据任务类型处理不同的完成逻辑
            if (completed?.taskType === 'updataMinimap') {
                // 可以在这里添加minimap更新完成后的处理逻辑 
                console.log('------------ 根据任务类型处理不同的完成逻辑 getMindmapList ---------');
                console.log(completed );
                getMindmapList()
                getNovelInfo()
                 console.log('------------ ----------------------- ---------');
               
            }
        });


        return () => { // 组件卸载时清理事件监听器


            cleanup();
        };
    }, [onTaskCompleted, isConnected]);


  const initData = async ()=>{
       setsidebarSize(2.5)
      await getNovelInfo()
      await fetchPrompterList()
  }

  
        // 初始化Socket连接和角色信息
    useEffect(() => {
      initData()
        // 建立Socket连接
        connect();
 
        return () => {  // 组件卸载时清理Socket连接
           
            disconnect()
        }
    }, [])
     
     return (
          <Container>
            <Layout> 
             <Header>
                    <PanelHeader />
                </Header> 
                <LayoutContainer style={{
                    backgroundColor: style.backgroundImage ? "": style.mainColor,
                }}>  
                 
                 {character && sidebarSize !==100 && <MainContainer />} 
                <Sidebar width={sidebarSize} className='relative'>
                    <div  className='flex w-full  justify-end ' style={{height:"100vh"}}> 
                     <PanelComponent />
                     <div style={{width:"3rem", height:"2rem"}} className='占位 '>123123</div>  
                    </div>  
                  <RightLayout /> 
                </Sidebar>
            </LayoutContainer>
            </Layout>
          </Container>
     )

 
 

}