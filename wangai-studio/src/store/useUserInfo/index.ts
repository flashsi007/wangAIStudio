import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

// 定义用户信息类型
export interface UserInfo {
    userId: string
    uuId: string
    userName: string
    payTokenNumber: number
    token: string
}

// 用户状态接口
interface UserState {
    userInfo: UserInfo | null
    isLoggedIn: boolean
}

// 用户操作接口
interface UserActions {
    getUserId: () => string | null
    setUserInfo: (userInfo: UserInfo) => void
    clearUserInfo: () => void
    updatePayTokenNumber: (payTokenNumber: number) => void
    updateUserInfo: (updates: Partial<UserInfo>) => void
}

// 用户 store 类型
export type UserStore = UserState & UserActions

// 创建用户 store
export const useUserStore = create<UserStore>()(
    devtools(
        persist(
            (set, get) => ({
                // 初始状态
                userInfo: null,
                isLoggedIn: false,
                getUserId: () => {
                    return get().userInfo?.userId || ""
                },
                // 设置用户信息
                setUserInfo: (userInfo: UserInfo) => {
                    set(
                        {
                            userInfo,
                            isLoggedIn: true
                        },
                        false,
                        'setUserInfo'
                    )
                },

                // 清除用户信息（退出登录）
                clearUserInfo: () => {
                    set(
                        {
                            userInfo: null,
                            isLoggedIn: false
                        },
                        false,
                        'clearUserInfo'
                    )
                },

                // 更新用户代币数量
                updatePayTokenNumber: (payTokenNumber: number) => {
                    const currentUserInfo = get().userInfo
                    if (currentUserInfo) {
                        set(
                            {
                                userInfo: {
                                    ...currentUserInfo,
                                    payTokenNumber
                                }
                            },
                            false,
                            'updatePayTokenNumber'
                        )
                    }
                },

                // 更新用户信息（部分更新）
                updateUserInfo: (updates: Partial<UserInfo>) => {
                    const currentUserInfo = get().userInfo
                    if (currentUserInfo) {
                        set(
                            {
                                userInfo: {
                                    ...currentUserInfo,
                                    ...updates
                                }
                            },
                            false,
                            'updateUserInfo'
                        )
                    }
                }
            }),
            {
                name: 'user-storage',
                // 使用 localStorage 进行数据持久化
                storage: {
                    getItem: (name) => {
                        const value = localStorage.getItem(name)
                        return value ? JSON.parse(value) : null
                    },
                    setItem: (name, value) => {
                        localStorage.setItem(name, JSON.stringify(value))
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name)
                    }
                },
                // 选择性持久化
                // @ts-ignore
                partialize: (state) => ({
                    userInfo: state.userInfo,
                    isLoggedIn: state.isLoggedIn
                })
            }
        ),
        {
            name: 'user-store'
        }
    )
)

// 导出便捷的选择器
export const selectUserInfo = (state: UserStore) => state.userInfo
export const selectIsLoggedIn = (state: UserStore) => state.isLoggedIn
export const selectUserId = (state: UserStore) => state.userInfo?.userId
export const selectUserName = (state: UserStore) => state.userInfo?.userName
export const selectPayTokenNumber = (state: UserStore) => state.userInfo?.payTokenNumber
export const selectToken = (state: UserStore) => state.userInfo?.token
