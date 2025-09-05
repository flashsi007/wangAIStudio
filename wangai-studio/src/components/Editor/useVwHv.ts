import React, { useEffect, useState } from 'react';

export function useVw(ratio = 1) {
    const [px, setPx] = useState(() => Math.round(window.innerWidth * ratio));

    useEffect(() => {
        const handler = () => setPx(Math.round(window.innerWidth * ratio));
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [ratio]);

    return px;
}

export function useHv(ratio = 1) {
    const [px, setPx] = useState(() => Math.round(window.innerHeight * ratio));

    useEffect(() => {
        const handler = () => setPx(Math.round(window.innerHeight * ratio));
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [ratio]);

    return px;
}

