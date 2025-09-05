"use client"
import Layout from "@/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import usUser from "@/hooks/useUser"
import { ScrollArea } from '@/components/ui/scroll-area';

import { createPrompter, updatePrompter, deletePrompter, getPrompterList } from "@/app/api"

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"



export default function PrompterPage() {

    const { userId } = usUser()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')
    const [editingPrompter, setEditingPrompter] = useState<any>(null)
    const [deletingPrompter, setDeletingPrompter] = useState<any>(null)
    const [prompterList, setPrompterList] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchValue, setSearchValue] = useState({
        page: 1,
        pageSize: 999,
        title: ''
    })

    const submit = async () => {
        if (newTitle == '' || newContent == '') return
        setLoading(true)

        try {
            let res = await createPrompter({
                userId,
                title: newTitle.trim(),
                content: newContent
            })

            // @ts-ignore
            if (res.status === 'success') {
                setIsDialogOpen(false)
                setNewTitle('')
                setNewContent('')
                await initData() // 刷新列表
            }
        } catch (error) {
            console.error('创建失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const initData = async () => {
        setLoading(true)
        try {
            let res = await getPrompterList({ userId, ...searchValue })
            // @ts-ignore
            if (res.status === 'success') {
                setPrompterList(res.data || [])
            }
        } catch (error) {
            console.error('获取列表失败:', error)
        } finally {
            setLoading(false)
        }
    }

    // 搜索功能
    const handleSearch = () => {
        initData()
    }

    // 编辑功能
    const handleEdit = (prompter: any) => {
        setEditingPrompter(prompter)
        setEditTitle(prompter.title)
        setEditContent(prompter.content)
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingPrompter || editTitle == '' || editContent == '') return
        setLoading(true)

        try {
            let res = await updatePrompter({
                userId,
                id: editingPrompter._id,
                title: editTitle.trim(),
                content: editContent
            })

            // @ts-ignore
            if (res.status === 'success') {
                setIsEditDialogOpen(false)
                setEditTitle('')
                setEditContent('')
                setEditingPrompter(null)
                await initData() // 刷新列表
            }
        } catch (error) {
            console.error('更新失败:', error)
        } finally {
            setLoading(false)
        }
    }

    // 删除功能
    const handleDelete = (prompter: any) => {
        setDeletingPrompter(prompter)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingPrompter) return
        setLoading(true)

        try {
            let res = await deletePrompter({
                userId,
                id: deletingPrompter._id
            })

            // @ts-ignore
            if (res.status === 'success') {
                setIsDeleteDialogOpen(false)
                setDeletingPrompter(null)
                await initData() // 刷新列表
            }
        } catch (error) {
            console.error('删除失败:', error)
        } finally {
            setLoading(false)
        }
    }

    // 格式化日期
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    useEffect(() => {
        initData()
    }, [])

    return (
        <Layout>
            <div className="p-4">
                <div className="header space-x-2 flex items-center mb-4">

                    <div className="flex items-center space-x-2">
                        <Input
                            value={searchValue.title}
                            onChange={(e) => setSearchValue({ ...searchValue, title: e.target.value })}
                            className="w-64" type='search' placeholder="搜索提示词"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                        <Button onClick={handleSearch} disabled={loading}>
                            <Search />
                            <span>搜索</span>
                        </Button>
                    </div>

                    <Button className='cursor-pointer' onClick={() => setIsDialogOpen(true)} disabled={loading}>
                        <Plus />
                        <span> 添加提示词 </span>
                    </Button>
                </div>
                <ScrollArea className="h-screen max-h-screen space-y-4" >

                    {/* 提示词列表 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full text-center py-8">
                                <div className="text-gray-500">加载中...</div>
                            </div>
                        ) : prompterList.length === 0 ? (
                            <div className="col-span-full text-center py-8">
                                <div className="text-gray-500">暂无提示词，点击添加按钮创建第一个提示词</div>
                            </div>
                        ) : (
                            prompterList.map((prompter: any) => (
                                <Card key={prompter._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg font-medium truncate pr-2">
                                                {prompter.title}
                                            </CardTitle>
                                            <div className="flex space-x-1 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(prompter)}
                                                    disabled={loading}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(prompter)}
                                                    disabled={loading}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                            {prompter.content}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>{formatDate(prompter.createdAt)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>


            {/* 创建提示词弹窗 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white border border-gray-200">
                    <DialogHeader>
                        <DialogTitle>创建提示词</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="请输入提示词标题" autoFocus />

                        <Textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}

                            className="h-52"
                            placeholder="请输入提示词内容" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>取消</Button>
                        <Button type="submit" onClick={submit} disabled={loading || !newTitle.trim() || !newContent.trim()}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 编辑提示词弹窗 */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white border border-gray-200">
                    <DialogHeader>
                        <DialogTitle>编辑提示词</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="请输入提示词标题" autoFocus />

                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}

                            className="h-52"
                            placeholder="请输入提示词内容" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>取消</Button>
                        <Button type="submit" onClick={handleUpdate} disabled={loading || !editTitle.trim() || !editContent.trim()}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 删除确认对话框 */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white border border-gray-200">
                    <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            您确定要删除提示词 "{deletingPrompter?.title}" 吗？此操作无法撤销。
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>取消</Button>
                        <Button onClick={confirmDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Layout>
    )
}

