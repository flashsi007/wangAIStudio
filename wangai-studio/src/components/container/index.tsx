// container.tsx
'use client';
import { useEffect, useRef,useState} from 'react';
import styles from './container.module.css';

import { LAYOUT_RATIO, LAYOUT_LIMIT, calcLayoutSize } from "@/app/config"

export default function Container({ children }: { children: React.ReactNode }) {
    const rootRef = useRef<HTMLDivElement>(null);

    const [aspect, setAspect] = useState(0);
    const [font, setFont] = useState(0);

    useEffect(() => {
        const setVars = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // 高宽比 = (vh / vw) - 额外偏移
            const aspect = (vh / vw) * 100 - LAYOUT_RATIO.padding;
            const font = calcLayoutSize(vw, 0.025, LAYOUT_LIMIT.font);
            setAspect(aspect);
            setFont(font);
        };

        setVars();
        window.addEventListener('resize', setVars);
        return () => window.removeEventListener('resize', setVars);
    }, []);

    return (
        <div ref={rootRef}
            className={`w-full mx-auto`}
            style={{ 
                paddingTop: `${aspect}%`,
                fontSize: `${font}px`,
            }}
        >
            <div className={styles.containerBox}>
                {children}
            </div>
        </div>
    );
}