
'use client';
// React核心库和Hooks
import React, { useEffect, useMemo, useRef, useState, } from "react";
// 思维导图样式文件
import 'simple-mind-map/dist/simpleMindMap.esm.css';

// Lucide图标库 - 提供各种UI图标
import { FolderInput, Bold, Italic, Strikethrough, Underline, Plus, Trash2, Copy, Scissors, CopyPlus, ChevronsUpDown, ChevronsDownUp, Focus, ZoomIn, ZoomOut, Sparkles, ChevronRight, icons, X, LoaderCircle } from 'lucide-react';
// 自定义图标组件
import { Icon } from "@/components/Icon"



/************************ API接口组件 **********/
// 文档相关API接口
import { chatStream } from '@/app/api'
import type { ModelConfig } from "@/app/api"
/************************* UI组件导入 **********/
import Mention from "./Mention"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


// 下拉菜单相关组件
import { Dropdown, ColorDropdown, Trigger } from "@/components/ui/DropdownPro"
// Markdown渲染组件
import MarkdownRender from "@/components/MarkdownRender"
// 加载动画组件
import Loading from "@/components/Loading"

// 思维导图样式文件
import "./minmap.module.css"
// 思维导图相关工具函数
import { generateTreeWithRemark } from "./function"

// 思维导图布局类型图片资源
import verticalTimeline from "@/assets/images/verticalTimeline.jpg"
import catalogOrganization from "@/assets/images/catalogOrganization.jpg"
import fishbone from "@/assets/images/fishbone.jpg"
import logicalStructure from "@/assets/images/logicalStructure.jpg"
import mindMap from "@/assets/images/mindMap.jpg"
import organizationStructure from "@/assets/images/organizationStructure.jpg"
import timeline from "@/assets/images/timeline.jpg"
import timeline2 from "@/assets/images/timeline2.jpg"

import { SCALE_DESKTOP, SCALE_MOBILE, calc } from '@/app/config';
import useTheme from "@/hooks/useTheme"

import { useVw } from "@/hooks/useVwHv"
import { useWidthStore } from "@/store/usePanelWidth"

// 思维导图布局类型配置
// 定义了8种不同的思维导图布局样式，每种都有对应的图标
const layoutTypes = [
    { label: '逻辑结构', value: 'logicalStructure', icon: logicalStructure },
    { label: '思维导图', value: 'mindMap', icon: mindMap },
    { label: '组织结构', value: 'organizationStructure', icon: organizationStructure },
    { label: '目录组织', value: 'catalogOrganization', icon: catalogOrganization },
    { label: '时间线', value: 'timeline', icon: timeline },
    { label: '时间线2', value: 'timeline2', icon: timeline2 },
    { label: '垂直时间线', value: 'verticalTimeline', icon: verticalTimeline },
    { label: '鱼骨图', value: 'fishbone', icon: fishbone },
]

// 声明全局变量 - 扩展Window接口以支持SimpleMindMap
declare global {
    interface Window {
        SimpleMindMap: any;
    }
}

import { IMinMap } from "./Mention/function/types"


// 思维导图组件Props接口
interface MinMapProps {

    mindmap?: any;                    // 思维导图数据
    mentionData?: Array<IMinMap>;     // 提及思维导图数据
    setMindmapChapters?: Array<any>;     //  思维导图数据及章节
    prompters?: Array<any>;
    dataChange?: (data: any) => void; // 数据变化回调 
    modelConfig: ModelConfig;        // AI模型配置
}


/**
 * 思维导图组件
 * 提供完整的思维导图编辑功能，包括节点操作、样式设置、AI辅助等
 */
let tmeppanelWidth = 0
export default function MinMap({ mindmap, dataChange, modelConfig, mentionData = [], prompters = [], setMindmapChapters = [] }: MinMapProps) {
    const { theme } = useTheme()
    const [style, setStyle] = useState(theme)




    // 思维导图数据状态 - 包含完整的节点树结构
    const [mapData, setMapData] = useState(mindmap.content || { data: { text: '根节点' }, children: [] });

    // 客户端渲染标识 - 确保组件只在客户端渲染
    const [isClient, setIsClient] = useState(false);
    // 加载状态
    const [isLoading, setIsLoading] = useState(true);
    // 加载进度 (0-100)
    const [loadingProgress, setLoadingProgress] = useState(0);
    // 思维导图容器DOM引用
    const mindMapRef = useRef<HTMLDivElement>(null);
    // 思维导图实例引用
    const mindMapInstance = useRef<any>(null);

    // ==================== 节点操作面板相关状态 ====================
    // 节点激活面板显示状态
    const [panelVisible, setPanelVisible] = useState(false);
    // 面板位置坐标
    const [panelTop, setPanelTop] = useState(100);
    const [panelLeft, setPanelLeft] = useState(50);

    // 当前激活的节点列表
    const [activeNodes, setActiveNodes] = useState<Array<any>>([]);

    // ==================== 模态框状态管理 ====================
    // 备注模态框
    const [bookmarkModal, setBookmarkModal] = useState(false);
    const [bookmark, setBookmark] = useState('');

    // 标签相关状态
    const [tags, setTags] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [tabModal, setTabModal] = useState(false);
    const [tabValue, setTabValue] = useState('');

    // 超链接模态框
    const [liknModal, setLiknModal] = useState(false);
    const [liknValue, setLiknValue] = useState('');
    const [liknName, setLiknName] = useState('');

    // 图片上传模态框
    const [openImgModal, setOpenImgModal] = useState(false);
    const [imgUrl, setImgUrl] = useState('');
    const [fileListn, setFileListn] = useState<any>();

    // Markdown显示状态
    const [isShowMarkdown, setIsShowMarkdown] = useState(false);

    // ==================== 富文本工具栏状态 ====================
    // 工具栏显示状态
    const [showToolbar, setShowToolbar] = useState(false);
    // 工具栏位置坐标
    const [toolbarPosition, setToolbarPosition] = useState({ left: 0, top: 0 });
    // 格式化信息（粗体、斜体等状态）
    const [formatInfo, setFormatInfo] = useState<any>({});
    // 工具栏DOM引用
    const toolbarRef = useRef<HTMLDivElement>(null);
    // 隐藏工具栏的定时器引用
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ==================== 右键菜单状态 ====================
    // 右键菜单显示状态
    const [showContextMenu, setShowContextMenu] = useState(false);
    // 右键菜单位置坐标
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    // 当前选中的节点
    const [selectedNode, setSelectedNode] = useState<any>(null);
    // 右键菜单DOM引用
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // ==================== 剪贴板状态 ====================
    // 剪贴板数据
    const [clipboard, setClipboard] = useState<any>(null);
    // 剪贴板操作类型（复制/剪切）
    const [clipboardType, setClipboardType] = useState<'copy' | 'cut' | null>(null);

    // ==================== AI功能相关状态 ====================
    // AI对话框显示状态
    const [visible, setVisible] = useState(false);
    // AI生成的内容
    const [aiContent, setAiContent] = useState('');
    // AI请求加载状态
    const [loading, setLoading] = useState(false);
    // 是否显示"使用"按钮
    const [isShowUseBtn, setIsShowUseBtn] = useState(false);
    // AI输入框的值
    const [inputValue, setInputValue] = useState('');
    // 输入框禁用状态
    const [disabled, setDisabled] = useState(true);

    // 标记名称（创建文档按钮文本）
    const [markName, setMarkName] = useState('创建文档');


    const panelWidth = useWidthStore((s) => s.width);
    let vw = useVw(1)


     const cardWidth = useMemo(() => {

        if (!mindMapRef || !mindMapRef.current) return vw - panelWidth
        const offsetWidth = mindMapRef.current.offsetWidth;
         return  offsetWidth
        // 
        // const container = document.querySelector('.smm-mind-map-container');
        // const svg = container && container.querySelector('svg');

        // if (panelWidth !== 0) {
        //     tmeppanelWidth = panelWidth
        //     svg && svg.setAttribute('width', `${vw - tmeppanelWidth - 50}`);
        //     svg && svg.setAttribute('height', `${window.innerHeight}`);

        // }
 

        // if (panelWidth == 0) {
        //     console.log('------------offsetWidth-------', offsetWidth);
        //     console.log('------------tmeppanelWidth-------', tmeppanelWidth);
        //     // container && container.setAttribute('style', `transform: translate(-${(tmeppanelWidth)}px,${0}px);`);

        //     svg && svg.setAttribute('width', `${vw - 50}`);
        //     svg && svg.setAttribute('height', `${window.innerHeight}`);
        //     return offsetWidth + tmeppanelWidth
        // }
    }, [panelWidth])


    // ==================== 颜色配置 ====================
    // 预设文字颜色
    const presetColors = [
        '#ef4444', '#f97316', '#facc15', '#22c55e', "#232324",
        '#3b82f6', '#6366f1', '#a855f7', '#ec4899', 'rgba(255, 255, 255, 0.9)',
    ];

    // 预设背景颜色
    const backgroundColors = [
        "#eccc68", "#ffa502", "#70a1ff", "#5352ed", "#2f3542", "#2ed573"
    ]

    // ==================== 激活面板按钮配置 ====================
    // 定义节点激活时显示的操作按钮列表
    const activePanelBtnlist: Array<{ key: string, label: string, icon: keyof typeof icons, options?: Array<{ label: string, key: string, icon: keyof typeof icons, }> }> = [
        { key: "bookmark", label: "备注", icon: "Bookmark" },           // 添加备注 
        { key: "Link", label: "超链接", icon: "Link" },                 // 添加超链接
        { key: "tab", label: "标签", icon: "AlignHorizontalJustifyCenter" }, // 添加标签
        // { key: "image", label: "图片", icon: "Image" },              // 添加图片（已注释）
        { key: "GENER", label: "概要", icon: "Braces" },               // 添加概要
        { key: "Cable", label: "关联线", icon: "Cable" },               // 添加关联线
    ]




    // ==================== 富文本格式化功能 ====================
    /**
     * 格式化选中文本
     * @param format 格式化参数（如粗体、斜体等）
     */
    const formatText = (format: any) => {
        if (mindMapInstance.current && mindMapInstance.current.richText) {
            try {
                // 调用思维导图实例的富文本格式化方法
                mindMapInstance.current.richText.formatText(format);
                // 格式化后延迟隐藏工具栏
                scheduleHideToolbar();
            } catch (error) {
                console.error('Error in formatText:', error);
            }
        } else {
            console.error('MindMap instance or richText plugin not available');
        }
    };

    /**
     * 清除文本格式
     * 移除选中文本的所有格式化样式
     */
    const removeFormat = () => {
        if (mindMapInstance.current && mindMapInstance.current.richText) {
            try {
                // 调用思维导图实例的清除格式方法
                mindMapInstance.current.richText.removeFormat();
                // 清除格式后延迟隐藏工具栏
                scheduleHideToolbar();
            } catch (error) {
                console.error('Error in removeFormat:', error);
            }
        } else {
            console.error('MindMap instance or richText plugin not available');
        }
    };

    /**
     * 延迟隐藏工具栏
     * 设置200ms后自动隐藏富文本工具栏
     */
    const scheduleHideToolbar = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
            setShowToolbar(false);
        }, 200);
    };

    /**
     * 取消隐藏工具栏
     * 清除隐藏工具栏的定时器
     */
    const cancelHideToolbar = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // ==================== 标签管理功能 ====================


    /**
     * 移除标签
     * @param removeTag 要移除的标签名称
     */
    function removeTag(removeTag: string) {
        const newTags = tags.filter((tag) => tag !== removeTag);
        setTags(newTags);
    }

    // ==================== Effect Hooks ====================
    /**
     * 监听外部传入的mindmap数据变化
     * 当props中的mindmap数据更新时，同步更新本地状态
     */
    useEffect(() => {
        if (mindmap) {
            setMapData(mindmap.content);
        }
    }, [mindmap]);

    /**
     * 确保只在客户端运行
     * 设置客户端渲染标识，避免服务端渲染问题
     */
    useEffect(() => {
        setIsClient(true);

        const setVars = () => {
            const vw = window.innerWidth;
            const isMobile = vw < 640;

            const ratio = isMobile ? SCALE_MOBILE : SCALE_DESKTOP;

            /* 文字大小 */
            const fs = calc(vw, ratio);

            /* 元素间距/内边距/圆角 = 字体倍数 */
            const gap = fs * 0.5;   // 元素之间
            const px = fs * 0.7;   // 左右 padding
            const py = fs * 0.4;   // 上下 padding
            const br = fs * 0.3;   // 圆角
            const iw = fs * 1.1;   // 图标宽度
            const ih = fs * 1.1;   // 图标高度
            const panelW = vw * (isMobile ? 0.92 : 0.45); // 整体宽度

            const root = document.documentElement;
            root.style.setProperty('--fs', `${fs}px`);
            root.style.setProperty('--gap', `${gap}px`);
            root.style.setProperty('--px', `${px}px`);
            root.style.setProperty('--py', `${py}px`);
            root.style.setProperty('--br', `${br}px`);
            root.style.setProperty('--iw', `${iw}px`);
            root.style.setProperty('--ih', `${ih}px`);
            root.style.setProperty('--panelW', `${panelW}px`);
        };

        setVars();
        window.addEventListener('resize', setVars);
        return () => window.removeEventListener('resize', setVars);

    }, []);


    useEffect(() => {
        setStyle(theme);
    }, [theme]);


    /**
     * 思维导图初始化Effect
     * 负责创建和配置思维导图实例，包括插件注册、事件监听等
     */
    useEffect(() => {
        // 确保只在客户端执行
        if (!isClient) return;

        /**
         * 异步初始化思维导图
         * 包含完整的初始化流程：验证、清理、导入、配置、创建实例
         */
        const initMindMap = async () => {
            try {
                // 开始加载流程
                setIsLoading(true);
                setLoadingProgress(10);

                // 验证DOM容器是否存在
                if (!mindMapRef.current) {
                    console.error('Container element not found');
                    setIsLoading(false);
                    return;
                }

                // 验证思维导图数据是否存在
                if (!mapData) {
                    console.error('Map data not found');
                    setIsLoading(false);
                    return;
                }

                // 清理之前的实例，避免内存泄漏
                if (mindMapInstance.current && typeof mindMapInstance.current.destroy === 'function') {
                    mindMapInstance.current.destroy();
                    mindMapInstance.current = null;
                }

                setLoadingProgress(20);


                // ==================== 动态导入模块 ====================
                setLoadingProgress(30);
                // 导入思维导图核心模块
                const MindMapModule = await import('simple-mind-map');
                const MindMap = MindMapModule.default;

                setLoadingProgress(40);
                // 导入拖拽功能插件
                // @ts-ignore
                const DragModule = await import('simple-mind-map/src/plugins/Drag.js');
                const Drag = DragModule.default;

                // 导入富文本编辑插件
                // @ts-ignore
                const RichTextModule = await import('simple-mind-map/src/plugins/RichText.js');
                const RichText = RichTextModule.default;

                setLoadingProgress(50);
                // 导入选择功能插件
                // @ts-ignore
                const SelectModule = await import('simple-mind-map/src/plugins/Select.js');
                const Select = SelectModule.default;

                // 导入关联线功能插件
                // @ts-ignore
                const AssociativeLineModule = await import('simple-mind-map/src/plugins/AssociativeLine.js');
                const AssociativeLine = AssociativeLineModule.default;

                // 导入键盘导航插件
                // @ts-ignore
                const KeyboardNavigationModule = await import('simple-mind-map/src/plugins/KeyboardNavigation.js');
                const KeyboardNavigation = KeyboardNavigationModule.default;

                // 导入触摸事件插件
                // @ts-ignore
                const TouchEventModule = await import('simple-mind-map/src/plugins/TouchEvent.js');
                const TouchEvent = TouchEventModule.default;

                // 导入节点图片调整插件
                // @ts-ignore
                const NodeImgAdjustModule = await import('simple-mind-map/src/plugins/NodeImgAdjust.js');
                const NodeImgAdjust = NodeImgAdjustModule.default;

                // 导入彩虹线条插件
                // @ts-ignore
                const RainbowLinesModule = await import('simple-mind-map/src/plugins/RainbowLines.js');
                const RainbowLines = RainbowLinesModule.default;

                // 导入外框插件
                // @ts-ignore
                const OuterFrameModule = await import('simple-mind-map/src/plugins/OuterFrame.js');
                const OuterFrame = OuterFrameModule.default;

                // 导入导出功能插件
                // @ts-ignore
                const ExportModule = await import('simple-mind-map/src/plugins/Export.js');
                const Export = ExportModule.default;

                // 导入XMind格式导出插件
                // @ts-ignore
                const ExportXMindModule = await import('simple-mind-map/src/plugins/ExportXMind.js');
                const ExportXMind = ExportXMindModule.default;

                // 导入PDF导出插件
                // @ts-ignore
                const ExportPDFModule = await import('simple-mind-map/src/plugins/ExportPDF.js');
                const ExportPDF = ExportPDFModule.default;

                setLoadingProgress(60);
                // ==================== 注册插件 ====================
                // 按功能分类注册各种插件，扩展思维导图功能

                // 导出功能插件
                MindMap.usePlugin(ExportPDF);      // PDF导出
                MindMap.usePlugin(ExportXMind);    // XMind格式导出
                MindMap.usePlugin(Export);         // 通用导出

                // 基础交互插件
                MindMap.usePlugin(Drag);           // 拖拽功能
                MindMap.usePlugin(RichText);       // 富文本编辑
                MindMap.usePlugin(Select);         // 选择功能

                // 高级功能插件
                MindMap.usePlugin(AssociativeLine);     // 关联线
                MindMap.usePlugin(KeyboardNavigation);  // 键盘导航
                MindMap.usePlugin(TouchEvent);          // 触摸事件
                MindMap.usePlugin(NodeImgAdjust);       // 节点图片调整
                MindMap.usePlugin(RainbowLines);        // 彩虹线条
                MindMap.usePlugin(OuterFrame);          // 外框功能

                setLoadingProgress(70);



                // 验证MindMap构造函数是否成功导入
                if (!MindMap) {
                    throw new Error('MindMap constructor not found');
                }

                // ==================== 数据清理函数 ====================
                /**
                 * 清理节点数据，移除可能导致循环引用的属性
                 * 确保数据结构符合思维导图要求，防止渲染错误
                 * @param node 要清理的节点数据
                 * @param visited 已访问节点集合，用于防止循环引用
                 * @returns 清理后的节点数据
                 */
                const cleanNodeData = (node: any, visited = new Set()): any => {
                    if (!node || !node.data) return null;

                    // 防止循环引用 - 检查节点是否已被访问
                    const nodeId = node.data.uid || node.data.text || Math.random().toString();
                    if (visited.has(nodeId)) {
                        console.warn('Circular reference detected, skipping node:', nodeId);
                        return null;
                    }
                    visited.add(nodeId);

                    // 创建清理后的节点数据结构
                    const cleaned: any = {
                        data: {
                            text: String(node.data.text || ''),                    // 节点文本
                            expand: Boolean(node.data.expand !== false),           // 展开状态
                            richText: Boolean(node.data.richText || false),        // 富文本标识
                            uid: String(node.data.uid || Math.random().toString(36).substr(2, 9)) // 唯一标识
                        }
                    };

                    // 保留所有扩展属性 - 按功能分类
                    const extendedProps = [
                        'image', 'imageTitle', 'imageSize',                      // 图片相关属性
                        'icon',                                                  // 图标属性
                        'hyperlink', 'hyperlinkTitle',                          // 超链接属性
                        'note',                                                  // 备注属性
                        'tag',                                                   // 标签属性
                        'generalization',                                        // 概要属性
                        'associativeLine',                                       // 关联线基础属性
                        'associativeLineTargets',                               // 关联线目标
                        'associativeLineTargetControlOffsets',                  // 关联线控制点偏移
                        'associativeLinePoint',                                 // 关联线点位
                        'fillColor', 'fontColor', 'borderColor', 'borderWidth', 'fontSize', // 样式属性
                        'shape',                                                 // 形状属性
                        'paddingX', 'paddingY',                                 // 内边距属性
                        'isActive'                                               // 激活状态
                    ];

                    // 复制扩展属性到清理后的数据中
                    extendedProps.forEach(prop => {
                        if (node.data[prop] !== undefined && node.data[prop] !== null) {
                            cleaned.data[prop] = node.data[prop];
                        }
                    });

                    // 递归处理子节点
                    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                        const cleanedChildren = node.children
                            .map((child: any) => cleanNodeData(child, new Set(visited)))
                            .filter((child: any) => child !== null);
                        cleaned.children = cleanedChildren;
                    } else {
                        cleaned.children = [];
                    }

                    return cleaned;
                };

                // 执行数据清理
                const cleanData = cleanNodeData(mapData);

                setLoadingProgress(80);

                // ==================== 创建思维导图实例 ====================
                /**
                 * 使用清理后的数据和配置创建思维导图实例
                 * 包含完整的主题配置、功能设置等
                 */
                mindMapInstance.current = new MindMap({
                    el: mindMapRef.current,              // DOM容器元素
                    data: cleanData,                     // 清理后的节点数据
                    layout: 'logicalStructure',         // 默认布局类型
                    theme: 'default',                   // 默认主题

                    // 主题配置 - 定义思维导图的视觉样式
                    themeConfig: {
                        lineWidth: 4,                                    // 连接线宽度
                        backgroundColor: 'var(--color-bg-5)',           // 背景颜色
                        associativeLineColor: '#FA28FF',                // 关联线颜色
                        associativeLineWidth: 4,                       // 关联线宽度
                        associativeLineActiveColor: '#9F0500',         // 激活关联线颜色
                        associativeLineActiveWidth: 6,                 // 激活关联线宽度

                        // 根节点样式配置
                        root: {
                            fillColor: 'rgb(207, 44, 44)',             // 填充颜色
                            color: 'rgb(255, 233, 157)',               // 文字颜色
                            borderColor: 'var(--color-success)',       // 边框颜色
                            borderWidth: 0,                            // 边框宽度
                            fontSize: 24,                              // 字体大小
                            bookmarkColor: 'rgb(255, 255, 255)',       // 书签颜色
                        },
                        // 二级节点样式配置
                        second: {
                            fillColor: "#4DD164",                      // 填充颜色
                            color: 'var(--color-text-1)',              // 文字颜色
                            borderColor: 'var(--color-success)',       // 边框颜色
                            borderWidth: 2,                            // 边框宽度
                            fontSize: 18,                              // 字体大小
                            bookmarkColor: 'rgb(255, 255, 255)',       // 书签颜色
                        },
                        // 三级及以下节点样式配置
                        node: {
                            fillColor: "#1FA935",                      // 填充颜色
                            fontSize: 18,                              // 字体大小
                            color: '#fff',                             // 文字颜色
                        },
                        // 概要节点样式（已注释）
                        // generalization: {
                        //     fontSize: 14,
                        //     fillColor: 'rgb(255, 247, 211)',
                        //     borderColor: 'rgb(255, 202, 162)',
                        //     borderWidth: 2,
                        //     color: 'var(--color-text-1)',
                        // }
                    },

                    // 功能配置
                    enableFreeDrag: false,                         // 禁用自由拖拽
                    // @ts-ignore
                    watermark: {
                        show: false                                 // 隐藏水印
                    },
                    // 彩虹线条配置
                    rainbowLinesConfig: {
                        open: false,                                // 关闭彩虹线条
                        colorsList: [                               // 彩虹线条颜色列表
                            '#99CC33',
                            '#FF9900',
                            '#339933',
                            '#99CC00',
                            '#CCCC66',
                            '#99CCFF',
                            '#FFFF00'
                        ]
                    }
                });


                setLoadingProgress(90);


                // ==================== 事件监听器注册 ====================
                /**
                 * 注册各种事件监听器，用于响应用户交互和状态变化
                 */

                // ==================== 右键菜单事件处理 ====================
                /**
                 * 处理画布右键菜单的显示逻辑
                 * 通过鼠标按下和释放的位置差异判断是否为有效点击
                 */
                let mousedownX = 0;     // 鼠标按下时的X坐标
                let mousedownY = 0;     // 鼠标按下时的Y坐标
                let isMousedown = false; // 鼠标按下状态标识

                // 监听SVG画布鼠标按下事件（右键）
                mindMapInstance.current.on('svg_mousedown', (e: MouseEvent) => {
                    if (e.which !== 3) {    // 只处理右键（按键码3）
                        return;
                    }
                    mousedownX = e.clientX;  // 记录按下位置
                    mousedownY = e.clientY;
                    isMousedown = true;
                });

                // 监听鼠标释放事件
                mindMapInstance.current.on('mouseup', (e: MouseEvent) => {
                    if (!isMousedown) return;

                    isMousedown = false;
                    // 如果鼠标松开和按下的距离大于3像素，则不认为是点击事件
                    if (
                        Math.abs(mousedownX - e.clientX) > 3 ||
                        Math.abs(mousedownY - e.clientY) > 3
                    ) {
                        setShowContextMenu(false);
                        return;
                    }
                    // 显示右键菜单
                    setSelectedNode(null);
                    setContextMenuPosition({ x: e.clientX + 10, y: e.clientY + 10 });
                    setShowContextMenu(true);
                    setPanelVisible(false);;
                });

                // ==================== 菜单隐藏事件处理 ====================
                /**
                 * 监听各种点击事件来隐藏右键菜单
                 */

                // 节点点击时隐藏右键菜单
                mindMapInstance.current.on('node_click', () => {
                    setShowContextMenu(false);
                });

                // 画布空白区域点击时隐藏右键菜单
                mindMapInstance.current.on('draw_click', () => {
                    setShowContextMenu(false);
                });

                // 展开/折叠按钮点击时隐藏右键菜单并显示面板
                mindMapInstance.current.on('expand_btn_click', () => {
                    setShowContextMenu(false);
                    setPanelVisible(true);
                });

                // ==================== 富文本编辑事件处理 ====================
                /**
                 * 监听富文本选择变化事件，控制格式化工具栏的显示
                 * @param hasRange 是否有选中的文本范围
                 * @param rect 选中文本的位置信息
                 * @param formatInfo 当前选中文本的格式信息
                 */
                // @ts-ignore
                mindMapInstance.current.on('rich_text_selection_change', (hasRange, rect, formatInfo) => {
                    if (hasRange && rect) {
                        // 取消之前的隐藏计时器
                        cancelHideToolbar();

                        // 计算工具栏位置 - 在选中文本上方居中显示
                        const left = rect.left + rect.width / 2;
                        const top = rect.top - 60;

                        setToolbarPosition({ left, top });
                        setFormatInfo(formatInfo || {});  // 设置当前格式信息
                        setShowToolbar(true);             // 显示格式化工具栏
                    } else {
                        // 延迟隐藏而不是立即隐藏，避免频繁闪烁
                        scheduleHideToolbar();
                    }
                })

                // ==================== 节点激活事件处理 ====================
                /**
                 * 监听节点激活事件，显示节点属性编辑面板
                 * 当用户点击或选中节点时触发
                 * @param node 激活的节点对象
                 * @param activeNodeList 所有激活节点的列表
                 */
                mindMapInstance.current.on('node_active', (node: any, activeNodeList: any[]) => {
                    // 如果没有激活的节点，隐藏面板并清空状态
                    if (!node) {
                        setPanelVisible(false);
                        // 清空所有编辑状态
                        setBookmark('');
                        setTags([]);
                        setLiknValue('');
                        setLiknName('');
                        setImgUrl('');
                        return
                    }

                    // ==================== 文档标记处理 ====================
                    /**
                     * 检查当前节点是否已关联文档，设置相应的标记状态
                     */
                    // @ts-ignore
                    // let res = mindmap?.map_mark.find((item) => node.nodeData.data.uid === item.nodeId)
                    // if (res) {
                    //     setMarkName('打开文档')    // 节点已有关联文档
                    //     console.log('监听节点激活事件:--------', res);
                    // } else {
                    //     setMarkName('创建文档')    // 节点未关联文档
                    // }

                    // 更新激活节点列表
                    setActiveNodes(activeNodeList)

                    // ==================== 节点数据回显 ====================
                    /**
                     * 将节点的属性数据回显到编辑面板中
                     * 包括备注、标签、超链接、图片等信息
                     */
                    const nodeData = node.nodeData.data;
                    if (nodeData) {
                        // 调试：打印节点数据结构 

                        // 回显备注信息
                        if (nodeData.note) {
                            setBookmark(nodeData.note);
                        } else {
                            setBookmark('');
                        }

                        // 回显标签信息
                        if (nodeData.tag && Array.isArray(nodeData.tag)) {
                            // @ts-ignore
                            setTags([...nodeData.tag]);

                        } else {
                            setTags([]);
                        }

                        // 回显超链接URL
                        if (nodeData.hyperlink) {
                            setLiknValue(nodeData.hyperlink);
                        } else {
                            setLiknValue('');
                        }

                        // 回显超链接标题
                        if (nodeData.hyperlinkTitle) {
                            setLiknName(nodeData.hyperlinkTitle);
                        } else {
                            setLiknName('');
                        }

                        // 回显图片信息 - 尝试多种可能的字段名
                        if (nodeData.image) {
                            setImgUrl(nodeData.image);
                        } else if (nodeData.img) {
                            setImgUrl(nodeData.img);
                        } else if (nodeData.imageData) {
                            setImgUrl(nodeData.imageData.url || nodeData.imageData);
                        } else {
                            setImgUrl('');
                        }
                    }

                    // ==================== 面板位置计算 ====================
                    /**
                     * 根据节点位置计算编辑面板的显示位置
                     * 确保面板在屏幕可视范围内
                     */
                    const nodeRect = node.getRect();
                    if (nodeRect) {
                        // 面板尺寸配置
                        const panelWidth = 200;  // 面板最小宽度
                        const panelHeight = 300; // 估计面板高度

                        // 默认在节点右侧显示
                        let left = nodeRect.x + nodeRect.width + 20;
                        let top = nodeRect.y;

                        // 检查右边界 - 如果超出屏幕右边，则显示在左侧
                        if (left + panelWidth > window.innerWidth) {
                            left = nodeRect.x - panelWidth - 20;
                        }

                        // 检查下边界 - 如果超出屏幕底部，则向上调整
                        if (top + panelHeight > window.innerHeight) {
                            top = window.innerHeight - panelHeight - 20;
                        }

                        // 检查上边界 - 确保不超出屏幕顶部
                        if (top < 20) {
                            top = 20;
                        }

                        // 检查左边界 - 确保不超出屏幕左侧
                        if (left < 20) {
                            left = 20;
                        }

                        // 设置面板位置
                        setPanelTop(top);
                        setPanelLeft(left);
                    }

                    // 显示编辑面板
                    setPanelVisible(true);
                })

                // ==================== 节点右键菜单事件 ====================
                /**
                 * 监听节点右键菜单事件，显示节点特定的上下文菜单
                 * @param e 鼠标事件对象
                 * @param node 右键点击的节点对象
                 */
                mindMapInstance.current.on('node_contextmenu', (e: MouseEvent, node: any) => {
                    e.preventDefault();
                    setSelectedNode(node);
                    setContextMenuPosition({ x: e.clientX + 10, y: e.clientY + 10 });
                    setShowContextMenu(true);
                    // 隐藏属性编辑面板
                    setPanelVisible(false);
                });

                // ==================== 节点激活前事件 ====================
                /**
                 * 监听节点激活前事件，可用于预处理或验证
                 * @param activeNodeList 即将激活的节点列表
                 */
                mindMapInstance.current.on('before_node_active', (activeNodeList: any[]) => {
                    // console.log("------------before_node_active--------------------");
                    // console.log(activeNodeList);
                    // console.log("--------------------------------");
                })

                // ==================== 数据变化事件 ====================
                /**
                 * 监听思维导图数据变化事件，同步数据到外部
                 * 当节点增删改时触发，用于数据持久化
                 * @param data 变化后的完整数据结构
                 */
                mindMapInstance.current.on('data_change', (data: any) => {
                    if (dataChange) {
                        dataChange({
                            ...mindmap,
                            content: data
                        });  // 调用外部数据变化回调
                    }
                })

                // ==================== 初始化完成 ====================




                /**
                 * 思维导图初始化完成，隐藏加载状态
                 */
                setLoadingProgress(100);

                setTimeout(() => {
                    setIsLoading(false);  // 延迟隐藏加载动画，提供更好的用户体验 
                    if (mindMapInstance.current) {
                        // mindMapInstance.current.view.fit();
                         mindMapInstance.current.view.translateXY(-500, 0);
                    }

                }, 500);


            } catch (error) {
                // ==================== 错误处理 ====================
                /**
                 * 思维导图初始化失败时的错误处理
                 * 记录详细错误信息并停止加载状态
                 */
                console.error('=== Error initializing MindMap ===');
                console.error('Error:', error);
                // @ts-ignore
                console.error('Error message:', error.message);
                // @ts-ignore
                console.error('Error stack:', error.stack);
                setIsLoading(false);
            }
        };

        // 延迟初始化，确保DOM已完全渲染
        const timer = setTimeout(initMindMap, 1000);
        return () => clearTimeout(timer);
    }, [isClient, mapData]);

    // ==================== 右键菜单操作函数 ====================
    /**
     * 处理右键菜单的各种操作：添加同级节点、子节点、删除节点等
     */

    /**
     * 添加同级节点
     * 在当前选中节点的同一层级添加新节点
     */
    const handleAddSibling = () => {
        if (selectedNode && mindMapInstance.current) {
            try {
                // 创建新节点数据结构
                const newNodeData = {
                    text: '新节点',                                    // 默认节点文本
                    expand: true,                                    // 默认展开状态
                    richText: false,                                 // 非富文本模式
                    uid: Math.random().toString(36).substr(2, 9)     // 生成唯一标识
                };
                mindMapInstance.current.execCommand('INSERT_NODE', false, [selectedNode], newNodeData);
                setShowContextMenu(false);  // 隐藏右键菜单
            } catch (error) {
                console.error('Error adding sibling node:', error);
                setShowContextMenu(false);
            }
        }
    };

    /**
     * 添加子节点
     * 在当前选中节点下添加子节点
     */
    const handleAddChild = () => {
        if (selectedNode && mindMapInstance.current) {
            try {
                // 创建新子节点数据结构
                const newNodeData = {
                    text: '新子节点',                                // 默认子节点文本
                    expand: true,                                    // 默认展开状态
                    richText: false,                                 // 非富文本模式
                    uid: Math.random().toString(36).substr(2, 9)     // 生成唯一标识
                };
                mindMapInstance.current.execCommand('INSERT_CHILD_NODE', false, [selectedNode], newNodeData);
                setShowContextMenu(false);  // 隐藏右键菜单
            } catch (error) {
                console.error('Error adding child node:', error);
                setShowContextMenu(false);
            }
        }
    };

    /**
     * 删除节点
     * 删除当前选中的节点（根节点除外）
     */
    const handleDeleteNode = () => {
        if (selectedNode && mindMapInstance.current) {
            try {
                // 检查是否为根节点 - 根节点不能删除
                if (selectedNode.isRoot) {
                    console.warn('Cannot delete root node');
                    setShowContextMenu(false);
                    return;
                }
                mindMapInstance.current.execCommand('REMOVE_NODE', false, [selectedNode]);
                setShowContextMenu(false);  // 隐藏右键菜单
            } catch (error) {
                console.error('Error deleting node:', error);
                setShowContextMenu(false);
            }
        }
    };

    /**
     * 展开所有节点
     * 将思维导图中的所有节点展开显示
     */
    const handleExpandAll = () => {
        if (mindMapInstance.current) {
            mindMapInstance.current.execCommand('EXPAND_ALL');
            setShowContextMenu(false);  // 隐藏右键菜单
        }
    };

    /**
     * 折叠所有节点
     * 将思维导图中的所有节点折叠隐藏
     */
    const handleCollapseAll = () => {
        if (mindMapInstance.current) {
            mindMapInstance.current.execCommand('UNEXPAND_ALL');
            setShowContextMenu(false);  // 隐藏右键菜单
        }
    };

    /**
     * 适应视图
     * 调整思维导图的缩放和位置以适应容器大小
     */
    const handleFitView = () => {
        if (mindMapInstance.current) {
            mindMapInstance.current.view.fit();
            setShowContextMenu(false);  // 隐藏右键菜单
        }
    };

    // ==================== 工具函数：UUID生成 ====================
    /**
     * 生成UUID v4格式的唯一标识符
     * @returns {string} 返回格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx 的UUID字符串
     */
    function uuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;           // 生成0-15的随机数
            const v = c === 'x' ? r : (r & 0x3) | 0x8;    // x位置用随机数，y位置用特定格式
            return v.toString(16);                        // 转换为16进制字符
        });
    }

    // ==================== 树节点深拷贝工具 ====================
    /**
     * 树节点接口定义
     * @template T 节点数据类型
     */
    interface TreeNode<T = any> {
        data: T & { uid?: string };     // 节点数据，包含可选的uid字段
        children?: TreeNode<T>[];       // 子节点数组
    }

    /**
     * 深拷贝树节点并为每个节点注入新的uid
     * 用于复制/剪切操作，确保每个节点都有唯一标识
     * @param {TreeNode<T>} node 要拷贝的源节点
     * @returns {TreeNode<T>} 深拷贝后的新节点树
     */
    function cpnode<T>(node: TreeNode<T>): TreeNode<T> {
        if (!node) return null as any;

        // 1. 深度拷贝当前节点数据（避免共享引用）
        const copy: TreeNode<T> = {
            data: { ...node.data, uid: uuid() },    // 展开原数据并注入新的uid
            children: []                            // 初始化空的子节点数组
        };

        // 2. 递归拷贝所有子节点
        if (Array.isArray(node.children)) {
            copy.children = node.children.map(cpnode);  // 递归调用确保深拷贝
        }

        return copy;
    }


    // ==================== 剪贴板操作功能 ====================

    /**
     * 复制节点功能
     * 将选中的节点及其子树复制到剪贴板，不删除原节点
     */
    const handleCpoyChild = () => {
        let copyNode = null;
        if (!selectedNode || !mindMapInstance.current) {
            console.warn('没有选中的节点或思维导图实例不存在');
            return;
        }

        try {
            // 获取完整的节点数据并进行深拷贝
            copyNode = cpnode(selectedNode.nodeData);

            if (!copyNode) {
                console.error('无法获取节点数据');
                return;
            }

            // 存储到剪贴板状态
            setClipboard(copyNode);          // 保存节点数据
            setClipboardType('copy');        // 标记为复制操作
            setShowContextMenu(false);       // 隐藏右键菜单
        } catch (error) {
            console.error('复制节点失败:', error);
        }
    }

    /**
     * 剪切节点功能
     * 将选中的节点及其子树移动到剪贴板，删除原节点
     */
    const handleScissorsChild = () => {
        if (!selectedNode || !mindMapInstance.current) {
            console.warn('没有选中的节点或思维导图实例不存在');
            return;
        }

        // 根节点不能被剪切
        if (selectedNode.isRoot) {
            console.warn('不能剪切根节点');
            return;
        }

        try {
            let copyNode = null;
            // 获取完整的节点数据并进行深拷贝
            copyNode = cpnode(selectedNode.nodeData);

            if (!copyNode) {
                console.error('无法获取节点数据');
                return;
            }

            // 存储到剪贴板状态
            setClipboard(copyNode);          // 保存节点数据
            setClipboardType('cut');         // 标记为剪切操作

            // 从思维导图中删除原节点
            mindMapInstance.current.execCommand('REMOVE_NODE', false, [selectedNode]);
            setShowContextMenu(false);       // 隐藏右键菜单
        } catch (error) {
            console.error('剪切节点失败:', error);
        }
    }

    /**
     * 粘贴节点功能
     * 将剪贴板中的节点粘贴为当前选中节点的子节点
     */
    const handleStickupChild = () => {
        if (!clipboard || !mindMapInstance.current) {
            console.warn('剪贴板为空或思维导图实例不存在');
            return;
        }

        try {
            let targetNode = selectedNode;

            // 如果没有选中节点，则粘贴到根节点下
            if (!targetNode) {
                targetNode = mindMapInstance.current.renderer.root;
            }

            // 执行粘贴操作：将剪贴板内容作为子节点插入
            mindMapInstance.current.execCommand('INSERT_CHILD_NODE', false, [], {
                uid: clipboard.data.uid,        // 使用剪贴板中的节点ID
                text: clipboard.data.text,      // 使用剪贴板中的节点文本
            }, clipboard.children);             // 包含所有子节点

            setShowContextMenu(false);          // 隐藏右键菜单
        } catch (error) {
            console.error('粘贴节点失败:', error);
        }
    }

    /**
     * 处理思维导图导出下载功能
     * 支持多种格式：PDF、PNG、Markdown、XMind
     * @param {string} key 导出格式类型
     */
    const handleDownload = (key: string) => {
        if (!mindMapInstance.current) return

        // 根据不同格式执行相应的导出操作
        switch (key) {
            case 'pdf':
                mindMapInstance.current.export(key, true, mapData.title)  // 导出为PDF格式
                break;
            case 'png':
                mindMapInstance.current.export(key, true, mapData.title)  // 导出为PNG图片
                break;
            case 'md':
                mindMapInstance.current.export(key, true, mapData.title)  // 导出为Markdown文档
                break;
            case 'xmind':
                mindMapInstance.current.export(key, true, mapData.title)  // 导出为XMind格式
        }

        setShowContextMenu(false);  // 隐藏右键菜单
    }

    /**
     * 设置思维导图布局类型
     * @param {string} layout 布局类型（如：mindMap、logicalStructure等）
     */
    const setLayout = (layout: string) => {
        if (mindMapInstance.current) {
            mindMapInstance.current.setLayout(layout);  // 应用新的布局样式
        }
    }


    // ==================== AI功能相关 ====================

    /**
     * 处理AI聊天发送功能
     * 基于当前思维导图内容和用户输入生成AI回复
     */
    const handleSend = (value: string, selectedNode: any) => {
        // 请根据以下内容生成小说内容。脑洞
        if (loading || value == "") return
        const list = [...new Map(selectedNode.map((item: any) => [item.id, item])).values()];
   
   
        let related = ""
        for (let i = 0; i < list.length; i++) {
            let item: any = list[i]
            related += `<${item.title}>
                    ${item.content}
                 </${item.title}> \n`
        }
 
        

        let prompte = `<用户需求>${value}</用户需求>  <AI回复>
            1. 直接回答不要出现 好的xxxx或者分析xxxx之类的词，这样会让人感到不舒服。
            2. 必须以 [# H1 -> ###### H6] H1~H6 的层级关系，如果超出层级关系 使用 “ -” 无序列表。 </AI回复> 
            <关联内容>${related}</关联内容>
        `

        setLoading(true)        // 开始加载状态
        setIsShowUseBtn(false)  // 隐藏使用按钮
        setAiContent("")        // 清空AI内容


        // 获取当前思维导图的根节点数据
        const { root } = mindMapInstance.current.getData({ withConfig: false })

        // 构建AI提示词，结合用户输入和思维导图内容  
        let str = ""                        // 累积AI回复内容

        // 调用流式聊天API 
        chatStream({
            message: prompte,
            ...modelConfig,
            onData: (stream: string) => {
                // 流式接收AI回复内容
                str += `${stream} \n`
                setAiContent(str)           // 实时更新AI内容显示
                // @ts-ignore
            },
            onError: (err: any) => {
                // 错误处理
                setIsShowUseBtn(false)
                setLoading(false)
                setAiContent("请求失败，请选择其他AI模型或稍后重试。")
            },
            onComplete: () => {
                // 完成回调
                setIsShowUseBtn(true)       // 显示使用按钮
                setLoading(false)           // 结束加载状态
            },
        })
    }

    /**
     * 处理使用AI生成内容功能
     * 将AI生成的内容解析为思维导图节点并添加到当前导图中
     */
    const handleUseContent = () => {
        // 将AI生成的Markdown内容解析为树形结构
        let dataTree = generateTreeWithRemark(aiContent)

        // 获取当前思维导图的根节点
        const { root } = mindMapInstance.current.getData({ withConfig: false })

        // 将解析后的树节点添加到根节点的子节点中
        dataTree?.children.forEach((item, index) => {
            root.children.push(item)        // 逐个添加新的子节点
        })

        // 更新思维导图数据并重置相关状态
        mindMapInstance.current.setData(root)    // 应用新的数据到思维导图
        setInputValue("")                       // 清空输入框
        setAiContent("")                        // 清空AI内容
        setIsShowUseBtn(false)                   // 隐藏使用按钮
        setVisible(false)                        // 隐藏AI对话框
    }

    // ==================== 模态框操作函数 ====================

    /**
     * 打开备注模态框
     * 读取当前激活节点的备注信息并显示编辑界面
     */
    const openBookmarkModal = () => {
        activeNodes.forEach(node => {
            if (node.nodeData.data.note) setBookmark(node.nodeData.data.note)  // 设置现有备注内容
        })
        setBookmarkModal(true)  // 显示备注模态框
    }

    /**
     * 打开标签模态框
     * 读取当前激活节点的标签信息并显示编辑界面
     */
    const openTabModal = () => {
        activeNodes.forEach(node => {
            if (node.nodeData.data.tag) setTags(node.nodeData.data.tag)  // 设置现有标签内容
        })
        setTabModal(true)  // 显示标签模态框
    }

    /**
     * 打开超链接模态框
     * 读取当前激活节点的超链接信息并显示编辑界面
     */
    const openLiknModal = () => {
        activeNodes.forEach(node => {

            // 设置超链接地址
            if (node.nodeData.data.hyperlink) {
                setLiknValue(node.nodeData.data.hyperlink);
            }

            // 设置超链接标题
            if (node.nodeData.data.hyperlinkTitle) {
                setLiknName(node.nodeData.data.hyperlinkTitle);
            }

        })

        setLiknModal(true)  // 显示超链接模态框
    }

    /**
     * 打开图片模态框
     * 读取当前激活节点的图片信息并显示编辑界面
     */
    const handleOpenImgModal = () => {
        activeNodes.forEach(node => {
            if (node.nodeData.data.image) setImgUrl(node.nodeData.data.image)  // 设置现有图片URL
        })
        setOpenImgModal(true)  // 显示图片模态框
    }

    /**
     * 处理图片模态框关闭
     * 重置图片相关状态并关闭模态框
     */
    const handleImgModal = () => {
        setFileListn([])            // 清空文件列表
        setImgUrl("")              // 清空图片URL
        setOpenImgModal(false)      // 关闭图片模态框
    }

    /**
     * 处理超链接模态框取消
     * 重置超链接相关状态并关闭模态框
     */
    const handleCancelModal = () => {
        setLiknValue("")           // 清空链接地址
        setLiknName("")            // 清空链接名称
        setLiknModal(false)         // 关闭超链接模态框
    }

    /**
     * 处理保存超链接
     * 将超链接信息应用到激活的节点上
     */
    const handleSevaLike = () => {
        if (liknValue) {
            activeNodes.forEach(node => {
                node.setHyperlink(liknValue, '名称')  // 为节点设置超链接
            })

            setLiknValue("")       // 清空链接地址
            setLiknModal(false)     // 关闭超链接模态框
        }
    }

    /**
     * 处理保存图片
     * 将图片信息应用到激活的节点上
     */
    const handleSaveImg = () => {
        activeNodes.forEach((node) => {
            node.setImage({
                url: imgUrl,                    // 图片URL
                title: fileListn[0].name,       // 图片标题（使用文件名）
                width: 120,                     // 图片宽度
                height: 120                     // 图片高度
            })
        })

        setFileListn([])            // 清空文件列表
        setImgUrl("")              // 清空图片URL
        setOpenImgModal(false)      // 关闭图片模态框
    }

    /**
     * 处理面板按钮点击事件
     * 根据不同的按钮类型执行相应的操作
     * @param {string} key 按钮标识符
     */
    const handlePanelBtnClick = (key: string) => {
        switch (key) {
            case 'bookmark':        // 插入备注
                openBookmarkModal()
                break;

            case 'Link':           // 添加超链接
                openLiknModal()
                break;

            case 'tab':            // 插入标签
                openTabModal();
                break;

            case 'image':          // 插入图片
                handleOpenImgModal()
                break;

            case 'GENER':          // 插入概要
                mindMapInstance.current.execCommand('ADD_GENERALIZATION', {
                    text: '概要'   // 默认概要文本
                })
                break;

            case 'Cable':          // 插入关联线
                mindMapInstance.current.associativeLine.createLineFromActiveNode()
                break;
        }
    }

    // BookmarkModal备注
    const handleSetbookmark = () => {
        activeNodes.forEach(node => {
            node.setNote(bookmark)
        })

        setTimeout(() => {
            setBookmark("")
            setBookmarkModal(false)
        }, 100)
    }

    // 插入标签
    const handleSetTab = () => {

        activeNodes.forEach(node => {
            node.setTag(tags)
        })

        setTimeout(() => {
            setTags([]);
            setTabModal(false);
        }, 100)
    }

    const handleCancelBookmark = () => {
        setBookmark("");
        setBookmarkModal(false);
    }

    const handleCancelTab = () => {
        setTags([])
        setTabModal(false)
    }

    const tabKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // @ts-ignore
            setTags(tab => [...tab, tabValue])
            setTabValue('')
        }

    }



    /** 文件转 Base64 */
    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });

    /** beforeUpload：拦截、转换、预览 */
    const beforeUpload = async (file: File): Promise<boolean> => {
        const base64 = await fileToBase64(file);
        setImgUrl(base64);
        setFileListn([
            {
                uid: uuid(),
                name: file.name,
                status: 'done',
                url: base64,
            }
        ])
        // 返回 false 表示不上传到服务器，只做本地预览
        return false;
    };

    /** 拖拽文件到区域时的处理 */
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) {
            // Message.info('仅支持图片文件');
            return;
        }
        beforeUpload(file);
    };



    // 键盘快捷键支持
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 检查是否在输入框中，如果是则不处理快捷键
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'c':
                        event.preventDefault();
                        if (selectedNode) {
                            handleCpoyChild();
                        }
                        break;
                    case 'x':
                        event.preventDefault();
                        if (selectedNode && !selectedNode.isRoot) {
                            handleScissorsChild();
                        }
                        break;
                    case 'v':
                        event.preventDefault();
                        if (clipboard) {
                            handleStickupChild();
                        }
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedNode, clipboard, clipboardType]);

    // 点击外部关闭右键菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setShowContextMenu(false);
            }
        };

        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showContextMenu]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            // 清理定时器
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }

            // 清理思维导图实例
            if (mindMapInstance.current && typeof mindMapInstance.current.destroy === 'function') {
                try {
                    mindMapInstance.current.destroy();
                } catch (error) {
                    console.warn('Error destroying mind map instance on unmount:', error);
                }
            }
        };
    }, []);

    const ExportPopup = React.forwardRef<HTMLDivElement>((_, ref) => (
        <div
            ref={ref}
            className="w-52 min_popup rounded-lg shadow-xl py-1 bg-white"
        >
            {[
                { key: 'pdf', label: '导出为 PDF' },
                { key: 'png', label: '导出为 PNG' },
                { key: 'md', label: '导出为 Markdown' },
                { key: 'xmind', label: '导出为 XMind' },
            ].map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => handleDownload(key)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700
                   hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                    {label}
                </button>
            ))}
        </div>
    ));

    const PanelPopup = (({ options }: { options: { icon: keyof typeof icons, key: string, label: string }[] }) => (
        <div className="w-24 min_popup rounded-lg shadow-xl py-1">
            {options.map(item => (
                <button
                    key={item.key}
                    onClick={() => handlePanelBtnClick(item.key)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700
                   hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                    <div className="flex  ">
                        <div className="mr-2">
                            <Icon name={item.icon} />
                        </div>
                        <span> {item.label} </span>
                    </div>
                </button>
            ))}
        </div>
    ))
 
    return (
        <>

            <div className="relative" >
                {/* Loading 遮罩层 */}
                <Loading isVisible={isLoading} progress={loadingProgress} title="加载中..." />

                {/* 主要内容区域  思维导图  */}
                <div className="relative">

                    {/* 思维导图容器 */}
                    <div ref={mindMapRef}
                        className="relative h-[95vh] bg-white rounded-[var(--br)]"
                        style={{ width: cardWidth }} />

                    {/* 工具栏 */}
                    <div className="absolute top-4 left-0 right-0 m-auto  w-[470px] px-4 sm:px-0  z-40 ">

                        <div className="tool-panel backdrop-blur-md  shadow-xl mx-auto flex items-center gap-[var(--gap)] px-[var(--px)]  py-[var(--py)]  rounded-[var(--br)]  w-[470px]">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                {/* 缩放控制 */}
                                <div className="flex items-center space-x-1 sm:space-x-2 border-r pr-2 sm:pr-4">
                                    <button
                                        className="p-[var(--py)] rounded-[var(--br)]  transition-colors duration-200 text-[var(--fs)]"
                                        onClick={() => mindMapInstance.current?.view.enlarge()}
                                        title="放大"
                                    >
                                        <ZoomIn className="w-4.5 h-4.5 sm:w-4 sm:h-4" style={{ color: style.IconColor }} />
                                    </button>
                                    <button
                                        className="p-[var(--py)] rounded-[var(--br)] transition-colors  duration-200 text-[var(--fs)]"
                                        onClick={() => mindMapInstance.current?.view.narrow()}
                                        title="缩小"
                                    >
                                        <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: style.IconColor }} />
                                    </button>
                                </div>

                                {/* 布局选择器 */}
                                <div className="border-r pr-[var(--gap)]" >
                                    <Select onValueChange={(e) => setLayout(e)} >
                                        <SelectTrigger className="w-full sm:w-[13rem] text-xs sm:text-sm">
                                            <SelectValue placeholder="选择布局" style={{ color: style.textColor }} />
                                        </SelectTrigger>
                                        <SelectContent style={{background:'#fff',border:'none'}} >
                                            <SelectGroup style={{background:'#fff',border:'none'}}>
                                                {
                                                    layoutTypes.map((option, index) => (
                                                        <SelectItem key={index} value={option.value} >
                                                            {/* <img src={option.icon.src} alt={option.label} className="w-6 h-6 sm:w-8 sm:h-8 rounded" /> */}
                                                            <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                </div>
                                {/* AI 助手按钮 */}
                                <Button onClick={() => setVisible(true)} className="cursor-pointer bg-[#CF2C2C]  text-[var(--fs)]   px-[var(--px)] py-[var(--py)] rounded-[var(--br)]  flex  items-center gap-[var(--gap)]">
                                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-200" />
                                    <span className="font-medium text-gray-200 hidden sm:inline">AI 助手</span>
                                    <span className="font-medium text-gray-200 sm:hidden">AI</span>
                                </Button>
                            </div>
                        </div>


                        { // AI 助手弹窗
                            visible && (
                                <div
                                    className="w-full max-w-[470px] min-h-28 max-h-[30rem] z-50 backdrop-blur-md mt-4  shadow-xl  
                                    px-[var(--px)]  py-[var(--py)]  rounded-[var(--br)]">


                                    {
                                        loading && (
                                            <div className="w-full h-14  flex   justify-center items-center ">
                                                <LoaderCircle className='w-6 h-6 animate-spin' />
                                            </div>
                                        )
                                    }



                                    <div className="px-2 sm:px-4 py-2 text-xs sm:text-sm max-h-60 overflow-y-auto">
                                        <MarkdownRender content={aiContent} />
                                    </div>
                                    {
                                        aiContent && (
                                            <div className=" flex justify-end pr-4  mb-2">
                                                <Button onClick={handleUseContent}
                                                    size='xs'
                                                    className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                                                    <Copy className="w-3 h-3" />
                                                    <span className="hidden sm:inline">应用</span>
                                                </Button>
                                            </div>
                                        )
                                    }


                                    <div className='space-y-3'>
                                        {/* 操作指引 */}
                                        <div className='text-sm text-gray-600'>
                                            <div className='flex flex-wrap gap-4'>
                                                <span className='flex items-center'>
                                                    <kbd className='px-1.5 py-0.5 text-xs bg-gray-100  rounded mr-1'>#</kbd>
                                                    关联思维导图节点
                                                </span>
                                                <span className='flex items-center'>
                                                    <kbd className='px-1.5 py-0.5 text-xs bg-gray-100  rounded mr-1'>、</kbd>
                                                    关联章节与思维导图
                                                </span>
                                                <span className='flex items-center'>
                                                    <kbd className='px-1.5 py-0.5 text-xs bg-gray-100  rounded mr-1'>/</kbd>
                                                    导入提示词
                                                </span>
                                            </div>
                                        </div>

                                        <Mention
                                            setMindmapChapters={setMindmapChapters}
                                            mentionData={mentionData}
                                            prompters={prompters}
                                            onSend={handleSend}
                                            close={() => {
                                                setInputValue("")
                                                setAiContent("")
                                                setVisible(false)
                                            }}
                                            placeholder='输入内容开始创作...'
                                        />
                                    </div>

                                </div>
                            )
                        }


                        { // 备注 弹窗
                            bookmarkModal && (
                                <div className="w-full max-w-[470px] min-h-28 max-h-[30rem]  z-50 backdrop-blur-md  shadow-xl px-[var(--px)]  py-[var(--py)]  rounded-[var(--br)] mt-4">
                                    <Textarea value={bookmark} onChange={(e) => setBookmark(e.target.value)} className="resize-none text-xs sm:text-sm" rows={4} />

                                    <div className="flex justify-end mt-2 space-x-2 sm:space-x-3">
                                        <Button className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" onClick={handleCancelBookmark}>取消</Button>
                                        <Button className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" onClick={handleSetbookmark}>保存</Button>
                                    </div>
                                </div>
                            )
                        }

                        { // 添加超链接 Link Modal
                            liknModal && (
                                <div className="w-full max-w-[470px] min-h-28 max-h-[30rem]  z-50 backdrop-blur-md  shadow-xl px-[var(--px)]  py-[var(--py)]  rounded-[var(--br)] mt-4">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Input placeholder='请输入网址名称' value={liknName} onChange={(e) => setLiknName(e.target.value)} className="text-xs sm:text-sm" />
                                        <Input placeholder='请输入网址' value={liknValue} onChange={(e) => setLiknValue(e.target.value)} className="text-xs sm:text-sm" />
                                    </div>

                                    <div className="flex justify-end mt-2 space-x-2 sm:space-x-3">
                                        <Button className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" onClick={handleCancelModal}>取消</Button>
                                        <Button className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" onClick={handleSevaLike}>保存</Button>
                                    </div>
                                </div>
                            )
                        }
                        {
                            tabModal && (
                                <div className="w-full max-w-[470px] min-h-28 max-h-[30rem]  z-50 backdrop-blur-md  shadow-xl px-[var(--px)]  py-[var(--py)]  rounded-[var(--br)] mt-4">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Input placeholder='输入标签 Enter键添加标签' value={tabValue} onChange={(e) => setTabValue(e.target.value)}
                                            onKeyDown={tabKeyDown} className="text-xs sm:text-sm"
                                        />
                                        <div>
                                            <ul className="flex flex-wrap justify-start gap-1 sm:gap-2">
                                                {tags.map((tag) => (
                                                    <li key={tag} className="bg-green-600 text-white rounded p-1.5 sm:p-2 flex items-center space-x-1 text-xs sm:text-sm">
                                                        <span> {tag} </span>
                                                        <div className='cursor-pointer' onClick={() => removeTag(tag)} >
                                                            <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-2 space-x-2 sm:space-x-3">
                                        <Button className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" onClick={handleCancelTab}>取消</Button>
                                        <Button className="bg-[#CF2C2C] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" onClick={handleSetTab}>保存</Button>
                                    </div>
                                </div>
                            )
                        }


                    </div>
                </div>
            </div>


            {/* 富文本工具栏 */}
            {showToolbar && (
                <div
                    ref={toolbarRef}
                    className="fixed z-50 backdrop-blur-md rounded-xl shadow-2xl  border-gray-200/50 px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-1 sm:gap-2 max-w-[95vw] overflow-x-auto"
                    style={{
                        left: `${toolbarPosition.left}px`,
                        top: `${toolbarPosition.top - 20}px`,
                        transform: 'translateX(-50%)',
                    }}
                    onMouseEnter={cancelHideToolbar}
                    onMouseLeave={scheduleHideToolbar}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 格式化按钮组 */}
                    <div className="flex items-center space-x-0.5 sm:space-x-1">
                        {/* 加粗按钮 */}
                        <button
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${formatInfo.bold
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                formatText({ bold: !formatInfo.bold });
                            }}
                            title="加粗"
                        >
                            <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* 斜体按钮 */}
                        <button
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${formatInfo.italic
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                formatText({ italic: !formatInfo.italic });
                            }}
                            title="斜体"
                        >
                            <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* 下划线按钮 */}
                        <button
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${formatInfo.underline
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                formatText({ underline: !formatInfo.underline });
                            }}
                            title="下划线"
                        >
                            <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* 删除线按钮 */}
                        <button
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${formatInfo.strike
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                formatText({ strike: !formatInfo.strike });
                            }}
                            title="删除线"
                        >
                            <Strikethrough className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    {/* 分隔线 */}
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>

                    {/* 文字颜色 Baseline */}
                    <ColorDropdown title="文字颜色" colors={presetColors} onSelect={(e) => formatText({ color: e })} trigger="hover" cols={5} />
                    { /* 背景颜色   */}
                    <ColorDropdown title="背景颜色" colors={backgroundColors} onSelect={(e) => formatText({ background: e })} trigger="hover" cols={3} />

                    {/* 字体大小 */}
                    <Dropdown title="字体大小">
                        <option onClick={() => formatText({ size: `${12}px` })}  >12px</option>
                        <option onClick={() => formatText({ size: `${14}px` })}  >14px</option>
                        <option onClick={() => formatText({ size: `${16}px` })}  >16px</option>
                        <option onClick={() => formatText({ size: `${18}px` })}  >18px</option>
                        <option onClick={() => formatText({ size: `${20}px` })}  >20px</option>
                        <option onClick={() => formatText({ size: `${24}px` })}  >24px</option>
                    </Dropdown>



                    {/* 分隔线 */}
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>

                    {/* 清除格式按钮 */}
                    <button
                        className="px-3 py-2 w-20 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFormat();
                        }}
                        title="清除格式"
                    >
                        清除格式
                    </button>
                </div>
            )}

            {/* 右键菜单 */}
            {showContextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50  backdrop-blur-md   rounded-xl shadow-2xl py-3 min-w-[180px]"
                    style={{
                        left: `${contextMenuPosition.x}px`,
                        top: `${contextMenuPosition.y}px`,
                    }}
                >
                    {selectedNode ? (
                        // 节点右键菜单
                        <>
                            <div className="px-4 py-2 text-xs font-medium border-b right-key-bok">
                                节点操作
                            </div>

                            {!selectedNode.isRoot && (
                                <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 right-key-bok-button   transition-colors duration-200 group" onClick={handleAddSibling}>
                                    <Plus className="w-4 h-4 text-gray-500 tool-button-text" />
                                    <span className="font-medium">添加同级节点</span>
                                </button>
                            )}

                            <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 right-key-bok-button   transition-colors duration-200 group" onClick={handleAddChild}>
                                <Plus className="w-4 h-4 text-gray-500 tool-button-text" />
                                <span className="font-medium">添加子节点</span>
                            </button>

                            <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 right-key-bok-button  transition-colors duration-200 group" onClick={handleCpoyChild}>
                                <Copy className="w-4 h-4 text-gray-500 tool-button-text" />
                                <span className="font-medium flex-1">复制节点</span>
                                <span className="text-xs text-gray-400 tool-button-text">Ctrl+C</span>
                            </button>

                            <button
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-200 group ${selectedNode?.isRoot
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-orange-50 hover:text-orange-600'
                                    }`}
                                onClick={selectedNode?.isRoot ? undefined : handleScissorsChild}
                                disabled={selectedNode?.isRoot}
                                title={selectedNode?.isRoot ? '不能剪切根节点' : '剪切节点'}
                            >
                                <Scissors className={`w-4 h-4 ${selectedNode?.isRoot
                                    ? 'text-gray-400'
                                    : 'text-gray-500 group-hover:text-orange-600'
                                    }`} />
                                <span className="font-medium flex-1">剪切节点</span>
                                <span className={`text-xs ${selectedNode?.isRoot
                                    ? 'text-gray-400'
                                    : 'text-gray-400 group-hover:text-orange-400'
                                    }`}>Ctrl+X</span>
                            </button>

                            <button
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-200 group ${clipboard
                                    ? 'right-key-bok-button hover:text-green-600 text-gray-900'
                                    : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                onClick={clipboard ? handleStickupChild : undefined}
                                disabled={!clipboard}
                                title={clipboard ? `粘贴节点 (${clipboardType === 'cut' ? '剪切' : '复制'})` : '剪贴板为空'}
                            >
                                <CopyPlus className={`w-4 h-4 ${clipboard
                                    ? 'text-gray-500 group-hover:text-green-600'
                                    : 'right-key-bok'
                                    }`} />
                                <span className="font-medium flex-1 tool-button-text">粘贴节点</span>
                                <div className="flex items-center gap-2">
                                    {clipboard && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${clipboardType === 'cut'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-orange-100 right-key-bok'
                                            }`}>
                                            {clipboardType === 'cut' ? '剪切' : '复制'}
                                        </span>
                                    )}
                                    <span className={`text-xs ${clipboard
                                        ? 'text-gray-400 group-hover:text-green-400'
                                        : 'text-gray-400'
                                        }`}>Ctrl+V</span>
                                </div>
                            </button>


                            {!selectedNode.isRoot && (
                                <div className="border-t border-gray-100/50 mt-2 pt-2">
                                    <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 group text-red-500" onClick={handleDeleteNode}>
                                        <Trash2 className="w-4 h-4 group-hover:text-red-600" />
                                        <span className="font-medium">删除节点</span>
                                    </button>
                                </div>
                            )}

                        </>
                    ) : (
                        // 画布右键菜单
                        <>
                            <div className="px-4 py-2 text-xs font-medium right-key-bok">
                                画布操作
                            </div>
                        </>
                    )}

                    <div className="border-t border-gray-100/50 mt-2 pt-2">
                        <div className="px-4 py-2 text-xs font-medium right-key-bok">
                            视图操作
                        </div>

                        <Trigger popup={<ExportPopup />} position="right">
                            <div className="w-full cursor-pointer px-4 py-3 text-left text-sm flex justify-between items-center hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 group">
                                <div className="flex items-center gap-3">
                                    <FolderInput className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
                                    <span className="font-medium">导出</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                            </div>
                        </Trigger>



                        <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group" onClick={handleExpandAll}>
                            <ChevronsUpDown className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                            <span className="font-medium">展开所有节点</span>
                        </button>

                        <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group" onClick={handleCollapseAll}>
                            <ChevronsDownUp className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                            <span className="font-medium">收起所有节点</span>
                        </button>

                        <button className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group" onClick={handleFitView}>
                            <Focus className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                            <span className="font-medium">适应画布</span>
                        </button>

                    </div>
                </div>
            )}

            {/* 节点激活面板 */}
            {
                panelVisible && (
                    <div style={{ top: `${panelTop}px`, left: `${panelLeft}px` }} className="fixed z-50   backdrop-blur-md    rounded-xl shadow-2xl p-4 min-w-[200px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold tool-button-text flex items-center gap-2">
                                <div className="w-2 h-2 din rounded-full"></div>
                                节点工具
                            </h3>
                            <button onClick={() => setPanelVisible(false)} className="right-key-bok-button rounded-lg p-1 transition-colors duration-200"  >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-1">
                            {
                                activePanelBtnlist.map((item) => {
                                    return (
                                        <div key={item.key}>
                                            {
                                                item.options ? (
                                                    <Trigger popup={<PanelPopup options={item.options} />} position="right">
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 rounded-lg transition-all duration-200 group">
                                                            <Icon name={item.icon} className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                                            <span className="font-medium flex-1 text-left">{item.label}</span>
                                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </Trigger>
                                                )
                                                    : (
                                                        <button
                                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm  hover:bg-gradient-to-r panelVisible rounded-lg transition-all duration-200 group"
                                                            onClick={() => handlePanelBtnClick(item.key)}
                                                        >
                                                            <Icon name={item.icon} className="w-4 h-4 din-text" />
                                                            <span className="font-medium din-text">{item.label}</span>
                                                        </button>
                                                    )
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }

        </>
    )
}