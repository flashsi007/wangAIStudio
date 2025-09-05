"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PencilLine } from "lucide-react";
import { ThemeTokens } from "@/app/config";

interface ChapterListProps {
  novels: any[];
  keyword: string;
  editChapter: boolean;
  setEditChapter: (value: boolean) => void;
  keywordFilter: string;
  setKeywordFilter: (value: string) => void;
  editChapterShowChil: boolean;
  setEditChapterShowChil: (value: boolean) => void;
  keywordChilId: string;
  setKeywordChilId: (value: string) => void;
  editChapterTitle: string;
  setEditChapterTitle: (value: string) => void;
  editChapterDescription: string;
  setEditChapterDescription: (value: string) => void;
  editChapterTitleChil: string;
  setEditChapterTitleChil: (value: string) => void;
  editChapterDescriptionChil: string;
  setEditChapterDescriptionChil: (value: string) => void;
  newChapterTitle: string;
  setNewChapterTitle: (value: string) => void;
  newChapterDescription: string;
  setNewChapterDescription: (value: string) => void;
  isChapterShow: any;
  setIsChapterShow: (value: any) => void;
  isChapterShowChil: any;
  setIsChapterShowChil: (value: any) => void;
  editOutlineTitle: string;
  setEditOutlineTitle: (value: string) => void;
  editOutlineDescription: string;
  setEditOutlineDescription: (value: string) => void;
  updateOutline: (params: any) => Promise<void>;
  deleteOutline: (id: string) => Promise<void>;
  addChapter: (params: any) => Promise<void>;
  updateChapter: (params: any) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  addChapterChil: (params: any) => Promise<void>;
  updateChapterChil: (params: any) => Promise<void>;
  deleteChapterChil: (id: string) => Promise<void>;
  handleSevaButton: (params: {
    id: string;
    title: string;
    description: string;
  }) => Promise<void>;
  handleDouButton: (item: any) => void;
  handlePlusChapter: (item: any) => void;
  deleteCharacter: (id: string) => Promise<void>;
  handleSubmitChapter: () => Promise<void>;
  handleDouChilButton: (parentId: string, item: any) => void;
  handleClick: (item: any) => void;
  style: ThemeTokens;
}

export default function ChapterList({
  novels,
  editChapter,
  keywordFilter,
  setKeywordFilter,
  editChapterShowChil,
  keywordChilId,
  editChapterTitle,
  setEditChapterTitle,
  editChapterDescription,
  setEditChapterDescription,
  editChapterTitleChil,
  setEditChapterTitleChil,
  editChapterDescriptionChil,
  setEditChapterDescriptionChil,
  newChapterTitle,
  setNewChapterTitle,
  newChapterDescription,
  setNewChapterDescription,

  handleSevaButton,
  handleDouButton,
  handlePlusChapter,
  deleteCharacter,
  handleSubmitChapter,
  handleDouChilButton,
  handleClick,
  style,
}: ChapterListProps) {
  if (novels) {
    return (
      <ScrollArea className="h-[75vh] sm:h-[80vh]">
        {
          // @ts-ignore
          novels.map((chapters, index) => (
            <div key={index}>
              <div
                className="rounded-lg transition-all mb-4 mr-6"
                style={{
                  backgroundColor: style.backgroundImage ? `` : style.mainColor,
                }}
              >
                <div>
                  {editChapter && keywordFilter === chapters._id ? (
                    <div
                      style={{ width: "100%" }}
                      className="flex items-center justify-between p-4 space-x-2"
                    >
                      <Input
                        value={editChapterTitle}
                        onChange={(e) => setEditChapterTitle(e.target.value)}
                      />
                      <Button
                        onClick={() =>
                          handleSevaButton({
                            id: chapters._id,
                            title: editChapterTitle,
                            description: editChapterDescription,
                          })
                        }
                      >
                       保存 
                      </Button>
                    </div>
                  ) : (
                    <div
                      style={{ padding: "0.5rem", width: "100%" }}
                      className="flex items-center justify-between p-4"
                    >
                      <h2
                        onDoubleClick={() => handleDouButton(chapters)}
                        title={chapters.title}
                        style={{ width: "100%" }}
                        className=" text-lg font-bold overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                      >
                        {chapters.title}
                      </h2>

                      <div className="flex items-center">
                        <div
                          className="hover:bg-gray-100 rounded-lg p-2 cursor-pointer"
                          onClick={() => handlePlusChapter(chapters)}
                        >
                          <Plus
                            className="w-4 h-4"
                            style={{ color: style.IconColor }}
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="
                             hover:bg-gray-100 
                             bg-transparent 
                             rounded-lg shadow-none
                             p-2 mr-1 border-none"
                              variant="outline"
                            >
                              <Trash2
                                className="w-4 h-4 "
                                style={{ color: style.IconColor }}
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuItem>
                              <div
                                className="flex items-center cursor-pointer"
                                onClick={() => deleteCharacter(chapters._id)}
                              >
                                <Trash2 className="w-4 h-4 cursor-pointer" />
                                <span className="ml-2">删除</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}

                  {
                    // 创建章节弹窗
                    !editChapterShowChil &&
                      !editChapter &&
                      keywordFilter === chapters._id && (
                        <div className="flex flex-col items-center justify-center mb-4">
                          <Input
                            value={newChapterTitle}
                            onChange={(e) => setNewChapterTitle(e.target.value)}
                            className="w-[90%]"
                            placeholder="输入章节名"
                          />

                          <Textarea
                            value={newChapterDescription}
                            onChange={(e) =>
                              setNewChapterDescription(e.target.value)
                            }
                            className="w-[90%] mt-2"
                            placeholder="大致剧情描述一下内容！"
                          />

                          <div className="mt-2 w-[90%] items-center space-x-2 flex ">
                            <Button
                              size={"sm"}
                              onClick={() => setKeywordFilter("")}
                            > 取消  </Button>
                            <Button size={"sm"} onClick={handleSubmitChapter}> 确定 </Button>
                          </div>
                        </div>
                      )
                  }

                  {
                    // 编辑卷描述
                    editChapter && keywordFilter === chapters._id ? (
                      <div className="flex flex-col items-center justify-center mb-4">
                        <Textarea
                          value={editChapterDescription}
                          onChange={(e) =>
                            setEditChapterDescription(e.target.value)
                          }
                          className="w-[90%] mt-2"
                          placeholder="大致剧情描述一下内容！"
                        />
                      </div>
                    ) : (
                      <div
                        title={chapters.description}
                        className="pl-4 pr-4 w-full text-sm  text-ellipsis line-clamp-3 cursor-pointer"
                      >
                        <span>{chapters.description}</span>
                      </div>
                    )
                  }

                  <div className="p-1">
                    {
                      // @ts-ignore
                      chapters.children.map((item, j) => (
                        <div key={j} className="mb-4" style={{ width: "100%" }}>
                          {keywordChilId === item._id ? (
                            <div className="flex items-center justify-between p-4 space-x-2">
                              <Input
                                className="w-[80%]"
                                value={editChapterTitleChil}
                                onChange={(e) =>
                                  setEditChapterTitleChil(e.target.value)
                                }
                              />
                              <Button
                                onClick={() =>
                                  handleSevaButton({
                                    id: item._id,
                                    title: editChapterTitleChil,
                                    description: editChapterDescriptionChil,
                                  })
                                }
                              >
                                 
                                保存 
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center justify-between p-4"
                              style={{ width: "100%" }}
                            >
                              <h3
                                style={{ width: "100%" }}
                                onDoubleClick={() =>
                                  handleDouChilButton(chapters._id, item)
                                }
                                onClick={() => handleClick(item)}
                                title={item.title}
                                className="text-lg font-bold overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                              >
                                {item.title}
                              </h3>

                              <div className="flex items-center space-x-2">
                                <div
                                  className="hover:bg-gray-100 rounded-lg p-2 cursor-pointer"
                                  onClick={() =>
                                    handleDouChilButton(chapters._id, item)
                                  }
                                >
                                  <PencilLine
                                    className="w-4 h-4"
                                    style={{ color: style.IconColor }}
                                  />
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      className="
                                     hover:bg-gray-100 
                                     bg-transparent 
                                     rounded-lg shadow-none
                                     p-2 mr-1 border-none"
                                      variant="outline"
                                    >
                                      <Trash2
                                        className="w-4 h-4 "
                                        style={{ color: style.IconColor }}
                                      />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-56">
                                    <DropdownMenuItem>
                                      <div
                                        className="flex items-center cursor-pointer"
                                        onClick={() =>
                                          deleteCharacter(item._id)
                                        }
                                      >
                                        <Trash2 className="w-4 h-4 cursor-pointer" />
                                        <span className="ml-2">删除</span>
                                      </div>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}

                          {
                            // 编辑章节描述
                            keywordChilId === item._id ? (
                              <div className="flex flex-col items-center justify-center mb-4">
                                <Textarea
                                  value={editChapterDescriptionChil}
                                  onChange={(e) =>
                                    setEditChapterDescriptionChil(
                                      e.target.value
                                    )
                                  }
                                  className="w-[90%] mt-2"
                                  placeholder="大致剧情描述一下内容！"
                                />
                              </div>
                            ) : (
                              <div
                                title={item.description}
                                className="pl-8 pr-8   w-full text-sm h-10 text-ellipsis line-clamp-3 cursor-pointer"
                              >
                                <span>{item.description}</span>
                              </div>
                            )
                          }
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </ScrollArea>
    );
  }
  return null;
}
