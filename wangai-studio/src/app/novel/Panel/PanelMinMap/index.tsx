import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
// 思维导图样式文件
import "./minmap.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Network,
  Trash2,
  FolderInput,
  SquareM,
  Send,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import useTheme from "@/hooks/useTheme";

import { IMinMap, useNovel, useSidebarsidebarSize } from "../../hooks";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LAYOUT_RATIO,
  LAYOUT_LIMIT,
  calcLayoutSize,
  calc,
  SCALE_DESKTOP,
  SCALE_MOBILE,
} from "@/app/config/layout";
import { getByIdNovelInfo } from "@/app/api";

// 优化：将MindmapList组件提取到外部，使用memo优化
interface MindmapListProps {
  mindmapData: IMinMap[];
  handleClick: (item: IMinMap) => void;
  handleDelete: (item: IMinMap) => void;
}
const MindmapList = memo(
  ({ mindmapData, handleClick, handleDelete }: MindmapListProps) => {
    if (!mindmapData || mindmapData.length === 0) return null;
    const { theme } = useTheme();
    const style = useMemo(() => theme, [theme]);

    return (
      <ScrollArea className="p-4" style={{ height: "84vh" }}>
        {mindmapData.map((item: IMinMap, index) => (
          <div key={item._id || index} className="rounded-md mb-4 p-2 "
            style={{ backgroundColor: style.backgroundImage ? "" : style.mainColor, }}
          >
            <div className="flex items-center justify-between ">
              <div className=" flex-1 flex items-center cursor-pointer space-x-4 ">
                <Network
                  onClick={() => handleClick(item)}
                  className="w-4 h-4"
                />
                <div
                  onClick={() => handleClick(item)}
                  style={{ minWidth: "9rem", maxWidth: "9rem" }}
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-sm "
                  title={item.title}
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {item.title}

                  </span>
                </div>

                <div className="flex justify-end items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="hover:bg-gray-100 bg-transparent rounded-lg shadow-none border-none"
                        variant="outline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="w-4 h-4 cursor-pointer" />
                          <span className="ml-2">删除</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    );
  }
);

interface MinMapProps {
  // 获取点击的节点数据
  onChangeMindmap?: (item: IMinMap) => void;
}

export function PanelMinMap() {
  const calculatedWidth = (calcLayoutSize(window.innerWidth, LAYOUT_RATIO.right, LAYOUT_LIMIT.right) - 20);

  const { mindmapList, importMarkdownMindmap, getMindmapList, addMindmap, deleteMindmap, setMindmap, setIsShowMindmap,getNovelInfo } = useNovel();
  const { theme } = useTheme();
  const [value, setValue] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [show, setShow] = useState(false);
  const [isShowMarkdown, setIsShowMarkdown] = useState(false);
  const style = useMemo(() => theme, [theme]);
  const { sidebarSize, setsidebarSize } = useSidebarsidebarSize()

  const handleClick = (item: IMinMap) => {
    setIsShowMindmap(true)
    getMindmapList()
    setMindmap(item)

    if (sidebarSize !== 100) {
      setsidebarSize(50)
    }


  };

  const handleDelete = async (item: IMinMap) => {
    await deleteMindmap(item._id);
  };

  const onAddMindMapImport = async () => {
    if (markdownText.trim() === "") return;
    await importMarkdownMindmap(markdownText);
    setMarkdownText("");
    getMindmapList();
    getNovelInfo()
    setIsShowMarkdown(false);
  };

  const openImport = () => {
    setIsShowMarkdown(true);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 500);
  };

  const onAddMindMap = async () => {
    if (value.trim() === "") return;

    await addMindmap(value);

    setShow(false);
    setValue("");
  };

  const openAddMindMap = () => {
    setShow(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };


  return (
    <div
      style={{
        width: calculatedWidth,
        //  transform: `translate(-20px,0px)`,
        backgroundColor: style.backgroundImage ? "" : style.rightColor,
      }}
      className="w-full h-screen z-50"
    >
      <div className="w-full flex items-center pl-2 mt-4 mb-4">
        <Button
          onClick={openAddMindMap}
          className="hover:bg-gray-100 bg-white border rounded-lg border-none cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span className="text-sm text-black">创建</span>
        </Button>
        <div className="ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FolderInput className="w-4 h-4 text-black" />
                <span className="text-sm text-black"> 导入 </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              style={{ border: "none", background: "#fafafa" }}
            >
              <DropdownMenuItem>
                <div
                  onClick={() => openImport()}
                  className="flex items-center cursor-pointer"
                >
                  <SquareM className="w-4 h-4 cursor-pointer" />
                  <span className="ml-2">导入 Markdown</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {show && (
        <div className="w-full flex justify-center items-center pl-4 pr-4">
          <Input
            ref={inputRef}
            placeholder="请输入标题 按回车键创建"
            value={value}
            onBlur={() => {
              setValue("");
              setShow(false);
            }}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddMindMap();
              }
            }}
          />
        </div>
      )}

      {isShowMarkdown && (
        <div className="pr-4 pl-2">
          <Textarea
            ref={textareaRef}
            className="w-full h-40"
            placeholder="请输入 Markdown 内容"
            onChange={(e) => setMarkdownText(e.target.value)}
            value={markdownText}
          />

          <div className="flex mt-2 space-x-4">
            <Button
              onClick={() => {
                setMarkdownText("");
                setIsShowMarkdown(false);
              }}
              className="hover:bg-gray-100 bg-gray-100 rounded-lg shadow-none border-none cursor-pointer p-4"
              size={"xs"}
            >
              <X style={{ color: style.IconColor }} className="w-4 h-4" />
              <span className="text-sm text-black">取消</span>
            </Button>

            <Button
              onClick={() => onAddMindMapImport()}
              className="hover:bg-gray-100 bg-gray-100 rounded-lg shadow-none border-none cursor-pointer p-4"
              size={"xs"}
            >
              <Send style={{ color: style.IconColor }} className="w-4 h-4" />
              <span className="text-sm text-black">提交</span>
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden" style={{ maxWidth: "284px" }}>
        <MindmapList
          mindmapData={mindmapList}
          handleClick={handleClick}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}
