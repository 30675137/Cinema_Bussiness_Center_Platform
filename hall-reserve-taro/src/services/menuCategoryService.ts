/**
 * @spec O002-miniapp-menu-config
 * C端菜单分类 API 服务
 */
import Taro from '@tarojs/taro'
import { API_CONFIG } from '../config'
import type { MenuCategoryDTO, MenuCategoryListResponse } from '../types/menuCategory'

/**
 * 错误响应格式
 */
interface ErrorResponse {
  success: false
  error: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

/**
 * 统一请求封装 - 包含网络错误重试
 */
async function request<T>(options: Taro.request.Option, retryCount = 0): Promise<T> {
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1秒

  try {
    // 检查网络状态
    const networkInfo = await Taro.getNetworkType()
    if (networkInfo.networkType === 'none') {
      throw new Error('NETWORK_OFFLINE')
    }

    const token = Taro.getStorageSync('access_token')

    const response = await Taro.request({
      ...options,
      url: `${API_CONFIG.BASE_URL}${options.url}`,
      timeout: API_CONFIG.TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
    })

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data as T
    }

    // 处理错误响应
    const errorData = response.data as ErrorResponse
    throw new Error(errorData.message || '请求失败')
  } catch (error: unknown) {
    const err = error as Error & { errMsg?: string }

    // 网络离线错误
    if (err.message === 'NETWORK_OFFLINE') {
      Taro.showToast({
        title: '网络已断开，请检查网络连接',
        icon: 'none',
        duration: 2000,
      })
      throw error
    }

    // 网络超时或连接错误，尝试重试
    const isNetworkError =
      err.errMsg?.includes('timeout') ||
      err.errMsg?.includes('fail') ||
      err.errMsg?.includes('abort')

    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.warn(`网络请求失败，正在重试... (第${retryCount + 1}次)`)

      // 等待一段时间后重试
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))

      return request<T>(options, retryCount + 1)
    }

    // 重试耗尽或其他错误
    console.error('API请求失败:', error)

    if (retryCount >= MAX_RETRIES) {
      Taro.showToast({
        title: '网络请求失败，请稍后重试',
        icon: 'none',
        duration: 2000,
      })
    }

    throw error
  }
}

// ============================================================================
// 菜单分类 API
// ============================================================================

/**
 * 获取菜单分类列表
 * T048: GET /api/client/menu-categories
 *
 * @returns 按 sortOrder 排序的可见分类列表，包含商品数量
 */
export async function getMenuCategories(): Promise<MenuCategoryDTO[]> {
  const response = await request<MenuCategoryListResponse>({
    url: '/api/client/menu-categories',
    method: 'GET',
  })

  return response.data || []
}

/**
 * 获取菜单分类列表（带缓存策略）
 * 本地缓存 5 分钟，减少 API 调用
 */
export async function getMenuCategoriesWithCache(): Promise<MenuCategoryDTO[]> {
  const CACHE_KEY = 'menu_categories_cache'
  const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

  try {
    // 尝试从缓存读取
    const cachedData = Taro.getStorageSync(CACHE_KEY) as {
      data: MenuCategoryDTO[]
      timestamp: number
    } | null

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      console.log('[menuCategoryService] 使用缓存数据')
      return cachedData.data
    }

    // 缓存过期或不存在，从 API 获取
    const categories = await getMenuCategories()

    // 更新缓存
    Taro.setStorageSync(CACHE_KEY, {
      data: categories,
      timestamp: Date.now(),
    })

    return categories
  } catch (error) {
    console.error('[menuCategoryService] 获取分类失败:', error)

    // 如果 API 失败，尝试返回过期的缓存数据
    const cachedData = Taro.getStorageSync(CACHE_KEY) as {
      data: MenuCategoryDTO[]
      timestamp: number
    } | null

    if (cachedData) {
      console.warn('[menuCategoryService] API 失败，使用过期缓存')
      return cachedData.data
    }

    throw error
  }
}

/**
 * 清除分类缓存
 * 在需要强制刷新时调用
 */
export function clearMenuCategoryCache(): void {
  Taro.removeStorageSync('menu_categories_cache')
}

// ============================================================================
// 导出
// ============================================================================

export const menuCategoryService = {
  getMenuCategories,
  getMenuCategoriesWithCache,
  clearMenuCategoryCache,
}

export default menuCategoryService
