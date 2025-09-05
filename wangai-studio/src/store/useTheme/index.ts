import { ThemeTokens, defaultTokens } from '@/app/config';
import React from 'react';

export interface ThemeState {
    theme: ThemeTokens;
    setTheme: (p: Partial<ThemeTokens>) => void;
    getTheme: () => ThemeTokens;
}

const useTheme = () => {
    // 只在客户端读 localStorage
    const key = 'theme-storage';
    const getTheme = (): ThemeTokens => {
        if (typeof window === 'undefined') return defaultTokens;
        try {
            const raw = localStorage.getItem(key);
            return raw ? { ...defaultTokens, ...JSON.parse(raw) } : defaultTokens;
        } catch {
            return defaultTokens;
        }
    };

    const setTheme = (p: Partial<ThemeTokens>) => {
        if (typeof window === 'undefined') return;
        const next = { ...getTheme(), ...p };
        localStorage.setItem(key, JSON.stringify(next));
        // 触发一次全局重渲染（简单做法）
        window.dispatchEvent(new Event('theme-change'));
    };

    // 用 React 状态保持最新
    const [theme, setThemeState] = React.useState<ThemeTokens>(defaultTokens);

    React.useEffect(() => {
        setThemeState(getTheme());
        const handle = () => setThemeState(getTheme());
        window.addEventListener('theme-change', handle);
        return () => window.removeEventListener('theme-change', handle);
    }, []);

    return { theme, setTheme, getTheme: () => theme };
};

export default useTheme;