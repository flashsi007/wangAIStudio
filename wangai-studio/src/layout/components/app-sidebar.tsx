"use client"

import { ComponentProps, useEffect, useState } from "react"
import {
    Settings,
    CircleGauge,
    SquareTerminal,
    PenTool
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "",
    },
    navMain: [
        {
            title: "控制台",
            url: "/dashboard",
            icon: CircleGauge,

        },
        {
            title: "探索",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                // {
                //     title: "模板库",
                //     url: "/template",
                // },
                // {
                //     title: "创作社区",
                //     url: "/community",
                // },
                {
                    title: "提示词",
                    url: "/prompter",
                },
              
                // {
                //     title: "Settings",
                //     url: "#",
                // },
            ],
        },

        {
              title: "设置",
            url: "#",
            icon: Settings,
            isActive: true,
              items: [
                   {
                    title: "模型设置",
                    url: "/pushModel",
                },
              ]

        }
        // {
        //     title: "Models",
        //     url: "#",
        //     icon: Bot,
        //     items: [
        //         {
        //             title: "Genesis",
        //             url: "#",
        //         },
        //         {
        //             title: "Explorer",
        //             url: "#",
        //         },
        //         {
        //             title: "Quantum",
        //             url: "#",
        //         },
        //     ],
        // },
        // {
        //     title: "Documentation",
        //     url: "#",
        //     icon: BookOpen,
        //     items: [
        //         {
        //             title: "Introduction",
        //             url: "#",
        //         },
        //         {
        //             title: "Get Started",
        //             url: "#",
        //         },
        //         {
        //             title: "Tutorials",
        //             url: "#",
        //         },
        //         {
        //             title: "Changelog",
        //             url: "#",
        //         },
        //     ],
        // },
        // {
        //     title: "Settings",
        //     url: "#",
        //     icon: Settings2,
        //     items: [
        //         {
        //             title: "General",
        //             url: "#",
        //         },
        //         {
        //             title: "Team",
        //             url: "#",
        //         },
        //         {
        //             title: "Billing",
        //             url: "#",
        //         },
        //         {
        //             title: "Limits",
        //             url: "#",
        //         },
        //     ],
        // },
    ],
    navSecondary: [
        // {
        //     title: "Support",
        //     url: "#",
        //     icon: LifeBuoy,
        // },
        // {
        //     title: "Feedback",
        //     url: "#",
        //     icon: Send,
        // },
    ],
    projects: [
        // {
        //     name: "Design Engineering",
        //     url: "#",
        //     icon: Frame,
        // },
        // {
        //     name: "Sales & Marketing",
        //     url: "#",
        //     icon: PieChart,
        // },
        // {
        //     name: "Travel",
        //     url: "#",
        //     icon: Map,
        // },
    ],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {



    return (
        <Sidebar variant="inset" {...props} style={{backgroundColor:"#f5f5f5" }}>
            <SidebarHeader className="bg-white rounded-lg">
                <SidebarMenu >
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <div className="flex aspect-square w-8 h-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                                    <PenTool className="w-4 h-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">网文大神助手</span>
                                    <span className="truncate text-xs">0.5.1 Beta版</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent style={{backgroundColor:"#f5f5f5" }} className="">
                <NavMain items={data.navMain}   />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter   className="w-full p-2  flex justify-center items-center bg-white rounded-lg">
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}


