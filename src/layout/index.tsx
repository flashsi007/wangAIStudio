"use client"


import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from "./components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

interface LayoutProps {
    children: React.ReactNode
}



// 路径名称映射
const pathNameMap: Record<string, string> = {
    'dashboard': '控制台',
    'template': '模板库',
    'community': '创作社区',
    'prompter': "提示词",
    'pushModel': 'AI模型管理',
};






export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);

    useEffect(() => {
        if (pathname) {
            const pathWithoutQuery = pathname.split('?')[0];
            let pathArray = pathWithoutQuery.split('/').filter(Boolean);

            // 构建面包屑数组
            const breadcrumbArray = pathArray.map((path, idx) => {
                // 构建当前路径的完整URL
                const href = '/' + pathArray.slice(0, idx + 1).join('/');
                return {
                    href,
                    label: pathNameMap[path] || path.replace(/-/g, ' '),
                };
            });

            // 如果不在首页，添加首页面包屑
            if (pathArray.length > 0) {
                breadcrumbArray.unshift({
                    href: '/',
                    label: '首页',
                });
            }

            setBreadcrumbs(breadcrumbArray);
        }
    }, [pathname]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header
                 style={{
                    borderBottom:"2px solid #f5f5f5"
                 }}
                className="flex h-16 shrink-0 items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb className="hidden md:block">
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <Fragment key={breadcrumb.href}>
                                        <BreadcrumbItem>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage className="font-semibold">
                                                    {breadcrumb.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href={breadcrumb.href} className=" transition-colors">
                                                    {breadcrumb.label}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {index < breadcrumbs.length - 1 && (
                                            <BreadcrumbSeparator />
                                        )}
                                    </Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                        {/* 移动端显示当前页面标题 */}
                        <div className="md:hidden font-medium text-sm">
                            {breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].label}
                        </div>
                    </div>
                </header>

                {children}
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    )
}