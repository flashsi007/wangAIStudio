import { useUserStore } from '@/store/useUserInfo'
import type { UserInfo } from '@/store/useUserInfo'

/**
 * 用户状态管理 Hook
 * 提供便捷的用户数据访问和操作方法
 */
export const useUser = () => {
    // 获取用户数据
    const userInfo = useUserStore((state) => state.userInfo)
    const isLoggedIn = useUserStore((state) => state.isLoggedIn)
    const userId = useUserStore((state) => state.userInfo?.userId)
    const token = useUserStore((state) => state.userInfo?.token)
    const userName = useUserStore((state) => state.userInfo?.userName)
    const payTokenNumber = useUserStore((state) => state.userInfo?.payTokenNumber)

    // 获取操作方法
    const setUserInfo = useUserStore((state) => state.setUserInfo)
    const clearUserInfo = useUserStore((state) => state.clearUserInfo)
    const updatePayTokenNumber = useUserStore((state) => state.updatePayTokenNumber)
    const updateUserInfo = useUserStore((state) => state.updateUserInfo)

    return {
        // 用户数据
        userInfo,
        isLoggedIn,
        userId,
        token,
        userName,
        payTokenNumber,

        // 操作方法
        setUserInfo,
        clearUserInfo,
        updatePayTokenNumber,
        updateUserInfo,

        // 便捷方法
        logout: clearUserInfo,
        isAuthenticated: isLoggedIn
    }
}

export default useUser
export type { UserInfo }