'use client';
import { useState, useRef, useEffect, Children, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button';
interface DropdownProps {
    title: React.ReactNode;
    children: React.ReactNode;
    trigger?: 'hover' | 'click';
    Icon?: React.ReactNode;
}

const PORTAL_ID = 'dropdown-portal';

// 确保 portal 元素存在的函数
const ensureDropdownPortalExists = () => {
    if (typeof window !== 'undefined' && !document.getElementById(PORTAL_ID)) {
        const portal = document.createElement('div');
        portal.id = PORTAL_ID;
        portal.className = 'fixed inset-0 pointer-events-none z-[9999]';
        document.body.appendChild(portal);
    }
};

export function Dropdown({ title, children, trigger = 'hover', Icon }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 确保 portal 元素在组件挂载时存在
    useEffect(() => {
        ensureDropdownPortalExists();
    }, []);

    /* 统一控制开关 ------------------------------------------------------------- */
    const enter = () => {
        if (trigger === 'hover') {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setOpen(true);
        }
    };

    const leave = () => {
        if (trigger === 'hover') {
            // 延迟关闭，给用户时间移动到下拉选项
            timeoutRef.current = setTimeout(() => {
                setOpen(false);
            }, 150);
        }
    };

    /* 计算下拉位置 -------------------------------------------------------------- */
    useEffect(() => {
        if (!open || !btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setStyle({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            minWidth: rect.width,
        });
    }, [open]);

    /* 点击触发 & 点击外部关闭 ---------------------------------------------------- */
    const toggle = () => trigger === 'click' && setOpen((v) => !v);
    useEffect(() => {
        if (trigger !== 'click' || !open) return;
        const close = (e: MouseEvent) => {
            if (!btnRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [open, trigger]);

    /* 清理定时器 ---------------------------------------------------------------- */
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    /* 下拉内容 ------------------------------------------------------------------ */
    const dropdownNode = open && (
        <div
            ref={dropdownRef}
            className="absolute  rounded-md shadow-lg pointer-events-auto bg-white"
            style={style}
            onMouseEnter={trigger === 'hover' ? enter : undefined}
            onMouseLeave={trigger === 'hover' ? leave : undefined}
        >
            <ul className="py-1 ">
                {Children.map(children, (child, i) => {
                    if (!isValidElement(child) || child.type !== 'option') return null;
                    const { onClick, children: label } = child.props as { onClick?: () => void; children: React.ReactNode };

                    return (
                        <li className="trigger-li px-4 py-2 text-sm cursor-pointer" key={`dropdown-item-${i}-${typeof label === 'string' ? label : i}`} onClick={() => {
                            onClick?.();
                            trigger === 'click' && setOpen(false);
                        }}
                        >
                            {label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <>
            {/* 公共父级：按钮 + 下拉都在里面，事件仍然冒泡到它 */}
            <div
                className="relative inline-block"
                onMouseEnter={trigger === 'hover' ? enter : undefined}
                onMouseLeave={trigger === 'hover' ? leave : undefined}
            >
                <Button
                    ref={btnRef}
                    onClick={trigger === 'click' ? toggle : undefined}
                    className="min-w-[110px] flex  triggerBtn items-center gap-1 px-4 py-2  rounded-md select-none"
                >
                    {
                        Icon && Icon
                    }
                    {title}
                    <svg
                        className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>
            </div>

            {/* 仅把节点搬到 body，事件仍冒泡到上面的公共父级 */}
            {typeof window !== 'undefined' && document.getElementById(PORTAL_ID) &&
                createPortal(dropdownNode, document.getElementById(PORTAL_ID)!)}
        </>
    );
}




interface ColorDropdownProps {
    title?: React.ReactNode;
    colors: string[];               // 例 ['red-500','blue-600'...]
    onSelect: (color: string) => void;
    trigger?: 'hover' | 'click';
    cols?: number;                  // 每行色块数，默认 5
}

const COLOR_PORTAL_ID = 'color-dropdown-portal';

// 确保 portal 元素存在的函数
const ensurePortalExists = () => {
    if (typeof window !== 'undefined' && !document.getElementById(COLOR_PORTAL_ID)) {
        const portal = document.createElement('div');
        portal.id = COLOR_PORTAL_ID;
        portal.className = 'fixed inset-0 pointer-events-none z-[9999]';
        document.body.appendChild(portal);
    }
};

export function ColorDropdown({ title = '颜色', colors, onSelect, trigger = 'hover', cols = 5, }: ColorDropdownProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const [style, setStyle] = useState({});

    // 确保 portal 元素在组件挂载时存在
    useEffect(() => {
        ensurePortalExists();
    }, []);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    /* 统一开关 --------------------------------------------------------- */
    const openMenu = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setOpen(true);
    };
    const closeMenu = () => {
        timerRef.current = setTimeout(() => setOpen(false), 150);
    };
    const toggle = () => trigger === 'click' && setOpen((v) => !v);

    /* 计算下拉位置 ----------------------------------------------------- */
    useEffect(() => {
        if (!open || !btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setStyle({
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
            minWidth: rect.width,
        });
    }, [open]);

    /* 点击外部关闭 ----------------------------------------------------- */
    useEffect(() => {
        if (trigger !== 'click') return;
        const outsideClick = (e: MouseEvent) => {
            if (!btnRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', outsideClick);
        return () => document.removeEventListener('mousedown', outsideClick);
    }, [trigger]);

    /* 清理定时器 ------------------------------------------------------- */
    // @ts-ignore
    useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

    /* 下拉内容 --------------------------------------------------------- */
    const dropdownNode = open && (
        <div className="absolute bg-white  border rounded-md shadow-lg p-1 grid gap-1 pointer-events-auto "
            style={{ ...style, gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            onMouseEnter={trigger === 'hover' ? openMenu : undefined}
            onMouseLeave={trigger === 'hover' ? closeMenu : undefined}
        >
            {colors.map((c) => (
                <button
                    key={c}
                    title={c}
                    onClick={() => {
                        onSelect(c);
                        trigger === 'click' && setOpen(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={
                        `w-6 h-6 rounded-full
                         hover:ring-2 hover:ring-offset-1   transition`}
                />
            ))}
        </div>
    );

    return (
        <>
            {/* 公共父级：按钮 + 下拉事件共享 */}
            <div
                className="relative inline-block bg-white"
                onMouseEnter={trigger === 'hover' ? openMenu : undefined}
                onMouseLeave={trigger === 'hover' ? closeMenu : undefined}
            >
                <button
                    ref={btnRef}
                    onClick={trigger === 'click' ? toggle : undefined}
                    className="min-w-[100px] flex items-center gap-1 px-3 py-1.5 border triggerBtn rounded-md text-sm"
                >
                    {title}
                    <svg
                        className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {typeof window !== 'undefined' && document.getElementById(COLOR_PORTAL_ID) &&
                createPortal(dropdownNode, document.getElementById(COLOR_PORTAL_ID)!)}
        </>
    );
}
