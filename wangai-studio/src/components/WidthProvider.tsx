// WidthProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type WidthCtx = { width: number };
const WidthContext = createContext<WidthCtx>({ width: 0 });

/** 在 <PanelMinMap> 组件外再包一层即可 */
export const WidthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <WidthContext.Provider value={{ width }}>
            {/* 把真正的 PanelMinMap 渲染出来，并给它 ref */}
            <div ref={ref} id="PanelMinMap">
                {children}
            </div>
        </WidthContext.Provider>
    );
};

/** 远端组件用来取宽度的 Hook */
export const usePanelMinMapWidth = () => useContext(WidthContext).width;