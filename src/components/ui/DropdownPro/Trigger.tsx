import React, {
    useState,
    useRef,
    useEffect,
    ReactNode,
    cloneElement,
} from 'react';
interface TriggerProps {
    /** 触发节点 */
    children: ReactNode;
    /** 弹层内容 / 组件 */
    popup: ReactNode;
    /** 触发方式，目前仅支持 click */
    trigger?: 'click';
    /** 相对位置：right / left / top / bottom */
    position?: 'right' | 'left' | 'top' | 'bottom';
}

export function Trigger({ children, popup, trigger = 'click', position = 'right', }: TriggerProps) {
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    /* 点击触发器 */
    const onToggle = () => setVisible(v => !v);

    /* 点击空白关闭 */
    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (
                triggerRef.current?.contains(e.target as Node) ||
                popupRef.current?.contains(e.target as Node)
            )
                return;
            setVisible(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    /* 计算浮层定位样式 */
    const popupStyle = (): React.CSSProperties => {
        const base = { position: 'absolute', zIndex: 50 };
        switch (position) {
            case 'right':
                // @ts-ignore
                return { ...base, top: 0, left: '100%', marginLeft: 8 };
            case 'left':
                // @ts-ignore
                return { ...base, top: 0, right: '100%', marginRight: 8 };
            case 'top':
                // @ts-ignore
                return { ...base, bottom: '100%', left: 0, marginBottom: 8 };
            case 'bottom':
                // @ts-ignore
                return { ...base, top: '100%', left: 0, marginTop: 8 };
            default:
                // @ts-ignore
                return base;
        }
    };

    return (
        <div className="relative inline-block">
            {/* 触发节点（自动注入 onClick） */}
            {cloneElement(children as any, {
                ref: triggerRef,
                onClick: trigger === 'click' ? onToggle : undefined,
            })}

            {/* 浮层 */}
            {visible && (
                <div ref={popupRef} style={popupStyle()} className="w-max triggerPale">
                    {popup}
                </div>
            )}
        </div>
    );
}
