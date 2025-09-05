'use client';

import React, { useState } from 'react';
import Layout from '@/layout';
import { Bot, Plus, Edit, Trash2, Eye, EyeOff, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import  {useAIModels} from '@/app/novel/hooks/useAIModels';
import { toast } from 'sonner';

interface AIModel {
  id: string;
  modelName: string;
  model: string;
  api: string;
  key: string;
}

export default function PushModel() {
  const { models, addModel, updateModel, removeModel } = useAIModels();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [showkey, setShowkey] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    modelName: '',
    model: '',
    api: '',
    key: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.modelName || !formData.model || !formData.api || !formData.key) {
      toast.error('请填写所有字段');
      return;
    }

    if (editingModel) {
      updateModel(editingModel.id, formData);
      toast.success('模型更新成功');
    } else {
      // @ts-ignore
      addModel(formData);
      toast.success('模型添加成功');
    }

    setFormData({ modelName: '', model: '', api: '', key: '' });
    setEditingModel(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    setFormData({
      modelName: model.modelName,
      model: model.model,
      api: model.api,
      key: model.key
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    removeModel(id);
    toast.success('模型删除成功');
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type}已复制到剪贴板`);
  };

  const togglekeyVisibility = (id: string) => {
    setShowkey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetForm = () => {
    setFormData({ modelName: '', model: '', api: '', key: '' });
    setEditingModel(null);
  };

  return (
    <Layout>
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">

           <div className="flex flex-1 items-start justify-center rounded-lg   shadow-sm">
            <div className="flex w-full max-w-6xl flex-col gap-6 p-6">
              <div className="flex items-center justify-between">
                <div className="grid gap-1">
                  <h2 className="text-xl font-semibold tracking-tight">模型配置</h2>
                  <p className="text-sm text-muted-foreground">
                    不会将数据上传到服务器，仅在本地存储
                  </p>
                </div>
              </div>
              
              {/* <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>OpenAI API 兼容格式说明</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>请使用兼容 OpenAI API 格式的完整端点地址：</p>
                    <div className="bg-muted p-2 rounded text-sm font-mono">
                      • OpenAI: https://api.openai.com/v1/chat/completions<br/>
                      • 通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions<br/>
                      • 其他厂商: [基础URL]/v1/chat/completions
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      所有配置信息仅保存在本地浏览器中，请妥善保管您的API密钥。
                    </p>
                  </div>
                </AlertDescription>
              </Alert> */}
              
              <div className="flex items-center justify-end">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      添加模型
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingModel ? '编辑模型' : '添加新模型'}</DialogTitle>
                      <DialogDescription>
                        {editingModel ? '修改模型配置信息' : '填写模型配置信息以添加新的AI模型'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="modelName" className="text-right">
                          模型名称
                        </Label>
                        <Input
                          id="modelName"
                          value={formData.modelName}
                          onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
                          className="col-span-3"
                          placeholder="例如：GPT-4"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right">
                          模型ID
                        </Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          className="col-span-3"
                          placeholder="例如：gpt-4"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="api" className="text-right">
                          API地址
                        </Label>
                        <Input
                          id="api"
                          value={formData.api}
                          onChange={(e) => setFormData(prev => ({ ...prev, api: e.target.value }))}
                          className="col-span-3"
                          placeholder="例如：https://api.openai.com/v1"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="key" className="text-right">
                          API密钥
                        </Label>
                        <Input
                          id="key"
                          type="password"
                          value={formData.key}
                          onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                          className="col-span-3"
                          placeholder="输入您的API密钥"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingModel ? '更新' : '添加'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardHeader> 
                </CardHeader>
                <CardContent>
                  {models.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">暂无模型</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        点击上方"添加模型"按钮来配置您的第一个AI模型
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>模型名称</TableHead>
                          <TableHead>模型ID</TableHead>
                          <TableHead>API地址</TableHead>
                          <TableHead>API密钥</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {models.map((model) => (
                          <TableRow key={model.id}>
                            <TableCell className="font-medium">{model.modelName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                  {model.model}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(model.model, '模型ID')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm truncate max-w-[200px]">
                                  {model.api}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(model.api, 'API地址')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">
                                  {showkey[model.id] 
                                    ? model.key 
                                    : '•'.repeat(Math.min(model.key.length, 20))
                                  }
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglekeyVisibility(model.id)}
                                >
                                  {showkey[model.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(model.key, 'API密钥')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(model)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(model.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          
        </main>
      </div>
    </Layout>
  );
}