"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
                        {/* Left Side - Illustration */}
                        <div className="flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="text-center space-y-6">
                                {/* SVG Illustration from undraw.co style */}
                                <div className="w-full max-w-md mx-auto">
                                    <svg
                                        viewBox="0 0 400 300"
                                        className="w-full h-auto"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Background elements */}
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                                            </linearGradient>
                                        </defs>

                                        {/* Background circle */}
                                        <circle cx="200" cy="150" r="120" fill="url(#grad1)" />

                                        {/* Character body */}
                                        <ellipse cx="200" cy="220" rx="25" ry="35" fill="hsl(var(--primary))" opacity="0.8" />

                                        {/* Character head */}
                                        <circle cx="200" cy="160" r="20" fill="hsl(var(--primary))" opacity="0.9" />

                                        {/* Arms */}
                                        <ellipse cx="175" cy="190" rx="8" ry="25" fill="hsl(var(--primary))" opacity="0.8" transform="rotate(-20 175 190)" />
                                        <ellipse cx="225" cy="190" rx="8" ry="25" fill="hsl(var(--primary))" opacity="0.8" transform="rotate(20 225 190)" />

                                        {/* Legs */}
                                        <ellipse cx="190" cy="250" rx="8" ry="20" fill="hsl(var(--primary))" opacity="0.8" />
                                        <ellipse cx="210" cy="250" rx="8" ry="20" fill="hsl(var(--primary))" opacity="0.8" />

                                        {/* Question marks floating around */}
                                        <text x="120" y="100" fontSize="24" fill="hsl(var(--muted-foreground))" opacity="0.6">?</text>
                                        <text x="280" y="120" fontSize="20" fill="hsl(var(--muted-foreground))" opacity="0.5">?</text>
                                        <text x="150" y="280" fontSize="18" fill="hsl(var(--muted-foreground))" opacity="0.4">?</text>
                                        <text x="320" y="200" fontSize="22" fill="hsl(var(--muted-foreground))" opacity="0.6">?</text>

                                        {/* Floating elements */}
                                        <circle cx="100" cy="80" r="3" fill="hsl(var(--primary))" opacity="0.4" />
                                        <circle cx="320" cy="90" r="2" fill="hsl(var(--primary))" opacity="0.3" />
                                        <circle cx="80" cy="200" r="2.5" fill="hsl(var(--primary))" opacity="0.5" />
                                        <circle cx="340" cy="250" r="2" fill="hsl(var(--primary))" opacity="0.4" />
                                    </svg>
                                </div>

                                {/* 404 Text */}
                                <div className="space-y-2">
                                    <h1 className="text-8xl font-bold text-primary/20 select-none">
                                        404
                                    </h1>
                                    <div className="text-sm text-muted-foreground font-medium">
                                        页面走丢了...
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="flex flex-col justify-center p-8 lg:p-12 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                                        哎呀！页面不见了
                                    </h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        看起来你要找的页面已经搬家了，或者可能从来就不存在。
                                        不过别担心，让我们帮你找到正确的方向！
                                    </p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                                    <h3 className="font-semibold text-foreground mb-2">可能的原因：</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• 网址输入错误</li>
                                        <li>• 页面已被移动或删除</li>
                                        <li>• 链接已过期</li>
                                        <li>• 你没有访问权限</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Link href="/dashboard" className="w-full">
                                        <Button className="w-full" size="lg">
                                            <Home className="w-5 h-5 mr-2" />
                                            回到首页
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => window.history.back()}
                                        className="w-full"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        返回上页
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Link href="/dashboard" className="w-full">
                                        <Button variant="secondary" size="lg" className="w-full">
                                            <Search className="w-5 h-5 mr-2" />
                                            创作中心
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        onClick={() => window.location.reload()}
                                        className="w-full"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        刷新页面
                                    </Button>
                                </div>
                            </div>

                            {/* Help Text */}
                            <div className="text-center pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    如果问题持续存在，请
                                    <Link href="/community" className="text-primary hover:underline ml-1">
                                        联系客服
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}