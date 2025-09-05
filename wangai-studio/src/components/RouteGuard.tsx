'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
    children: React.ReactNode;
}

const publicPages = ['/login', '/', '/pricing', '/article']

export default function RouteGuard({ children }: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    function getToken() {
        try {
            const userStore = window.localStorage.getItem('user-storage');
            if (!userStore) return '';
            const storage = JSON.parse(userStore);
            return storage.state?.userInfo?.token || '';
        } catch (error) {
            console.error('获取token失败:', error);
            return '';
        }
    }

    useEffect(() => {
        const currentToken = getToken();
        setToken(currentToken);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isLoading) return;



        // 如果没有token且当前页面不在公开页面列表中，重定向到登录页
        if (!token && !publicPages.includes(pathname)) {

            router.push('/login');
            return;
        }

        // 如果有token且在登录页，重定向到首页
        if (token && pathname === '/login') {
            router.push('/dashboard');
            return;
        }
    }, [token, pathname, router, isLoading]);

    // 加载中或需要重定向时显示Loading页面
    if (isLoading || (!token && !publicPages.includes(pathname))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-gray-600 font-medium">正在加载...</p>
                    <p className="text-sm text-gray-400 mt-2">请稍候，系统正在为您准备</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}