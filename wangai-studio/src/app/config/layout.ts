// src/config/layout.ts
export const LAYOUT_RATIO = {
    headerH: 0.05,   // Header 高度 = 5% vw
    left: 0.15,   // Header 左栏 = 15% vw
    right: 0.20,   // Header 右栏 = 20% vw
    padding: 1.5,    // Container 减去额外 1.5%
} as const;

export const LAYOUT_LIMIT = {
    headerH: { min: 48, max: 72 },
    left: { min: 200, max: 320 },
    right: { min: 240, max: 400 },
    font: { min: 12, max: 20 },   // 仅 Container 用到
} as const;

/** 工具：根据 vw 与比例计算最终尺寸并裁剪到限定区间 */
export function calcLayoutSize(
    vw: number,
    ratio: number,
    limit: { min: number; max: number }
): number {
    return Math.max(limit.min, Math.min(limit.max, vw * ratio));
}


/******** minMap 工具栏 ************/
export const SCALE_DESKTOP = 0.018; // 1.8 % vw
export const SCALE_MOBILE = 0.028; // 2.8 % vw
export const LIMIT_MIN = 12; // 最小字号 px
export const LIMIT_MAX = 20; // 最大字号 px

export const calc = (vw: number, ratio: number) =>  Math.max(LIMIT_MIN, Math.min(LIMIT_MAX, vw * ratio));