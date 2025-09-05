"use client"
import React from 'react'; 
import MinMap from "@/components/MinMap";
import type { IMinMap } from "../../hooks";
import type { ModelConfig } from "@/app/api";


interface MindMapSectionProps { 
  mindmap?: IMinMap | null;
  mentionData?: Array<IMinMap>;
  setMindmapChapters?: Array<any>;
  prompters?: Array<any>;
  modelConfig: ModelConfig; 
  onChangePanelMinMap: (data: IMinMap) => void;
}

export default function MindMapSection({  
      mindmap, 
      modelConfig, 
      mentionData, 
      setMindmapChapters,  
      prompters,   
      onChangePanelMinMap
     }: MindMapSectionProps){

  if (mindmap == null)   return null;



  return (
    <div className='min-w-64' > 
    <MinMap
        prompters={prompters}
        mindmap={mindmap}
        setMindmapChapters={setMindmapChapters}
        mentionData={mentionData}
        dataChange={onChangePanelMinMap}
        modelConfig={modelConfig}
      />  

    </div>
  )


}