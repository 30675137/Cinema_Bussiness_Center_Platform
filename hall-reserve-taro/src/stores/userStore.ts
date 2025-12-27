/**
 * 用户状态管理
 *
 * 使用 Zustand 管理用户登录态和用户信息
 */

import { create } from 'zustand'
import { User } from '../types/user'

/**
 * 用户状态接口
 */
interface UserState {
  /** 当前用户信息 */
  user: User | null

  /** 是否已登录 */
  isLoggedIn: boolean

  /** 登录后要跳转的路径（用于路由守卫） */
  redirectPath: string | null

  /** 设置用户信息 */
  setUser: (user: User | null) => void

  /** 设置登录状态 */
  setLoggedIn: (isLoggedIn: boolean) => void

  /** 设置重定向路径 */
  setRedirectPath: (path: string | null) => void

  /** 清除用户信息 */
  clearUser: () => void
}

/**
 * 创建用户状态 Store
 */
export const useUserStore = create<UserState>((set) => ({
  // 初始状态
  user: null,
  isLoggedIn: false,
  redirectPath: null,

  // Actions

  /**
   * 设置用户信息
   */
  setUser: (user) => {
    set({
      user,
      isLoggedIn: !!user,
    })
    console.log('[UserStore] User set:', user?.id || 'null')
  },

  /**
   * 设置登录状态
   */
  setLoggedIn: (isLoggedIn) => {
    set({ isLoggedIn })
    console.log('[UserStore] Login status set:', isLoggedIn)
  },

  /**
   * 设置重定向路径
   */
  setRedirectPath: (path) => {
    set({ redirectPath: path })
    console.log('[UserStore] Redirect path set:', path || 'null')
  },

  /**
   * 清除用户信息
   */
  clearUser: () => {
    set({
      user: null,
      isLoggedIn: false,
      redirectPath: null,
    })
    console.log('[UserStore] User cleared')
  },
}))
