/**
 * 认证服务单元测试
 *
 * 测试覆盖：
 * - silentLogin() 静默登录
 * - refreshToken() 刷新令牌
 * - checkTokenExpiry() 检查令牌过期
 * - logout() 退出登录
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Taro from '@tarojs/taro'
import { silentLogin, refreshToken, checkTokenExpiry, logout } from '../authService'
import * as storage from '../../utils/storage'
import { useUserStore } from '../../stores/userStore'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    login: vi.fn(),
    request: vi.fn(),
    showToast: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    reLaunch: vi.fn(),
  },
}))

// Mock storage utilities
vi.mock('../../utils/storage', () => ({
  setToken: vi.fn(),
  setUser: vi.fn(),
  clearAuth: vi.fn(),
  getRefreshToken: vi.fn(),
  getTokenExpiresAt: vi.fn(),
  getAccessToken: vi.fn(),
}))

// Mock userStore
vi.mock('../../stores/userStore', () => ({
  useUserStore: {
    getState: vi.fn(() => ({
      clearUser: vi.fn(),
    })),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('silentLogin', () => {
    it('应该成功完成静默登录流程', async () => {
      // Arrange
      const mockCode = '071abc123def456'
      const mockLoginResponse = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresIn: 604800,
        user: {
          id: 'user-123',
          openid: 'openid-123',
          nickname: null,
          avatarUrl: null,
          phone: null,
        },
      }

      vi.mocked(Taro.login).mockResolvedValue({ code: mockCode, errMsg: '' })
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: mockLoginResponse,
          timestamp: '2025-12-24T10:00:00Z',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act
      const result = await silentLogin()

      // Assert
      expect(Taro.login).toHaveBeenCalledOnce()
      expect(Taro.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/wechat-login'),
        method: 'POST',
        data: { code: mockCode },
        header: { 'Content-Type': 'application/json' },
      })
      expect(storage.setToken).toHaveBeenCalledWith(
        mockLoginResponse.accessToken,
        mockLoginResponse.refreshToken,
        mockLoginResponse.expiresIn
      )
      expect(storage.setUser).toHaveBeenCalledWith(mockLoginResponse.user)
      expect(result).toEqual(mockLoginResponse)
    })

    it('应该在登录失败时抛出错误', async () => {
      // Arrange
      vi.mocked(Taro.login).mockResolvedValue({ code: 'test-code', errMsg: '' })
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '登录失败',
          timestamp: '2025-12-24T10:00:00Z',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act & Assert
      await expect(silentLogin()).rejects.toThrow('登录失败')
      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '登录失败',
        icon: 'none',
        duration: 2000,
      })
    })

    it('应该在网络异常时显示提示', async () => {
      // Arrange
      vi.mocked(Taro.login).mockResolvedValue({ code: 'test-code', errMsg: '' })
      vi.mocked(Taro.request).mockRejectedValue({
        errMsg: 'request:fail timeout',
      })

      // Act & Assert
      await expect(silentLogin()).rejects.toThrow()
      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '网络异常，请重试',
        icon: 'none',
        duration: 2000,
      })
    })
  })

  describe('refreshToken', () => {
    it('应该成功刷新令牌', async () => {
      // Arrange
      const mockRefreshToken = 'mock_refresh_token'
      const mockNewTokens = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 604800,
      }

      vi.mocked(storage.getRefreshToken).mockReturnValue(mockRefreshToken)
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: mockNewTokens,
          timestamp: '2025-12-24T10:00:00Z',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act
      const result = await refreshToken()

      // Assert
      expect(storage.getRefreshToken).toHaveBeenCalledOnce()
      expect(Taro.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/refresh-token'),
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { refreshToken: mockRefreshToken },
      })
      expect(storage.setToken).toHaveBeenCalledWith(
        mockNewTokens.access_token,
        mockNewTokens.refresh_token,
        mockNewTokens.expires_in
      )
      expect(result.accessToken).toBe(mockNewTokens.access_token)
    })

    it('应该在没有 refresh token 时抛出错误', async () => {
      // Arrange
      vi.mocked(storage.getRefreshToken).mockReturnValue(null)

      // Act & Assert
      await expect(refreshToken()).rejects.toThrow('No refresh token found')
      expect(storage.clearAuth).toHaveBeenCalledOnce()
    })

    it('应该在刷新失败时清除认证数据', async () => {
      // Arrange
      vi.mocked(storage.getRefreshToken).mockReturnValue('invalid_token')
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 400,
        data: {
          success: false,
          message: '刷新令牌无效',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act & Assert
      await expect(refreshToken()).rejects.toThrow()
      expect(storage.clearAuth).toHaveBeenCalledOnce()
    })
  })

  describe('checkTokenExpiry', () => {
    it('应该在令牌即将过期时返回 true', async () => {
      // Arrange - 设置过期时间为 12 小时后
      const nowPlus12Hours = Date.now() + 12 * 60 * 60 * 1000
      vi.mocked(storage.getTokenExpiresAt).mockReturnValue(nowPlus12Hours)

      // Act
      const result = await checkTokenExpiry()

      // Assert
      expect(result).toBe(true) // < 1天，应该返回 true
    })

    it('应该在令牌仍然有效时返回 false', async () => {
      // Arrange - 设置过期时间为 3 天后
      const nowPlus3Days = Date.now() + 3 * 24 * 60 * 60 * 1000
      vi.mocked(storage.getTokenExpiresAt).mockReturnValue(nowPlus3Days)

      // Act
      const result = await checkTokenExpiry()

      // Assert
      expect(result).toBe(false) // > 1天，应该返回 false
    })

    it('应该在没有过期时间时返回 true', async () => {
      // Arrange
      vi.mocked(storage.getTokenExpiresAt).mockReturnValue(null)

      // Act
      const result = await checkTokenExpiry()

      // Assert
      expect(result).toBe(true) // 没有过期时间，视为已过期
    })

    it('应该在已过期时返回 true', async () => {
      // Arrange - 设置过期时间为 1 小时前
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      vi.mocked(storage.getTokenExpiresAt).mockReturnValue(oneHourAgo)

      // Act
      const result = await checkTokenExpiry()

      // Assert
      expect(result).toBe(true) // 已过期
    })
  })

  describe('logout', () => {
    it('应该清除所有认证数据并跳转首页', async () => {
      // Arrange
      const mockClearUser = vi.fn()
      vi.mocked(useUserStore.getState).mockReturnValue({
        clearUser: mockClearUser,
      } as any)

      vi.useFakeTimers()

      // Act
      const logoutPromise = logout()

      // Fast-forward time
      vi.advanceTimersByTime(1500)

      await logoutPromise

      // Assert
      expect(storage.clearAuth).toHaveBeenCalledOnce()
      expect(mockClearUser).toHaveBeenCalledOnce()
      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '已退出登录',
        icon: 'success',
        duration: 1500,
      })
      expect(Taro.reLaunch).toHaveBeenCalledWith({ url: '/pages/home/index' })

      vi.useRealTimers()
    })

    it('应该在出错时仍然清除认证数据', async () => {
      // Arrange
      const mockClearUser = vi.fn().mockImplementation(() => {
        throw new Error('Clear user failed')
      })
      vi.mocked(useUserStore.getState).mockReturnValue({
        clearUser: mockClearUser,
      } as any)

      // clearAuth should be called twice: once in try, once in catch
      const clearAuthSpy = vi.mocked(storage.clearAuth).mockClear()

      // Act
      await logout()

      // Assert
      expect(storage.clearAuth).toHaveBeenCalled()
      // clearAuth is called at least once, even when clearUser throws
      expect(storage.clearAuth.mock.calls.length).toBeGreaterThanOrEqual(1)
    })
  })
})
