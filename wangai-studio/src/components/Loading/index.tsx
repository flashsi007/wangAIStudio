import React from 'react';

interface LoadingProps {
    isVisible: boolean;
    progress: number;
    title?: string;
    subtitle?: string;
}

const Loading: React.FC<LoadingProps> = ({
    isVisible,
    progress,
    title = '正在初始化思维导图...',
    subtitle
}) => {
    if (!isVisible) return null;

    const getSubtitle = () => {
        if (subtitle) return subtitle;
        if (progress < 30) return '正在加载核心模块...';
        if (progress < 60) return '正在加载插件...';
        if (progress < 90) return '正在初始化组件...';
        return '即将完成...';
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            <div className="flex flex-col items-center p-8 rounded-2xl shadow-2xl"
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E6EB',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
                    gap: '24px'
                }}>
                {/* Loading 动画 */}
                <div className="relative">
                    {/* 外层光环 */}
                    <div className="absolute -inset-2 rounded-full animate-pulse"
                        style={{
                            background: `radial-gradient(circle, transparent 60%, #7BA1FF 70%, transparent 80%)`,
                            opacity: 0.6
                        }}></div>

                    {/* 主旋转环 */}
                    <div className="w-16 h-16 rounded-full relative" style={{
                        background: `conic-gradient(from 0deg, #7BA1FF, #165DFF, #4080FF, #7BA1FF)`,
                        animation: 'spin 2s linear infinite'
                    }}>
                        <div className="absolute inset-1 rounded-full"
                            style={{
                                backgroundColor: '#FFFFFF'
                            }}></div>
                    </div>

                    {/* 反向旋转内环 */}
                    <div className="absolute top-2 left-2 w-12 h-12 rounded-full"
                        style={{
                            background: `conic-gradient(from 180deg, transparent, #4080FF, transparent)`,
                            animation: 'spin 1.5s linear infinite reverse'
                        }}>
                        <div className="absolute inset-1 rounded-full" style={{
                            backgroundColor: '#FFFFFF'
                        }}></div>
                    </div>

                    {/* 中心脉动点 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <div className="w-4 h-4 rounded-full animate-pulse" style={{
                                backgroundColor: 'var(--color-primary)',
                                boxShadow: `0 0 20px #4080FF`
                            }}></div>
                            <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" style={{
                                backgroundColor: 'var(--color-primary)',
                                opacity: 0.4
                            }}></div>
                        </div>
                    </div>

                    {/* 装饰性粒子 */}
                    <div className="absolute top-0 left-1/2 w-1 h-1 rounded-full animate-bounce" style={{
                        backgroundColor: '#4080FF',
                        transform: 'translateX(-50%)',
                        animationDelay: '0s'
                    }}></div>
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full animate-bounce" style={{
                        backgroundColor: '#4080FF',
                        transform: 'translateX(-50%)',
                        animationDelay: '0.5s'
                    }}></div>
                    <div className="absolute left-0 top-1/2 w-1 h-1 rounded-full animate-bounce" style={{
                        backgroundColor: '#4080FF',
                        transform: 'translateY(-50%)',
                        animationDelay: '0.25s'
                    }}></div>
                    <div className="absolute right-0 top-1/2 w-1 h-1 rounded-full animate-bounce" style={{
                        backgroundColor: '#4080FF',
                        transform: 'translateY(-50%)',
                        animationDelay: '0.75s'
                    }}></div>
                </div>

                {/* 进度条 */}
                <div className="w-64" style={{ gap: '12px' }}>
                    <div className="flex justify-between mb-3" style={{
                        fontSize: '14px',
                        color: '#4E5969'
                    }}>
                        <span className="font-medium">{title}</span>
                        <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden mb-3" style={{
                        backgroundColor: '#F2F3F5'
                    }}>
                        <div
                            className="h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(to right, #165DFF, #4080FF)`
                            }}
                        ></div>
                    </div>
                    <div className="text-center" style={{
                        fontSize: '12px',
                        color: '#86909C'
                    }}>
                        {getSubtitle()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
export type { LoadingProps };