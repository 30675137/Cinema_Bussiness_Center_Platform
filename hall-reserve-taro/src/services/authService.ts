/**
 * 认证服务
 *
 * 提供用户认证相关的业务逻辑：
 * - 静默登录
 * - 令牌刷新
 * - 退出登录
 */

import Taro from '@tarojs/taro'
import { LoginRequest, LoginResponse, ApiResponse, Token } from '../types/auth'
import { setToken, setUser, clearAuth, getRefreshToken, getTokenExpiresAt } from '../utils/storage'
import { useUserStore } from '../stores/userStore'

/**
 * API 基础 URL
 * 根据环境自动切换
 */
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.cinema-hall.com' // 生产环境
  : 'http://192.168.10.71:8080' // 开发环境 - 使用局域网IP

/**
 * 静默登录
 *
 * 调用 wx.login 获取 code，然后调用后端登录接口获取令牌和用户信息
 *
 * @returns Promise<LoginResponse> 登录响应
 * @throws Error 如果登录失败
 */
export const silentLogin = async (): Promise<LoginResponse> => {
  console.log('[AuthService] Starting silent login...')

  try {
    // Step 1: 调用 Taro.login 获取微信 code
    const { code } = await Taro.login()

    if (!code) {
      throw new Error('获取微信登录凭证失败')
    }

    console.log('[AuthService] Got WeChat code:', code.substring(0, 4) + '****')

    // Step 2: 调用后端登录接口
    const loginRequest: LoginRequest = { code }

    const response = await Taro.request({
      url: `${API_BASE_URL}/api/auth/wechat-login`,
      method: 'POST',
      data: loginRequest,
      header: {
        'Content-Type': 'application/json',
      },
    })

    const apiResponse = response.data as ApiResponse<LoginResponse>

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || '登录失败')
    }

    const loginResponse = apiResponse.data

    // Step 3: 存储令牌和用户信息到本地
    setToken(
      loginResponse.accessToken,
      loginResponse.refreshToken,
      loginResponse.expiresIn
    )
    setUser(loginResponse.user)

    console.log('[AuthService] Silent login successful, user ID:', loginResponse.user.id)

    return loginResponse

  } catch (error: any) {
    console.error('[AuthService] Silent login failed:', error)

    // 网络异常提示
    if (error.errMsg?.includes('request:fail')) {
      Taro.showToast({
        title: '网络异常，请重试',
        icon: 'none',
        duration: 2000,
      })
    } else {
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none',
        duration: 2000,
      })
    }

    throw error
  }
}

/**
 * 刷新访问令牌
 *
 * 使用 Refresh Token 获取新的 Access Token
 *
 * @returns 新的令牌信息
 */
export const refreshToken = async (): Promise<Token> => {
  console.log('[AuthService] Refreshing token...')

  try {
    // Step 1: 获取当前 refreshToken
    const currentRefreshToken = getRefreshToken()
    if (!currentRefreshToken) {
      throw new Error('No refresh token found')
    }

    // Step 2: 调用后端 /api/auth/refresh-token 接口
    const response = await Taro.request({
      url: `${API_BASE_URL}/api/auth/refresh-token`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        refreshToken: currentRefreshToken,
      },
    })

    // Step 3: 检查响应
    if (response.statusCode !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Token refresh failed')
    }

    const tokenData = response.data.data
    const expiresIn = tokenData.expires_in || tokenData.expiresIn
    const newToken: Token = {
      accessToken: tokenData.access_token || tokenData.accessToken,
      refreshToken: tokenData.refresh_token || tokenData.refreshToken,
      expiresAt: Date.now() + expiresIn * 1000, // 转换为时间戳
    }

    // Step 4: 更新本地存储
    setToken(newToken.accessToken, newToken.refreshToken, expiresIn)

    console.log('[AuthService] Token refreshed successfully')
    return newToken

  } catch (error) {
    console.error('[AuthService] Failed to refresh token:', error)
    // 刷新失败，清除本地认证数据
    clearAuth()
    throw error
  }
}

/**
 * 退出登录
 *
 * 清除本地存储的所有认证数据,重置用户状态,并跳转到首页
 */
export const logout = async (): Promise<void> => {
  console.log('[AuthService] Logging out...')

  try {
    // Step 1: 清除本地存储的认证数据
    clearAuth()

    // Step 2: 清除 userStore 中的用户状态
    const { clearUser } = useUserStore.getState()
    clearUser()

    // Step 3: 显示退出成功提示
    Taro.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 1500,
    })

    // Step 4: 跳转到首页(延迟跳转,让用户看到提示)
    setTimeout(() => {
      Taro.reLaunch({ url: '/pages/home/index' })
    }, 1500)

    console.log('[AuthService] Logout successful')

  } catch (error) {
    console.error('[AuthService] Logout error:', error)
    // 即使出错也要清除认证数据
    clearAuth()
  }
}

/**
 * 检查令牌是否即将过期
 *
 * 距离过期仅剩 1 天（24小时）时返回 true
 *
 * @returns 如果令牌即将过期（剩余时间 < 1天）返回 true
 */
export const checkTokenExpiry = async (): Promise<boolean> => {
  console.log('[AuthService] Checking token expiry...')

  try {
    const expiresAt = getTokenExpiresAt()

    if (!expiresAt) {
      console.log('[AuthService] No token expiry time found')
      return true // 没有过期时间，视为已过期
    }

    const now = Date.now()
    const timeUntilExpiry = expiresAt - now

    // 1 天 = 24 * 60 * 60 * 1000 = 86400000 毫秒
    const oneDayInMs = 24 * 60 * 60 * 1000
    const isExpiringSoon = timeUntilExpiry < oneDayInMs

    if (isExpiringSoon) {
      const hoursLeft = Math.floor(timeUntilExpiry / (60 * 60 * 1000))
      console.log(`[AuthService] Token expiring soon (${hoursLeft} hours left)`)
    } else {
      const daysLeft = Math.floor(timeUntilExpiry / oneDayInMs)
      console.log(`[AuthService] Token valid for ${daysLeft} more days`)
    }

    return isExpiringSoon

  } catch (error) {
    console.error('[AuthService] Error checking token expiry:', error)
    return true // 出错时视为已过期
  }
}
