/**
 * @spec O009-miniapp-product-list
 * Unit tests for API request service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Taro from '@tarojs/taro'
import {
  request,
  get,
  post,
  put,
  del,
  getAccessToken,
  setAccessToken,
  clearTokens,
  RequestError,
} from '../request'

// Mock Taro APIs
vi.mock('@tarojs/taro', () => ({
  default: {
    request: vi.fn(),
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
    navigateTo: vi.fn(),
  },
}))

describe('Token Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get access token from storage', () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('mock-token')

    const token = getAccessToken()

    expect(token).toBe('mock-token')
    expect(Taro.getStorageSync).toHaveBeenCalledWith('access_token')
  })

  it('should set access token to storage', () => {
    setAccessToken('new-token')

    expect(Taro.setStorageSync).toHaveBeenCalledWith('access_token', 'new-token')
  })

  it('should clear all tokens', () => {
    clearTokens()

    expect(Taro.removeStorageSync).toHaveBeenCalledWith('access_token')
    expect(Taro.removeStorageSync).toHaveBeenCalledWith('refresh_token')
  })
})

describe('Request Function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should make successful GET request', async () => {
    const mockData = { id: '1', name: 'Test' }
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: {
        success: true,
        data: mockData,
        timestamp: '2025-01-01T00:00:00Z',
      },
    } as any)

    const result = await request({
      url: '/api/test',
      method: 'GET',
    })

    expect(result).toEqual(mockData)
    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/api/test'),
      })
    )
  })

  it('should include Authorization header when token exists', async () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('mock-token')
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: { success: true, data: {}, timestamp: '2025-01-01T00:00:00Z' },
    } as any)

    await request({ url: '/api/test' })

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        header: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    )
  })

  it('should skip Authorization header when skipAuth is true', async () => {
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: { success: true, data: {}, timestamp: '2025-01-01T00:00:00Z' },
    } as any)

    await request({ url: '/api/test', skipAuth: true })

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        header: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      })
    )
  })

  it('should throw RequestError for API failure', async () => {
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: {
        success: false,
        message: 'Not found',
        error: 'RESOURCE_NOT_FOUND',
        timestamp: '2025-01-01T00:00:00Z',
      },
    } as any)

    await expect(request({ url: '/api/test' })).rejects.toThrow(RequestError)
    await expect(request({ url: '/api/test' })).rejects.toThrow('Not found')
  })

  it('should throw RequestError for HTTP 404', async () => {
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 404,
      data: {
        message: 'Resource not found',
        error: 'NOT_FOUND',
      },
    } as any)

    await expect(request({ url: '/api/test' })).rejects.toThrow(RequestError)
  })

  it('should throw RequestError for network errors', async () => {
    vi.mocked(Taro.request).mockRejectedValue(new Error('Network error'))

    await expect(request({ url: '/api/test' })).rejects.toThrow(RequestError)
    await expect(request({ url: '/api/test' })).rejects.toThrow('网络请求失败')
  })
})

describe('HTTP Method Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: { success: true, data: {}, timestamp: '2025-01-01T00:00:00Z' },
    } as any)
  })

  it('should make GET request with query params', async () => {
    await get('/api/test', { id: '1', name: 'test' })

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('?id=1&name=test'),
      })
    )
  })

  it('should make POST request with data', async () => {
    await post('/api/test', { name: 'test' })

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: { name: 'test' },
      })
    )
  })

  it('should make PUT request with data', async () => {
    await put('/api/test', { name: 'updated' })

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        data: { name: 'updated' },
      })
    )
  })

  it('should make DELETE request', async () => {
    await del('/api/test')

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
      })
    )
  })

  it('should filter out null and undefined query params', async () => {
    await get('/api/test', { id: '1', name: null, age: undefined })

    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('?id=1'),
      })
    )
    expect(Taro.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining('name'),
      })
    )
  })
})

describe('Token Refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should refresh token on 401 and retry request', async () => {
    const mockData = { id: '1', name: 'Test' }

    // First call: 401 Unauthorized
    // Second call (refresh token): Success
    // Third call (retry original): Success
    vi.mocked(Taro.request)
      .mockResolvedValueOnce({
        statusCode: 401,
        data: { message: 'Unauthorized' },
      } as any)
      .mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          data: { accessToken: 'new-token' },
          timestamp: '2025-01-01T00:00:00Z',
        },
      } as any)
      .mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          data: mockData,
          timestamp: '2025-01-01T00:00:00Z',
        },
      } as any)

    vi.mocked(Taro.getStorageSync).mockReturnValue('old-refresh-token')

    const result = await request({ url: '/api/test' })

    expect(result).toEqual(mockData)
    expect(Taro.setStorageSync).toHaveBeenCalledWith('access_token', 'new-token')
    expect(Taro.request).toHaveBeenCalledTimes(3)
  })

  it('should navigate to login page if token refresh fails', async () => {
    // First call: 401 Unauthorized
    // Second call (refresh token): Failed
    vi.mocked(Taro.request)
      .mockResolvedValueOnce({
        statusCode: 401,
        data: { message: 'Unauthorized' },
      } as any)
      .mockRejectedValueOnce(new Error('Refresh failed'))

    vi.mocked(Taro.getStorageSync).mockReturnValue('old-refresh-token')

    await expect(request({ url: '/api/test' })).rejects.toThrow(RequestError)
    expect(Taro.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/index' })
    expect(Taro.removeStorageSync).toHaveBeenCalledWith('access_token')
    expect(Taro.removeStorageSync).toHaveBeenCalledWith('refresh_token')
  })
})
