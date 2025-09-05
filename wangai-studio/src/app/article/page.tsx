
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Server, Globe, Zap, Shield, Users, Code } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
function ArticlePage() {
  const toCode = (url: string) => {
    window.location.href = url;
  };

  return (
     <ScrollArea className="h-[98vh] w-full"  >
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              🖋️ 网文大神助手
              <span className="block text-2xl md:text-3xl text-blue-600 dark:text-blue-400 mt-2">
                WangAI Studio
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              基于AI的智能网文创作平台，让每个人都能成为网文大神。
              集成多种AI模型，提供专业的写作工具和实时协作功能。
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Code className="w-4 h-4 mr-2" />
                开源免费
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                AI 驱动
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Users className="w-4 h-4 mr-2" />
                实时协作
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                企业级
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => toCode('https://github.com/wangai-studio')}>
                 <Github className="w-5 h-5 mr-2" />
                 查看源码
               </Button>
               <Button size="lg" variant="outline" onClick={() => toCode('https://demo.wangai-studio.com')}>
                 <ExternalLink className="w-5 h-5 mr-2" />
                 在线体验
               </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Project Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            项目架构概览
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">前端应用</CardTitle>
                    <CardDescription>现代化的 Web 用户界面</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Next.js 15</Badge>
                    <Badge>React 19</Badge>
                    <Badge>TypeScript</Badge>
                    <Badge>Tailwind CSS</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    基于 Next.js 构建的现代化前端应用，提供响应式设计、
                    专业编辑器、可视化大纲管理等功能。支持多主题切换和无障碍访问。
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">核心特性：</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• 🤖 AI 智能写作助手</li>
                      <li>• 📝 基于 Tiptap 的富文本编辑器</li>
                      <li>• 🗺️ 可视化思维导图大纲</li>
                      <li>• 👥 角色关系管理系统</li>
                      <li>• 🎨 现代化响应式界面</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Server className="w-8 h-8 text-green-600" />
                  <div>
                    <CardTitle className="text-xl">后端服务</CardTitle>
                    <CardDescription>强大的 AI 工作室后端</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>NestJS 11</Badge>
                    <Badge>MongoDB</Badge>
                    <Badge>Redis</Badge>
                    <Badge>Socket.IO</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    基于 NestJS 构建的企业级后端服务，集成多种主流 AI 模型，
                    提供统一的 API 接口和实时通信功能。
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">核心特性：</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• 🔗 多 AI 模型集成（通义千问、豆包、DeepSeek 等）</li>
                      <li>• 🔄 WebSocket 实时通信</li>
                      <li>• 🔍 智能搜索与向量匹配</li>
                      <li>• 👤 JWT 用户认证系统</li>
                      <li>• 📧 邮件服务与通知系统</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            技术栈详情
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">前端框架</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">Next.js 15</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-sm">React 19</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-sm">TypeScript</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">UI 组件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">Radix UI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span className="text-sm">Tailwind CSS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Lucide Icons</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">后端技术</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">NestJS 11</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">MongoDB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-sm">Redis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI 集成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">通义千问</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span className="text-sm">DeepSeek</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span className="text-sm">Kimi & 豆包</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deployment Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            部署方案
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-blue-600" />
                  </div>
                  开发环境
                </CardTitle>
                <CardDescription>
                  本地开发和测试环境快速搭建
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                  <li>• 一键启动开发服务器</li>
                  <li>• 热重载和实时调试</li>
                  <li>• Docker Compose 支持</li>
                  <li>• 完整的开发工具链</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Server className="w-4 h-4 text-green-600" />
                  </div>
                  生产部署
                </CardTitle>
                <CardDescription>
                  企业级生产环境部署方案
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                  <li>• PM2 集群模式</li>
                  <li>• Nginx 负载均衡</li>
                  <li>• SSL 证书配置</li>
                  <li>• 监控和日志管理</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                  容器化
                </CardTitle>
                <CardDescription>
                  Docker 容器化部署解决方案
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                  <li>• Docker 镜像构建</li>
                  <li>• Kubernetes 支持</li>
                  <li>• 微服务架构</li>
                  <li>• 自动扩缩容</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            快速开始
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Button 
            onClick={()=>toCode('https://github.com/flashsi007/wangAIStudio')} 
            variant="outline" className="h-auto p-6 flex flex-col gap-2">
              <Github className="w-6 h-6" />
              <span 
              
              className="font-semibold">前端源码</span>
              <span className="text-xs text-slate-500">Next.js 应用</span>
            </Button>
            <Button  
               onClick={()=>toCode('https://github.com/flashsi007/wangaiStudioServer')} 
            variant="outline" className="h-auto p-6 flex flex-col gap-2">
              <Server className="w-6 h-6" />
              <span className="font-semibold">后端源码</span>
              <span className="text-xs text-slate-500">NestJS 服务</span>
            </Button>
            <Button onClick={()=>toCode('https://docs.wangai-studio.com')} variant="outline" className="h-auto p-6 flex flex-col gap-2">
              <ExternalLink className="w-6 h-6" />
              <span className="font-semibold">部署文档</span>
              <span className="text-xs text-slate-500">详细指南</span>
            </Button>
            <Button onClick={()=>toCode('https://github.com/wangai-studio/issues')} variant="outline" className="h-auto p-6 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="font-semibold">社区支持</span>
              <span className="text-xs text-slate-500">问题反馈</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-4">
            用AI赋能创作，让每个人都能成为网文大神 ✨
          </p>
          <p className="text-slate-400">
            Made with ❤️ by WangAI Studio Team
          </p>
        </div>
      </footer>
    </div>
    </ScrollArea>
  );
}

export default ArticlePage;


