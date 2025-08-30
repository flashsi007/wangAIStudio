"use client";
import "@ant-design/v5-patch-for-react-19";

import { useNovel } from "../../hooks";
import styles from "./panelAi.module.css";

import { useState } from "react";
import AIInput from "@/components/AIInput";
import { useHv, useVw } from "@/hooks/useVwHv";
import { UserRound, Bot, Copy } from "lucide-react";

import useTheme from "@/hooks/useTheme";
import { ThemeTokens } from "@/app/config";
import { uuid } from "@/lib/utils";
import { Bubble, BubbleProps } from "@ant-design/x";
import { Button, message } from "antd";
import type { GetProp } from "antd";
import { chatStream } from "@/app/api";
import dynamic from "next/dynamic";
const Markdown = dynamic(
  () => import("@/components/Markdown").then((m) => m.Markdown),
  { ssr: false }
);
import { useModelConfig, usePrompter, useAIModels } from "../../hooks";

export function PanelAi() {
  const cardWidth = useVw(0.39);
  const cardHeight = useHv(0.92);

  const { model } = useAIModels()
  const { mindmapList, mindmapChapters } = useNovel();
  const { modelConfig } = useModelConfig();
  const { prompterList } = usePrompter();

  const { theme } = useTheme();
  const [style, setStyle] = useState<ThemeTokens>(theme);
  const [value, setValue] = useState("");

  // 对话
  const [messages, setMessages] = useState<(BubbleProps & { key: string })[]>(
    []
  );

  let loadingText = "正在思考中...";
  let aIChatKey = "";
  function buildBubbleData(text: string, role: "ai" | "user") {
    let key = uuid();
    if (role === "ai" || loadingText === text) aIChatKey = key;
    return {
      key,
      role,
      content: text,
      style: {
        maxWidth: cardWidth - 32,
      },
    };
  }

  const rolesAsObject: GetProp<typeof Bubble.List, "roles"> = {
    ai: {
      placement: "start",
      avatar: {
        icon: <Bot />,
        style: {
          background: "#fde3cf",
          color: "#900C3F",
        },
      },
      typing: { step: 5, interval: 20 },
      style: {
        maxWidth: 600,
      },
    },
    user: {
      placement: "end",
      avatar: {
        icon: <UserRound />,
        style: {
          background: "#fde3cf",
          color: "#900C3F",
        },
      },
    },
  };

  const submit = (text: string, selectedNode: any) => {
    if (!text || text.trim() === "") return;

    const list = [
      ...new Map(selectedNode.map((item: any) => [item.id, item])).values(),
    ];

    let related = "";
    for (let i = 0; i < list.length; i++) {
      let item: any = list[i];
      related += `<${item.title}>
                    ${item.content}
                 </${item.title}> \n`;
    }

    // 1. 生成全新数组
    let userMessage = buildBubbleData(text, "user");
    let aiMessage = buildBubbleData(loadingText, "ai");

    // 1. 生成全新数组
    setMessages((prev) => [...prev, userMessage, aiMessage]);

    let prompter = `
        <用户问题> 
          ${text}
        </用户问题>
        
          <AI回复>
            直接回答用户问题，不要出现 好的xxxx或者分析xxxx之类的词，这样会让人感到不舒服。
          </AI回复> 
            <关联内容>${related}</关联内容>
        `;
    AIChat(prompter);
  };

  // 执行 AI 聊天
  const AIChat = (message: string) => {


    chatStream({
      message,
      ...modelConfig,
      onData: (chunk: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.key === aIChatKey
              ? { ...m, content: (m.content as string) + `${chunk}\n` }
              : m
          )
        );
      },
      onError: (err: any) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.key === aIChatKey ? { ...m, content: "出错了，请重试" } : m
          )
        );
        aIChatKey = "";
      },
      onComplete: () => {
        aIChatKey = "";
      },
    });
  };

  const onInput = (text: string) => { };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);

      message.success("已复制到剪贴板");
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  };

  return (
    <div className="overflow-hidden" style={{ backgroundColor: style.backgroundImage ? "" : style.headerColor, }} >
      <div style={{ height: cardHeight, width: '38rem' }} className="mt-4 p-2 flex flex-col justify-between items-center" >
        <div className="overflow-hidden p-2   w-full h-full">
          <div className="w-full h-full overflow-hidden rounded-lg  p-4">
            <Bubble.List
              style={{
                maxHeight: cardHeight - 260,
                paddingInline: 16,
              }}
              roles={rolesAsObject}
              // @ts-ignore
              items={messages?.map((item) => {
                if (item.role === "ai") {
                  return {
                    key: item.key,
                    role: item.role,
                    content: (
                      <Markdown
                        style={{
                          color: style.textColor,
                          backgroundColor: "rgba(209, 209, 209, 0.06)",
                        }}
                        text={item.content || ""}
                      />
                    ),
                    style: {
                      maxWidth: cardWidth - 32,
                      color: style.textColor,
                    },
                    footer: (
                      <div className="flex justify-end items-center ml-4">
                        <Button
                          type="text"
                          size="small"
                          onClick={() =>
                            copyToClipboard(item.content as string)
                          }
                          icon={<Copy className="w-4 h-4" />}
                        />
                      </div>
                    ),
                  };
                } else {
                  return {
                    key: item.key,
                    role: item.role,
                    content: (
                      <div style={{ color: style.textColor }}>
                        {item.content}
                      </div>
                    ),
                    style: {
                      maxWidth: cardWidth - 32,
                    },
                  };
                }
              })}
            />
          </div>
        </div>

        <div className="w-full p-2 space-y-3">
          {/* 操作指引 */}
          <div className="text-sm text-gray-600">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border rounded mr-1">
                  #
                </kbd>
                关联思维导图节点
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border rounded mr-1">
                  、
                </kbd>
                关联章节与思维导图
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border rounded mr-1">
                  /
                </kbd>
                导入提示词
              </span>
            </div>
          </div>
          {/* @ts-ignore */}
          <AIInput
            prompters={prompterList}
            setMindmapChapters={mindmapChapters}
            mentionData={mindmapList}
            value={value}
            onChange={onInput}
            onSend={submit}
            placeholder="输入内容开始创作..."
          />
        </div>
      </div>
    </div>
  );
}
