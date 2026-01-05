/**
 * @spec O007-miniapp-menu-api
 * 菜单分类 API 服务
 */

import Taro from '@tarojs/taro'
import { ApiResponse } from '../types/product'
import {
  ApiError,
  ApiErrorCode,
  createApiError,
  createNetworkError,
  createTimeoutError,
} from '../utils/error'

/**
 * 菜单分类 DTO
 */
export interface MenuCategoryDTO {
  id: string
  code: string
  displayName: string
  iconUrl?: string | null
  productCount?: number
}

/**
 * 是否使用 Mock 数据
 * 开发环境使用 Mock，生产环境调用后端 API
 */
const USE_MOCK = process.env.NODE_ENV === 'development'

/**
 * Mock 分类数据
 */
const MOCK_CATEGORIES: MenuCategoryDTO[] = [
  { id: 'cat-001', code: 'ALCOHOL', displayName: '经典特调', productCount: 5 },
  { id: 'cat-002', code: 'COFFEE', displayName: '精品咖啡', productCount: 4 },
  { id: 'cat-003', code: 'BEVERAGE', displayName: '经典饮品', productCount: 3 },
  { id: 'cat-004', code: 'SNACK', displayName: '主厨小食', productCount: 6 },
]

/**
 * 根据环境判断 API 基础 URL
 */
const getBaseURL = (): string => {
  const env = process.env.TARO_ENV

  if (env === 'weapp') {
    return 'https://your-production-api.com'
  } else if (env === 'h5') {
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : 'https://your-production-api.com'
  }

  return 'http://localhost:8080'
}

const BASE_URL = getBaseURL()

/**
 * @spec O007-miniapp-menu-api
 * 获取菜单分类列表
 * @returns 分类列表响应
 */
export async function fetchMenuCategories(): Promise<
  ApiResponse<MenuCategoryDTO[]>
> {
  // Mock 模式
  if (USE_MOCK) {
    console.log('🎭 使用 Mock 分类数据')
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      success: true,
      data: MOCK_CATEGORIES,
      timestamp: new Date().toISOString(),
      message: 'Mock 分类数据获取成功',
    }
  }

  // 真实 API 请求
  const url = `${BASE_URL}/api/client/menu-categories`

  try {
    const response = await Taro.request({
      url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    // 处理错误状态码
    if (response.statusCode !== 200) {
      throw createApiError(response.statusCode, response.data?.message, { url })
    }

    return response.data as ApiResponse<MenuCategoryDTO[]>
  } catch (error: unknown) {
    console.error('获取分类列表失败:', error)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      const msg = error.message.toLowerCase()

      if (msg.includes('timeout') || msg.includes('超时')) {
        throw createTimeoutError('请求超时，请检查网络后重试')
      }

      if (
        msg.includes('network') ||
        msg.includes('fail') ||
        msg.includes('连接')
      ) {
        throw createNetworkError('网络连接失败，请检查网络')
      }
    }

    throw new ApiError(
      ApiErrorCode.UNKNOWN,
      '请求失败，请稍后重试',
      undefined,
      { originalError: String(error) }
    )
  }
}
