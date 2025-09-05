"use client";
import { LAYOUT_RATIO, LAYOUT_LIMIT, calcLayoutSize } from "@/app/config";
import styles from "./header.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { clearChatHistory } from "@/app/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useWordCountHook,
  useNovel,
  useAIModels,
  useCharacterTitle,
  useModelConfig,
} from "../../hooks";
import type { Model } from "../../hooks";
import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import { Input } from "@/components/ui/input";
import {
  X,
  Search,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Plus,
} from "lucide-react";
import { Toolbar } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/button";
import useTheme from "@/hooks/useTheme";
import { ThemeTokens } from "@/app/config";
import { useSocket } from "@/hooks/useSocket";
import { getCharacterKeywords } from "@/app/api";

import { message } from "antd";

interface PanelSearchProps {
  keyword: string;
  close?: () => void;
}

function PanelSearch({ keyword, close }: PanelSearchProps) {
  if (!keyword.trim()) return null;
  const { novelInfo, userId, setCharacter } = useNovel();
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setCharacterTitle } = useCharacterTitle();

  const fetchCharacterKeywords = async () => {
    try {
      setIsLoading(true);

      let result = await getCharacterKeywords({
        userId: userId as string,
        novelId: novelInfo?.novel._id || "",
        keyword,
      });

      // @ts-ignore
      if ((result.status = "success")) {
        // @ts-ignore
        let list = result.data.map((item) => {
          return {
            id: item._id,
            title: item.title,
            content: item.content.html,
          };
        });
        setChapters(result.data);
        setArticles(list);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  /* ---------- 工具 ---------- */
  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlight = (html: string, keyword: string) => {
    if (!keyword.trim()) return html;
    const reg = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
    return html.replace(reg, '<mark class="bg-yellow-300">$1</mark>');
  };

  const { theme } = useTheme();
  const [style, setStyle] = useState<ThemeTokens>(theme);

  /** 展开状态：key 为章节 id */
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    fetchCharacterKeywords();
  }, [keyword]);

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    const lowerKey = keyword.toLowerCase();

    // @ts-ignore
    let ch = articles
      .map((ch) => {
        // @ts-ignore
        const paragraphs = ch.content
          .split(/<\/?p>/gi)
          .map((p: string) => p.trim())
          .filter(Boolean);
        const matchedParagraphs = paragraphs.filter((p: string) =>
          p.toLowerCase().includes(lowerKey)
        );
        if (matchedParagraphs.length === 0) return null;

        return {
          // @ts-ignore
          ...ch,
          paragraphs: matchedParagraphs.map((p: string) =>
            highlight(p, keyword)
          ),
          count: matchedParagraphs.length,
        };
      })
      .filter(Boolean) as NonNullable<ReturnType<typeof articles.map>>[];
    return ch;
  }, [articles]);

  const handleClick = (id: string) => {
    // @ts-ignore`
    let data = chapters.filter((item) => item._id === id)[0] || null;
    setCharacter(data);
    // @ts-ignore`
    setCharacterTitle(data.title);
    if (close) close();
  };

  useEffect(() => {
    setStyle(theme);
  }, [theme]);

  return (
    <div
      className={`${styles.hideScrollbar} 
            border-2  rounderd-xl rounded-lg p-2 w-full
             max-h-80 z-[999]
            overflow-y-auto absolute top-12 left-0 `}
      style={{
        backgroundColor: theme.backgroundImage ? "" : theme.headerColor,
      }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoaderCircle
            className="w-6 h-6 animate-spin"
            style={{ color: style.textColor }}
          />
        </div>
      ) : (
        <div className={`w-full rounderd-xl space-y-2`}>
          {results.map((item: any) => {
            const isOpen = !!openMap[item.id];
            return (
              <div
                key={item.id}
                className="rounded-lg overflow-hidden border transition-all"
              >
                {/* 章节标题栏（点击区域） */}
                {/* @ts-ignore */}
                <button
                  onClick={() => toggle(item.id)}
                  style={{ backgroundColor: theme.mainColor }}
                  className="w-full flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                >
                  <h2
                    style={{ color: theme.textColor }}
                    className="text-base font-semibold"
                  >
                    {item.title}
                    <span className="ml-2 text-sm text-blue-600">
                      （共{item.count}处）
                    </span>
                  </h2>

                  {isOpen ? (
                    <ChevronUp
                      className="h-5 w-5"
                      style={{ color: style.IconColor }}
                    />
                  ) : (
                    <ChevronDown
                      className="h-5 w-5 "
                      style={{ color: style.IconColor }}
                    />
                  )}
                </button>

                {/* 展开内容 */}
                <div
                  style={{ backgroundColor: theme.mainColor }}
                  className={`overflow-hidden transition-[max-height] duration-300 ease-in-out 
                                    ${isOpen ? "max-h-[1000px]" : "max-h-0"}
                                    
                                    `}
                >
                  <div
                    className="px-4 pb-3 space-y-2 cursor-pointer"
                    onClick={() => handleClick(item.id)}
                  >
                    <ScrollArea className="h-[50vh]">
                      {/* @ts-ignore */}
                      {item.paragraphs.map((p, idx) => (
                        <p
                          key={idx}
                          className="text-sm py-2 leading-relaxed border-b border-gray-300 dark:border-neutral-700"
                          dangerouslySetInnerHTML={{
                            __html: `<span>• </span>${p}`,
                          }}
                        />
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            );
          })}

          {keyword.trim() && results.length === 0 && (
            <p className="text-center mt-10">未找到相关内容</p>
          )}
        </div>
      )}
    </div>
  );
}

export function PanelHeader() {
  const { theme } = useTheme();
  const style = useMemo(() => theme, [theme]);
  const { isConnected, isConnecting, reconnectAttempts } = useSocket();
const {setModelConfig} = useModelConfig()
  const { userId } = useNovel();
  const { model, models, setModel} = useAIModels();
  const router = useRouter();

  const { words, paragraphs } = useWordCountHook();

  const [showDown, setShowDown] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handlecLearChatHistory = async (userId: string) => {
    let result = await clearChatHistory(userId);
    // @ts-ignore
    if (result.status == "success") {
      message.success("清除上下文成功");
    }
  };

  const handleChangeModel = (id: string) => {
    // @ts-ignore
    const data: Model = models.find((item) => item.id == id);

    console.log('*--------------',data);
    
    setModel(data);
    setModelConfig({
      userId:userId||"",
      model: data.model,
      key:data.key,
      api: data.api,
    })
  };

  const handlePushModel = () => router.push(`/pushModel`);

  const inputFocus = () => {
    setShowDown(true);
  };

  const inputonBlur = () => {
    if (searchValue) return;
    setShowDown(false);
  };

  return (
    <header
      className={`${styles.header} h-full`}
      style={{
        backgroundColor: style.backgroundImage ? "" : style.headerColor,
      }}
    >
      {/* 左栏：移动端隐藏 */}
      <aside className={`${styles.left}`}>
        <div className="flex items-center px-4 py-3">
          {/* Socket连接状态 */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnecting
                  ? "bg-green-500"
                  : isConnecting
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-600">
              {isConnected
                ? "已连接"
                : isConnecting
                ? "连接中..."
                : reconnectAttempts > 0
                ? `重连中 (${reconnectAttempts}/10)`
                : "未连接"}
            </span>
          </div>
          <Toolbar.Divider />
          {/* 字数统计 */}
          <div className="flex flex-col   text-sm">
            <div className="text-left">
              段落:
              <span className="text-gray-600 font-black">{paragraphs}</span>
            </div>

            <div className="text-left">
              字数: <span className="text-gray-600 font-black">{words}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 中间：占满 */}
      <main className={`${styles.main}`}>
        <div className="w-full flex justify-center items-center ">
          <div className="sm:w-96 md:w-full lg:w-full max-w-2xl relative">
            <div className="flex items-center justify-between mt-1">
              <Search className="w-5 h-5 absolute left-2" />
              <Input  style={{  backgroundColor: theme.mainColor, }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={inputFocus}
                onBlur={inputonBlur}
                type="search"
                placeholder="搜索全书"
                className="border-2 shadow-orange-200 border-gray-300 pl-10"
              />
            </div>

            {searchValue && showDown && (
              <PanelSearch
                close={() => setSearchValue("")}
                keyword={searchValue}
              />
            )}
          </div>
        </div>
      </main>

      {/* 右栏：移动端隐藏 */}
      <aside className={`${styles.right}`}>
        <div
          className="h-full flex items-center justify-between"
          title="选择AI模型"
        >
          <div className="flex-1 flex justify-end items-center space-x-2">
            <div>
              <Button
                size={"sm"}
                onClick={() => handlecLearChatHistory(userId as string)}
                className="cursor-pointer"
                style={{ backgroundColor: theme.SelectButtonColor }}
              >
                <X className="w-5 h-5" style={{ color: theme.textColor }} />
                <span style={{ color: theme.textColor }}>清除上下文</span>
              </Button>
            </div>
            <div className="rounded-lg">
              <Select
                onValueChange={(value: any) => handleChangeModel(value)}
                defaultValue={model.id}
              >
                <SelectTrigger
                  style={{
                    backgroundColor: theme.mainColor,
                  }}
                  className="w-36"
                >
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent
                  style={{ border: "none", backgroundColor: theme.mainColor }}
                >
                  {models.map((item: any, index) => (
                    // @ts-ignore
                    <SelectItem key={index} value={item.id}>
                      <div>
                        <div>{item.modelName}</div>
                      </div>
                    </SelectItem>
                  ))}

                  <div
                    onClick={handlePushModel}
                    className="flex items-center cursor-pointer border-t-1 border-t-gray-500 py-2"
                  >
                    <Plus className="w-5 h-5 text-gray-500 mr-2" />
                    <span> 新增模型 </span>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/*  */}
          <div className="w-12 h-2 rounded-full"></div>
        </div>
      </aside>
    </header>
  );
}
