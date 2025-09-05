"use client";
import React, { useEffect, useMemo, useState } from "react";

/*****  *********/

import ExtractList from "./ExtractList";
import ChapterList from "./ChapterList";
import OutlineForm from "./OutlineForm";

import useTheme from "@/hooks/useTheme";
import { ThemeTokens } from "@/app/config";

import { useNovel, useCharacterTitle ,useWordCountHook,useEditorHistory} from "../../hooks";

interface ExtractChapters {
  _id: string;
  novelId: string;
  userId: string;
  parentId: string;
  type: string;
  title: string;
  description: string;
  loading: boolean;
  stats?: {
    wordCount: number;
  };
  children?: ExtractChapters[];
}

/**
 * 深度优先递归设置 loading
 * @param tree  原始树（或子树）
 * @param id    要匹配的 _id
 * @param value loading 的新值
 * @returns     新的树结构（immutable）
 */
function setLoading(
  tree: ExtractChapters[],
  id: string,
  value: boolean
): ExtractChapters[] {
  return tree.map((node) => {
    if (node._id === id) {
      // 找到目标：复制节点并改 loading
      return { ...node, loading: value };
    }

    if (node.children && node.children.length > 0) {
      // 递归处理子节点
      const newChildren = setLoading(node.children, id, value);
      // 只有当子树真的发生变化时才复制当前节点
      if (newChildren !== node.children) {
        return { ...node, children: newChildren };
      }
    }

    // 无变化直接返回原节点
    return node;
  });
}

function setDescription(
  tree: ExtractChapters[],
  id: string,
  value: string
): ExtractChapters[] {
  return tree.map((node) => {
    if (node._id === id) {
      // 找到目标：复制节点并改
      node.description = value;
      return { ...node, description: value };
    }

    if (node.children && node.children.length > 0) {
      // 递归处理子节点
      const newChildren = setDescription(node.children, id, value);
      // 只有当子树真的发生变化时才复制当前节点
      if (newChildren !== node.children) {
        return { ...node, children: newChildren };
      }
    }

    // 无变化直接返回原节点
    return node;
  });
}

/**
 * 模糊查找：只要 title 里包含关键字即可（忽略大小写）
 * 返回结果结构：
 *   1. 命中子节点 -> 只把父节点拷一份，并只保留命中的那条子节点
 *   2. 命中根节点 -> 直接返回该根节点
 * 可同时返回多条匹配结果
 *
 * @param {Array<Object>} list  原始树形数据
 * @param {string} keyword      模糊关键字
 * @returns {Array<Object>}     过滤后的新结构
 */
function findData(list: any, searchTerm: any) {
  // 空搜索返回空结果
  if (!searchTerm.trim()) return [];

  // 创建正则表达式进行模糊匹配（不区分大小写、允许部分匹配）
  const regex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );

  return list
    .filter((parent: any) => {
      // 检查父节点是否匹配
      const parentMatch = regex.test(parent.title);

      // 检查子节点是否匹配
      let childMatch = false;
      if (parent.children) {
        childMatch = parent.children.some((child: any) =>
          regex.test(child.title)
        );
      }

      return parentMatch || childMatch;
    })
    .map((parent: any) => {
      // 如果父节点匹配，返回整个父节点
      if (regex.test(parent.title)) {
        return parent;
      }

      // 如果只有子节点匹配，返回过滤后的子节点
      return {
        ...parent,
        children: parent.children.filter((child: any) =>
          regex.test(child.title)
        ),
      };
    });
}
let selectedChapters: any = [];

export function PanelChapters() {
  const {
    novelInfo,
    novelId,
    getCharacterInfo,
    addCharacter,
    editCharacter,
    setCharacterInfo,
    removeCharacter,
    extractCharacterDesc,

  } = useNovel();

  const {setParagraphs,setWords} = useWordCountHook()

  const { setCharacterTitle } = useCharacterTitle();

  const { theme } = useTheme();
  const [style] = useState<ThemeTokens>(theme);

  const [keyword, setKeyword] = useState("");

  const [keywordFilter, setKeywordFilter] = useState("");

  const [editChapter, setEditChapter] = useState(false);

  // 创建卷
  const [newOutlineTitle, setNewOutlineTitle] = useState("");
  const [newOutlineDescription, setNewOutlineDescription] = useState("");
  const [isOutlineShow, setIsOutlineShow] = useState(false);

  // 创建章节
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDescription, setNewChapterDescription] = useState("");
  const [isChapterShow, setIsChapterShow] = useState(false);
  const [isChapterShowChil, setIsChapterShowChil] = useState(false);

  // 编辑卷
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterDescription, setEditChapterDescription] = useState("");
  const [editOutlineTitle, setEditOutlineTitle] = useState("");
  const [editOutlineDescription, setEditOutlineDescription] = useState("");

  // 编辑章节
  const [editChapterTitleChil, setEditChapterTitleChil] = useState("");
  const [keywordChilId, setKeywordChilId] = useState("");
  const [editChapterDescriptionChil, setEditChapterDescriptionChil] =
    useState("");
  const [editChapterShowChil, setEditChapterShowChil] = useState(false);

  // 智能提取章节剧情
  const [isExtract, setIsExtract] = useState(false);
  const [extractChapters, setExtractChapters] = useState<ExtractChapters[]>([]);

  const {getVersionsByBranch,setVersions,setOptions} = useEditorHistory()

  const novels = useMemo(() => {
    if (!novelInfo) return [];
    // @ts-ignore
    const list: any = novelInfo.nodes.filter((item) => {
      if (item.type === "outline") {
        return true;
      }
    });
    if (keyword == "") {
      return list;
    } else {
      let res = findData(list, keyword);
      return res;
    }
  }, [novelInfo, keyword]);

  /**
   * @description 点击新增卷按钮
   * @param item
   */
  const handlePlusChapter = (item: any) => {
    setKeywordFilter(item._id);
  };

  /**
   * @description 点击编辑 卷
   * @param item
   */
  const handleDouButton = (item: any) => {
    setEditChapter(true);
    setKeywordFilter(item._id);
    setEditChapterTitle(item.title);
    setEditChapterDescription(item.description);
  };

  const handleSevaButton = async (params: {
    id: string;
    title: string;
    description: string;
  }) => {
    // @ts-ignore
    await editCharacter({ ...params });
    setEditChapter(false);
    setEditChapterTitle("");
    setEditChapterDescription("");
    setEditChapterTitle("");
    setKeywordFilter("");

    setEditChapterTitleChil("");
    setEditChapterDescriptionChil("");
    setKeywordChilId("");
    setEditChapterShowChil(false);
  };

  /**
   * @description 点击编辑 章节
   * @param item
   */
  const handleDouChilButton = (parentId: string, item: any) => {
    setEditChapterShowChil(true);
    setKeywordChilId(item._id);
    setKeywordFilter(parentId);
    setEditChapterTitleChil(item.title);
    setEditChapterDescriptionChil(item.description);
  };

  // 点击章节
  const handleClick = async (item: any) => {
    setCharacterTitle(item.title);
    setCharacterInfo(item._id);
    setParagraphs(item.stats.paragraphs)
    setWords(item.stats.wordCount)   

     let result = await getVersionsByBranch(novelId) 
     let list = result.filter($item => $item.history.title === item.title)

      let strs = result.map(item => item.history.title)
      let arr = Array.from(new Set(strs)).map(item => ({ value: item, label: item }))
      // @ts-ignore
      setOptions(arr)

     setVersions(list)

  };

  /**
   * @description 新建卷
   */
  const addOutline = async () => {
    // @ts-ignore
    const params = {
      type: "outline",
      title: newOutlineTitle,
      description: newOutlineDescription,
      parentId: novelInfo?.novel._id || "",
    };
    await addCharacter(params);
    setIsOutlineShow(false);
    setNewOutlineTitle("");
    setNewOutlineDescription("");
  };

  /**
   * 创建章节
   */
  const handleSubmitChapter = async () => {
    let params = {
      type: "chapter",
      title: newChapterTitle,
      description: newChapterDescription,
      // @ts-ignore
      parentId: keywordFilter,
      content: {
        html: `<h1>${newChapterTitle}</h1><p></p>`,
      },
    };

    const result = await addCharacter(params);
    if (result) {
      setCharacterTitle(result.title);
      setCharacterInfo(result._id);
      setNewChapterTitle("");
      setNewChapterDescription("");
      setKeywordFilter("");
    }
  };

  /**
   * @description 删除章节
   * @param id
   */
  const deleteCharacter = async (id: string) => {
    const result = await removeCharacter(id);
  };

  // 删除卷
  const deleteOutline = async (id: string) => {
    await deleteCharacter(id);
  };

  // 添加章节
  const addChapter = async () => {
    await handleSubmitChapter();
  };

  // 删除章节
  const deleteChapter = async (id: string) => {
    await deleteCharacter(id);
  };

  // 添加子章节
  const addChapterChil = async () => {
    await handleSubmitChapter();
  };

  // 删除子章节
  const deleteChapterChil = async (id: string) => {
    await deleteCharacter(id);
  };

  const showExtract = async () => {
    // await initData()

    // ExtractChapters
    if (!novels && novels.length == 0) return;

    let tmp = JSON.parse(JSON.stringify(novels));

    let list = tmp.map((item: ExtractChapters) => {
      // @ts-ignore
      let children = item.children.filter(
        (chil: any) => chil.stats?.wordCount > 0
      );
      children = children.map((chil: ExtractChapters) => ({
        ...chil,
        loading: false,
      }));
      return { ...item, children };
    });

    setExtractChapters(list);
    setIsExtract(true);
  };

  // 处理选中的章节
  const handleCheckedChange = (e: any, item: any) => {
    if (e) {
      // 选中
      // @ts-ignore
      console.log(e, item);
      selectedChapters.push(item);
    } else {
      // @ts-ignore
      selectedChapters = selectedChapters.filter(
        (chapter:any) => chapter._id !== item._id
      );
    }
  };

  // 提取选中的章节
  const handleExtract = async () => {
    if (selectedChapters.length == 0) return;
    for (let i = 0; i < selectedChapters.length; i++) {
      let chapter = selectedChapters[i];

      let isOk = await fecthdata(chapter._id);
      if (isOk) {
        continue;
      }
    }
  };

  const fecthdata = async (id: string): Promise<boolean> => {
    let isOk = false;
    let loading = (id: string, isLoading: boolean) => {
      let newChapters = setLoading(extractChapters, id, isLoading);
      setExtractChapters(newChapters);
    };
    loading(id, true);
    const data = await getCharacterInfo(id);
    let prompter = `
         提取章节剧情：${data.title} 内容不超过 200 字，请注意字数。
         <AI回复>
          直接回答不要出现 好的xxxx或者分析xxxx之类的词，这样会让人感到不舒服。
         </AI回复>
         章节内容：
         ${data.content.html}
        `;
    let result = await extractCharacterDesc(prompter);

    let newChapters = setDescription(extractChapters, id, result);
    setExtractChapters(newChapters);

    await handleSevaButton({ id, title: data.title, description: result });

    isOk = true;

    loading(id, false);
    return isOk;
  };

  return (
    <div
      className="pl-2 max-w-72"
      style={{ backgroundColor: style.backgroundImage ? `` : style.rightColor }}
    >
      <OutlineForm
        setIsExtract={setIsExtract}
        isExtract={isExtract}
        keyword={keyword}
        setKeyword={setKeyword}
        isOutlineShow={isOutlineShow}
        setIsOutlineShow={setIsOutlineShow}
        newOutlineTitle={newOutlineTitle}
        setNewOutlineTitle={setNewOutlineTitle}
        newOutlineDescription={newOutlineDescription}
        setNewOutlineDescription={setNewOutlineDescription}
        addOutline={addOutline}
        showExtract={showExtract}
        handleExtract={handleExtract}
      />

      <div
        className="w-full"
        style={{
          backgroundColor: style.backgroundImage ? `` : style.rightColor,
        }}
      >
        {isExtract ? (
          <ExtractList
            extractChapters={extractChapters}
            style={style}
            handleCheckedChange={handleCheckedChange}
          />
        ) : (
          <ChapterList
            novels={novels}
            keyword={keyword}
            editChapter={editChapter}
            setEditChapter={setEditChapter}
            keywordFilter={keywordFilter}
            setKeywordFilter={setKeywordFilter}
            editChapterShowChil={editChapterShowChil}
            setEditChapterShowChil={setEditChapterShowChil}
            keywordChilId={keywordChilId}
            setKeywordChilId={setKeywordChilId}
            editChapterTitle={editChapterTitle}
            setEditChapterTitle={setEditChapterTitle}
            editChapterDescription={editChapterDescription}
            setEditChapterDescription={setEditChapterDescription}
            editChapterTitleChil={editChapterTitleChil}
            setEditChapterTitleChil={setEditChapterTitleChil}
            editChapterDescriptionChil={editChapterDescriptionChil}
            setEditChapterDescriptionChil={setEditChapterDescriptionChil}
            newChapterTitle={newChapterTitle}
            setNewChapterTitle={setNewChapterTitle}
            newChapterDescription={newChapterDescription}
            setNewChapterDescription={setNewChapterDescription}
            isChapterShow={isChapterShow}
            setIsChapterShow={setIsChapterShow}
            isChapterShowChil={isChapterShowChil}
            setIsChapterShowChil={setIsChapterShowChil}
            editOutlineTitle={editOutlineTitle}
            setEditOutlineTitle={setEditOutlineTitle}
            editOutlineDescription={editOutlineDescription}
            setEditOutlineDescription={setEditOutlineDescription}
            deleteOutline={deleteOutline}
            addChapter={addChapter}
            deleteChapter={deleteChapter}
            addChapterChil={addChapterChil}
            deleteChapterChil={deleteChapterChil}
            handleSevaButton={handleSevaButton}
            handleDouButton={handleDouButton}
            handlePlusChapter={handlePlusChapter}
            deleteCharacter={deleteCharacter}
            handleSubmitChapter={handleSubmitChapter}
            handleDouChilButton={handleDouChilButton}
            handleClick={handleClick}
            style={style}
            updateOutline={function (params: any): Promise<void> {
              throw new Error("Function not implemented.");
            }}
            updateChapter={function (params: any): Promise<void> {
              throw new Error("Function not implemented.");
            }}
            updateChapterChil={function (params: any): Promise<void> {
              throw new Error("Function not implemented.");
            }}
          />
        )}
      </div>
    </div>
  );
}
