import { useEffect, useState } from 'react';

export function useVw(ratio = 1) {
    const [px, setPx] = useState(() => {
        if (typeof window !== 'undefined') {
            return Math.round(window.innerWidth * ratio);
        }
        return 0; // 服务端渲染时的默认值
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handler = () => setPx(Math.round(window.innerWidth * ratio));
            // 初始化时设置一次
            setPx(Math.round(window.innerWidth * ratio));
            window.addEventListener('resize', handler);
            return () => window.removeEventListener('resize', handler);
        }
    }, [ratio]);

    return px;
}

export function useHv(ratio = 1) {
    const [px, setPx] = useState(() => {
        if (typeof window !== 'undefined') {
            return Math.round(window.innerHeight * ratio);
        }
        return 0; // 服务端渲染时的默认值
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handler = () => setPx(Math.round(window.innerHeight * ratio));
            // 初始化时设置一次
            setPx(Math.round(window.innerHeight * ratio));
            window.addEventListener('resize', handler);
            return () => window.removeEventListener('resize', handler);
        }
    }, [ratio]);

    return px;
}


export function useWidthById(id: string): number {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // 服务端渲染直接返回
        if (typeof window === 'undefined') return;

        const el = document.getElementById(id);
        if (!el) {
            setWidth(0);
            return;
        }

        // 先设置一次初始值
        setWidth(el.offsetWidth);

        // ResizeObserver 实时监听
        const observer = new ResizeObserver(() => {
            console.log('el.offsetWidth', el.offsetWidth);

            setWidth(el.offsetWidth);
        });
        observer.observe(el);

        // 清理
        return () => observer.disconnect();
    }, [id]);

    return width;
}


