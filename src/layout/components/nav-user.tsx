"use client"
import useUser from "@/hooks/useUser"
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"


/**
 * 按规则返回首字母或首字
 * - 英文：取前两位并大写
 * - 中文：返回第一个汉字
 */
function takeInitial(str: string): string {
    // 用正则检测首字符是否为英文字母
    if (/^[A-Za-z]/.test(str)) {
        return str.slice(0, 2).toUpperCase();   // 英文
    }
    // 否则视为中文（或其他非英文字符）
    return str.charAt(0);                      // 中文
}


export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()

    const { userInfo } = useUser()



    const logOut = () => {  // 退出登录

        // 删除本地存储的user信息
        localStorage.removeItem("user-storage")

        // 跳转到登录页面
        window.location.href = "/login"

    }

    const handlePricing = () => {  // 跳转到定价页面
        window.location.href = "/pricing"
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger >
                        <SidebarMenuButton
                            size="lg"  
                            className="hover:bg-gray-100 hover:text-gray-900 bg-white "
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={userInfo?.userName} />
                                <AvatarFallback className="rounded-lg">
                                    {/* @ts-ignore */}
                                    {takeInitial(userInfo?.userName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{userInfo?.userName}</span>
                                {/* @ts-ignore */}
                                <span className="truncate text-xs">{userInfo?.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto w-4 h-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={userInfo?.userName} />
                                    <AvatarFallback className="rounded-lg">
                                        {/* @ts-ignore */}
                                        {takeInitial(userInfo?.userName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{userInfo?.userName}</span>
                                    {/* @ts-ignore */}
                                    <span className="truncate text-xs">{userInfo?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handlePricing}>
                                <Sparkles />
                                升级到 Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck />
                                账户设置
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                订单
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                通知
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logOut()}>
                            <LogOut />
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
