"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";

interface OutlineFormProps {
  keyword: string;
  setKeyword: (value: string) => void;
  isOutlineShow: boolean;
  setIsOutlineShow: (value: boolean) => void;
  newOutlineTitle: string;
  setNewOutlineTitle: (value: string) => void;
  newOutlineDescription: string;
  setNewOutlineDescription: (value: string) => void;
  addOutline: () => Promise<void>;
  showExtract: () => void;
  handleExtract: () => Promise<void>;

  isExtract: boolean;
  setIsExtract: (value: boolean) => void;
}

export default function OutlineForm({
  keyword,
  setKeyword,
  isOutlineShow,
  setIsOutlineShow,
  handleExtract,
  isExtract,
  setIsExtract,
  newOutlineTitle,
  setNewOutlineTitle,
  newOutlineDescription,
  setNewOutlineDescription,
  addOutline,
  showExtract,
}: OutlineFormProps) {
  return (
    <>
      {/* 搜索框 */}
      <div  className=" flex items-center justify-end  w-full h-9 pr-8 mt-4 mb-4" >
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-96"
          type="search"
          placeholder="输入关键字搜索"
        />
      </div>

      {isExtract ? (
        <div className="flex items-center space-x-3 mb-4">
          <Button
            onClick={() => {
              setIsExtract(false);
            }}
            size={"sm"}
          >
             
            返回 
          </Button>
          <Button size={"sm"} onClick={handleExtract}>
            <Sparkles className="w-5 h-5 " />
            提取章节剧情
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-3 mb-4">
          <Button
            onClick={() => {
              setIsOutlineShow(true);
            }}
            size={"sm"}
          > 
            新建卷 
          </Button>

          <Button onClick={showExtract} size={"sm"}>
            <Sparkles className="w-5 h-5 " />
            智能提取章节剧情
          </Button>
        </div>
      )}

      {/* 新建卷表单 */}
      {isOutlineShow && (
        <div className="mb-4">
          <div>
            <div className="flex flex-col items-center justify-center mb-4">
              <Input
                value={newOutlineTitle}
                onChange={(e) => setNewOutlineTitle(e.target.value)}
                className="w-[90%]"
                placeholder="输入卷名"
              />

              <Textarea
                value={newOutlineDescription}
                onChange={(e) => setNewOutlineDescription(e.target.value)}
                className="w-[90%] mt-2"
                placeholder="大致剧情描述一下内容！"
              />

              <div className="mt-2 w-[90%] items-center space-x-2 flex pl-3">
                <Button size={"sm"} onClick={() => setIsOutlineShow(false)}>  取消  </Button>
                <Button size={"sm"} onClick={addOutline}> 确定  </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
