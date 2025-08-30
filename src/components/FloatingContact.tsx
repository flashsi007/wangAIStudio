'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MessageCircle, Users } from 'lucide-react';
import { publicConfig } from '@/app/config'

interface FloatingContactProps {
  className?: string;
}

export default function FloatingContact({ className }: FloatingContactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'qq' | 'wechat'>('qq');

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 悬浮按钮 */}
      <div className={`fixed bottom-[50vh] right-6 z-50 ${className}`}>
        <Button
          onClick={toggleOpen}
          size="lg"
          style={{
                  borderRadius: '0.8rem',
                }}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* 悬浮框 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 悬浮卡片 */}
          <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
            <Card className="w-80 shadow-2xl border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">加入我们的社群</CardTitle>
                  <Button
                  style={{
                  borderRadius: '0.8rem',
                }}
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  与其他创作者交流经验，获取最新功能更新
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 标签切换 */}
                <div className="flex space-x-2">
                  <Button
                  style={{
                  borderRadius: '0.8rem',
                }}
                    variant={activeTab === 'qq' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('qq')}
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    QQ群
                  </Button>
                  <Button
                  style={{
                  borderRadius: '0.8rem',
                }}
                    variant={activeTab === 'wechat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('wechat')}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    微信群
                  </Button>
                </div>

                {/* 二维码显示区域 */}
                <div className="text-center space-y-3">
                  {activeTab === 'qq' ? (
                    <>
                      <div className="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-4">
                        <img
                          src={publicConfig.qqImg}
                          alt="QQ群二维码"
                          className="w-36 h-36 mb-3"
                        />
                        <p className="text-sm font-medium text-gray-800 text-center">QQ技术交流群</p>
                        <p className="text-xs text-gray-500 text-center">群号:{publicConfig.qqMumber}</p>
                        <p className="text-xs text-gray-500 text-center">在线人数:{publicConfig.qqtNumber}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-4">
                        <img
                          src={publicConfig.wechatImg}
                          alt="微信群二维码"
                          className="w-36 h-36 mb-3"
                        />
                        <p className="text-sm font-medium text-gray-800 text-center">微信技术交流群</p>
                        <p className="text-xs text-gray-500 text-center">扫码加入讨论</p>
                        <p className="text-xs text-gray-500 text-center">活跃社群: {publicConfig.wechatNumber}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* 底部提示 */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-center text-muted-foreground">
                    💡 群内有专业导师指导，定期分享创作技巧
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}