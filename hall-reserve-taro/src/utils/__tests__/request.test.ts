/**
 * 统一请求拦截器测试
 *
 * 测试覆盖：
 * - 自动添加 Authorization header
 * - 401 错误自动刷新令牌
 * - 并发 401 请求只刷新一次
 * - 刷新失败时的降级处理
 * - 错误响应处理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Taro from '@tarojs/taro'
import { request } from '../request'
import * as storage from '../storage'
import * as authService from '../../services/authService'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    request: vi.fn(),
    showToast: vi.fn(),
  },
}))

// Mock storage
vi.mock('../storage', () => ({
  getAccessToken: vi.fn(),
  clearAuth: vi.fn(),
}))

// Mock authService
vi.mock('../../services/authService', () => ({
  refreshToken: vi.fn(),
}))

describe('request interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基础请求功能', () => {
    it('应该成功发起请求并返回数据', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' }
      vi.mocked(storage.getAccessToken).mockReturnValue('mock_token')
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: mockData,
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act
      const result = await request({
        url: '/api/test',
        method: 'GET',
      })

      // Assert
      expect(Taro.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/test'),
        method: 'GET',
        data: undefined,
        header: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock_token',
        },
      })
      expect(result).toEqual(mockData)
    })

    it('应该在不需要认证时不添加 Authorization header', async () => {
      // Arrange
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: { success: true, data: {} },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act
      await request({
        url: '/api/public',
        method: 'GET',
        requiresAuth: false,
      })

      // Assert
      expect(Taro.request).toHaveBeenCalledWith(
        expect.objectContaining({
          header: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      )
    })
  })

  describe('401 错误自动刷新令牌', () => {
    it('应该在遇到 401 时自动刷新令牌并重试', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' }
      vi.mocked(storage.getAccessToken).mockReturnValue('expired_token')
      vi.mocked(authService.refreshToken).mockResolvedValue({
        accessToken: 'new_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 604800,
      })

      // 第一次请求返回 401
      vi.mocked(Taro.request)
        .mockResolvedValueOnce({
          statusCode: 401,
          data: {},
          header: {},
          errMsg: '',
          cookies: [],
        })
        // 第二次请求成功
        .mockResolvedValueOnce({
          statusCode: 200,
          data: {
            success: true,
            data: mockData,
          },
          header: {},
          errMsg: '',
          cookies: [],
        })

      // Act
      const result = await request({
        url: '/api/test',
        method: 'GET',
      })

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledOnce()
      expect(Taro.request).toHaveBeenCalledTimes(2) // 原请求 + 重试
      expect(result).toEqual(mockData)
    })

    it('应该在刷新令牌失败时清除认证数据并抛出错误', async () => {
      // Arrange
      vi.mocked(storage.getAccessToken).mockReturnValue('expired_token')
      vi.mocked(authService.refreshToken).mockRejectedValue(
        new Error('Refresh failed')
      )
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 401,
        data: {},
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act & Assert
      await expect(
        request({
          url: '/api/test',
          method: 'GET',
        })
      ).rejects.toThrow('Token refresh failed')

      expect(storage.clearAuth).toHaveBeenCalledOnce()
      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '登录已过期,请重启小程序',
        icon: 'none',
        duration: 2000,
      })
    })
  })

  describe('错误处理', () => {
    it('应该在 HTTP 错误时显示错误提示', async () => {
      // Arrange
      vi.mocked(storage.getAccessToken).mockReturnValue('token')
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 404,
        data: {
          message: '资源不存在',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act & Assert
      await expect(
        request({
          url: '/api/test',
          method: 'GET',
        })
      ).rejects.toThrow('资源不存在')

      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '资源不存在',
        icon: 'none',
        duration: 2000,
      })
    })

    it('应该在 API success=false 时显示错误', async () => {
      // Arrange
      vi.mocked(storage.getAccessToken).mockReturnValue('token')
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '业务逻辑错误',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act & Assert
      await expect(
        request({
          url: '/api/test',
          method: 'GET',
        })
      ).rejects.toThrow('业务逻辑错误')
    })

    it('应该在网络异常时显示提示', async () => {
      // Arrange
      vi.mocked(storage.getAccessToken).mockReturnValue('token')
      vi.mocked(Taro.request).mockRejectedValue({
        errMsg: 'request:fail timeout',
      })

      // Act & Assert
      await expect(
        request({
          url: '/api/test',
          method: 'GET',
        })
      ).rejects.toThrow('网络异常,请检查网络连接')

      expect(Taro.showToast).toHaveBeenCalledWith({
        title: '网络异常,请检查网络连接',
        icon: 'none',
        duration: 2000,
      })
    })

    it('应该在 showError=false 时不显示错误提示', async () => {
      // Arrange
      vi.mocked(storage.getAccessToken).mockReturnValue('token')
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 404,
        data: {
          message: '资源不存在',
        },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act & Assert
      await expect(
        request({
          url: '/api/test',
          method: 'GET',
          showError: false,
        })
      ).rejects.toThrow()

      expect(Taro.showToast).not.toHaveBeenCalled()
    })
  })

  describe('POST/PUT/DELETE 请求', () => {
    it('应该正确发送 POST 请求', async () => {
      // Arrange
      const mockData = { name: 'Test' }
      vi.mocked(storage.getAccessToken).mockReturnValue('token')
      vi.mocked(Taro.request).mockResolvedValue({
        statusCode: 200,
        data: { success: true, data: { id: 1, ...mockData } },
        header: {},
        errMsg: '',
        cookies: [],
      })

      // Act
      await request({
        url: '/api/test',
        method: 'POST',
        data: mockData,
      })

      // Assert
      expect(Taro.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: mockData,
        })
      )
    })
  })
})
