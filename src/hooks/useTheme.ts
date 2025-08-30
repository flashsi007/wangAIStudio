import useTheme from '@/store/useTheme'
import { useState } from "react"
import type { ThemeTokens } from '@/app/config'
export default function ThemeTokens() {
    const { theme, getTheme, setTheme } = useTheme()

    const [themeConfig, setThemeConfig] = useState<ThemeTokens>(theme)

    const haneGetTheme = () => {
        const data = getTheme()
        setThemeConfig(data)
    }

    return {
        setTheme,
        theme: themeConfig,
        getTheme: haneGetTheme,
    }
}
