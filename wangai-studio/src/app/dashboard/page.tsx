"use client"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react';
import Layout from "@/layout"
import Image from 'next/image'
import buok from '@/assets/images/buok.png'
import { EllipsisVertical, Plus, PenLine, Trash2, TrendingUp, Download, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { CreateNovelProps } from "@/app/api";
import { getNovelList, deleteNovelById, novelRename, createNovel, getAllCharacter } from "@/app/api";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore } from '@/store/useUserInfo'
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { getTodayWords, getOneWeekWords } from "@/app/api";

function bliudNovelTemplate(createValue: string, userId: string): CreateNovelProps {
    return {
        userId: userId || '',
        novel: {
            title: createValue,
        },
        nodes: [
            {
                title: `大纲 ${createValue}`,
                type: "mindmap",
                content: {
                    data: {
                        text: `大纲 ${createValue} `,
                    },
                    children: [
                        {
                            data: {
                                text: `世界观`,
                            },
                            children: [

                            ]
                        },
                        {
                            data: {
                                text: `金手指`,
                            },
                            children: [

                            ]
                        },

                    ]
                }
            },

            {
                title: `角色 ${createValue} `,
                type: "mindmap",
                content: {
                    data: {
                        text: ` 角色 ${createValue}`,
                    },
                    children: [

                    ]
                }
            },
            {
                title: `第一章`,
                type: "mindmap",
                content: {
                    data: {
                        text: `第一章`,
                    },
                    children: [
                    ]
                }
            },

            {
                type: "outline",
                title: "第一卷",

                children: [
                    {
                        title: "第1章",
                        type: "chapter",
                        content: {
                            html: `<h1>第1章</h1>
                            <p></p>
                            `
                        }
                    }
                ]
            }
        ]
    }
}

import { htmlToText } from 'html-to-text'
// 提取纯文本内容的辅助函数
const extractText = (html: string) => {
    const plainText = htmlToText(html, {
        wordwrap: false, // 禁用自动换行
        preserveNewlines: false // 不保留换行符
    })
    return plainText
};


export default function DashboardPage() {




    const router = useRouter();
    const [novelList, setNovelList] = useState([]);
    const { getUserId } = useUserStore()
    const userId = getUserId()
    const [value, setValue] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [currentNovelId, setCurrentNovelId] = useState('')


    // 创建小说Value Name
    const [createValue, setCreateValue] = useState('')
    const [todayWords, setTodayWords] = useState(0);
    const [weekWords, setWeekWords] = useState({
        oneWeekWords: 0,
        twoWeekWords: 0,
        threeWeekWords: 0,
        fourWeekWords: 0,
        fiveWeekWords: 0,
        sixWeekWords: 0,
        sevenWeekWords: 0
    });

    const fetchData = async () => {
        let { data } = await getNovelList(userId || '')
        setNovelList(data);
    }

    const fetchTodayWords = async () => {

        let { data } = await getTodayWords(userId || '')
        console.log(data);
        if (data && data.words) {
            setTodayWords(data.words);
        }
    }

    const fetchOneWeekWords = async () => {

        let { data } = await getOneWeekWords(userId || '')

        if (data) {
            setWeekWords({
                oneWeekWords: data.oneWeekWords || 0,
                twoWeekWords: data.twoWeekWords || 0,
                threeWeekWords: data.threeWeekWords || 0,
                fourWeekWords: data.fourWeekWords || 0,
                fiveWeekWords: data.fiveWeekWords || 0,
                sixWeekWords: data.sixWeekWords || 0,
                sevenWeekWords: data.sevenWeekWords || 0
            });
        }
    }


    useEffect(() => {
        fetchData()
        fetchTodayWords()
        fetchOneWeekWords()
    }, [])


    const handleToPage = (e: any, id: string) => {
        e.preventDefault();
        router.push(`/novel/${id}`);
    }

    const saveChange = async () => {
        if (value == '') return;

        // 这里可以添加保存逻辑 
        let result: any = await novelRename({ novelId: currentNovelId, title: value, userId: userId || '' })
        if (result.status === 'success') {
            setIsDialogOpen(false);
            setValue('');
            setCurrentNovelId('');
            fetchData();
        }
    }

    const deleteNovel = async (novelId: string) => {
        let result: any = await deleteNovelById({ novelId, userId: userId || '' })
        if (result.status === 'success') {

            fetchData();
        }
    }

    const handleRename = (novelId: string, currentTitle: string) => {
        setCurrentNovelId(novelId);
        setValue(currentTitle);
        setIsDialogOpen(true);
    }


    const submit = async () => {
        if (createValue == '') return;

        let params = bliudNovelTemplate(createValue, userId || '')

        const result: any = await createNovel(params);
        if (result.status === 'success') {

            setCreateValue('');
            setIsCreateDialogOpen(false);
            fetchData();
        }
    }


    const download = async (novelId: string, novelTitle: string) => {
        try {
            let { data } = await getAllCharacter(userId || '', novelId, 'chapter');

            if (!data || data.length === 0) {
                console.log('没有章节数据');
                return;
            }

            // 创建zip实例
            const zip = new JSZip();

            // 遍历所有章节数据
            data.forEach((chapter: any, index: number) => {
                if (chapter.title && chapter.content && chapter.content.html) {
                    // 将HTML转换为纯文本
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = chapter.content.html;
                    const textContent = extractText(chapter.content.html)
                    //   tempDiv.textContent || tempDiv.innerText || '';
                    // 创建文件名，确保文件名安全
                    const safeTitle = chapter.title.replace(/[<>:"/\\|?*]/g, '_');
                    const fileName = `${safeTitle}.txt`;

                    // 添加文件到zip
                    zip.file(fileName, textContent);
                }
            });

            // 生成zip文件
            const content = await zip.generateAsync({ type: 'blob' });

            // 创建下载链接
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${novelTitle}.zip`;

            // 触发下载
            document.body.appendChild(link);
            link.click();

            // 清理
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log(`已导出 ${data.length} 个章节到 ${novelTitle}.zip`);

        } catch (error) {
            console.error('导出失败:', error);
        }
    }

    const NovelList = () => {
        return (
            <div className="flex flex-wrap ">
                {novelList.map((item: any, index) => (
                    <div
                        key={index}
                        title={item.novel.title}
                        className="overflow-hidden rounded-xl shadow-md bg-gray-50 p-4 flex flex-col justify-center items-center  m-2">

                      
                        <div className="cursor-pointer  w-36 h-48 flex justify-center relative"  >
                            <Image
                                onClick={(e) => handleToPage(e, item._id)}
                                src={buok}
                                alt="buok"
                                className="w-full h-48 rounded-sm object-cover"
                            />

                            <div className="absolute bottom-6 right-0 p-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" style={{ width: 36,padding:0 }} className=" bg-yellow-100 shadow-md rounded-l-lg ">
                                            <EllipsisVertical  />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-32">

                                        <DropdownMenuLabel>
                                            <div className="cursor-pointer flex items-center space-x-2" onClick={() => download(item._id, item.novel.title)}>
                                                <Download className="w-4 h-4 mr-2" />
                                                <span>导出</span>
                                            </div>
                                        </DropdownMenuLabel>


                                        <DropdownMenuLabel>
                                            <div className="cursor-pointer flex items-center space-x-2" onClick={() => handleRename(item._id, item.novel.title)}>
                                                <PenLine className="w-4 h-4 mr-2" />
                                                <span>重命名</span>
                                            </div>
                                        </DropdownMenuLabel>


                                        <DropdownMenuLabel>
                                            <div
                                                onClick={() => deleteNovel(item._id)}
                                                className="cursor-pointer flex items-center space-x-2">
                                                <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                                                <span className="text-red-500">删除</span>
                                            </div>
                                        </DropdownMenuLabel>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* 标题 + 更多按钮 */}
                        <div className="cursor-pointer flex items-center justify-between mt-2 px-1">
                            <div
                                onClick={(e) => handleToPage(e, item._id)}
                                className=" w-38   text-left overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                {item.novel.title}
                            </div>

                        </div>
                    </div>
                ))}

                {/* -------------------------------------------------- */}
                 
               

                {/* ----------------------------------------------------------------------------------------------------------- */}
 
            </div>
        );
    };


    return (
        <Layout>
            <div className="flex flex-1 flex-col gap-4 p-4 ">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">

                    {/* 渲染今日字数 */}
                    <div className="rounded-xl bg-white text-gray-900 shadow border border-gray-200 p-6" >
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="text-sm font-medium">今日字数</div>
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{todayWords.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">
                                字数统计
                            </p>
                        </div>
                    </div>
                    {/* 渲染一周字数 */}
                    <div className="rounded-xl bg-white text-gray-900 shadow border border-gray-200 p-6" >
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="text-sm font-medium">本周字数统计</div>
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                        </div>
                        <ChartContainer
                            config={{
                                words: {
                                    label: "字数",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                            className="h-[200px] w-full"
                        >
                            <BarChart
                                data={[
                                    { day: "一", words: weekWords.oneWeekWords },
                                    { day: "二", words: weekWords.twoWeekWords },
                                    { day: "三", words: weekWords.threeWeekWords },
                                    { day: "四", words: weekWords.fourWeekWords },
                                    { day: "五", words: weekWords.fiveWeekWords },
                                    { day: "六", words: weekWords.sixWeekWords },
                                    { day: "日", words: weekWords.sevenWeekWords },
                                ]}
                            >
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                    dataKey="words"
                                    fill="var(--color-words)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                        <div className="text-xs text-gray-500 mt-2">
                            总计: {Object.values(weekWords).reduce((sum, words) => sum + words, 0).toLocaleString()} 字
                        </div>
                    </div>

                    <div className="w-full h-48 rounded-xl bg-gray-50" ></div>

                </div>


                <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min p-4" >


                    <div className="space-x-2">
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus />
                            <span>快速创建</span>
                        </Button>
                        {/* <Button >
                            <Plus />
                            <span>智能创建</span>
                        </Button> */}
                    </div>
                    <ScrollArea className="h-[40vh] sm:h-[50vh] mt-4" >
                        <NovelList />

                    </ScrollArea>

                </div>
            </div>

            {/* 重命名对话框 - 移到组件外层 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>修改小说名称</DialogTitle>
                        <DialogDescription>请输入新的小说名称</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    saveChange();
                                }
                                e.stopPropagation();
                            }}
                            placeholder="请输入小说名称"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                        <Button type="submit" onClick={saveChange}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*  快速创建小说对话框  */}

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>小说名称</DialogTitle>
                        <DialogDescription>请输入新的小说名称</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={createValue}
                            onChange={(e) => setCreateValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    submit();
                                }
                                e.stopPropagation();
                            }}
                            placeholder="请输入小说名称"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
                        <Button type="submit" onClick={submit}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    )
};