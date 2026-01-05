/**
 * @spec O007-miniapp-menu-api
 * @spec O002-miniapp-menu-config
 * 渠道商品 API 服务
 */

import Taro from '@tarojs/taro'
import {
  ChannelProductDTO,
  ProductListParams,
  ApiResponse,
  ProductCard,
} from '../types/product'
import { formatPrice } from '../utils/price'
import { MOCK_PRODUCTS, filterByCategory } from './mockData'
import {
  ApiError,
  ApiErrorCode,
  createApiError,
  createNetworkError,
  createTimeoutError,
} from '../utils/error'

/**
 * 是否使用 Mock 数据
 * 开发环境使用 Mock，生产环境调用后端 API
 */
const USE_MOCK = process.env.NODE_ENV === 'development'

/**
 * 根据环境判断 API 基础 URL
 */
const getBaseURL = (): string => {
  const env = process.env.TARO_ENV
  
  if (env === 'weapp') {
    // 微信小程序环境
    return 'https://your-production-api.com'
  } else if (env === 'h5') {
    // H5 环境
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : 'https://your-production-api.com'
  }
  
  return 'http://localhost:8080'
}

const BASE_URL = getBaseURL()

/**
 * 获取 Authorization Token
 */
async function getAuthToken(): Promise<string> {
  try {
    const token = Taro.getStorageSync('auth_token')
    return token || ''
  } catch (error) {
    console.warn('获取 token 失败:', error)
    return ''
  }
}

/**
 * 静默登录（处理 401 错误）
 * @throws {ApiError} 登录失败时抛出认证错误
 */
async function silentLogin(): Promise<string> {
  try {
    // 微信小程序环境
    if (process.env.TARO_ENV === 'weapp') {
      const { code } = await Taro.login()

      // 调用后端换取 token
      const response = await Taro.request({
        url: `${BASE_URL}/api/auth/login`,
        method: 'POST',
        data: { code },
        timeout: 10000,
      })

      const token = response.data.data?.token
      if (token) {
        Taro.setStorageSync('auth_token', token)
        return token
      }

      throw new ApiError(
        ApiErrorCode.UNAUTHORIZED,
        '登录失败，未获取到有效凭证',
        401
      )
    }

    // H5 环境：返回空 token，后续会触发登录引导
    return ''
  } catch (error) {
    console.error('静默登录失败:', error)

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      ApiErrorCode.UNAUTHORIZED,
      '登录失败，请重试',
      401
    )
  }
}

/**
 * @spec O002-miniapp-menu-config
 * 构建查询参数 - 支持 categoryId 优先级
 */
function buildQueryParams(params: ProductListParams): string {
  const queryParams = new URLSearchParams()

  // O002: categoryId 优先级最高
  if (params.categoryId) {
    queryParams.append('categoryId', params.categoryId)
  } else if (params.category) {
    // category (code) 作为后备
    queryParams.append('category', params.category)
  }
  if (params.salesChannel) {
    queryParams.append('salesChannel', params.salesChannel)
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.pageSize !== undefined) {
    queryParams.append('pageSize', params.pageSize.toString())
  }
  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy)
  }
  if (params.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder)
  }

  return queryParams.toString()
}

/**
 * 获取商品列表（支持 Mock 模式）
 * @param params 查询参数
 * @returns 商品列表响应
 */
export async function fetchProducts(
  params: ProductListParams
): Promise<ApiResponse<ChannelProductDTO[]>> {
  // Mock 模式
  if (USE_MOCK) {
    console.log('🎭 使用 Mock 数据', params)
    
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // 根据分类过滤
    let filteredProducts = filterByCategory(
      MOCK_PRODUCTS,
      params.category || null
    )
    
    // 根据状态过滤
    if (params.status) {
      filteredProducts = filteredProducts.filter(
        (p) => p.status === params.status
      )
    }
    
    // 排序
    if (params.sortBy) {
      filteredProducts.sort((a, b) => {
        const aVal = a[params.sortBy!]
        const bVal = b[params.sortBy!]
        const order = params.sortOrder === 'desc' ? -1 : 1
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order
        }
        return ((aVal as number) - (bVal as number)) * order
      })
    }
    
    return {
      success: true,
      data: filteredProducts,
      timestamp: new Date().toISOString(),
      message: 'Mock 数据获取成功',
    }
  }
  
  // 真实 API 请求
  const queryString = buildQueryParams(params)
  const url = `${BASE_URL}/api/client/channel-products${queryString ? `?${queryString}` : ''}`

  try {
    const token = await getAuthToken()

    const response = await Taro.request({
      url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      timeout: 10000,
    })

    // 处理 401 错误（Token 过期）
    if (response.statusCode === 401) {
      console.log('Token 过期，尝试静默登录')
      const newToken = await silentLogin()

      // 使用新 token 重试
      const retryResponse = await Taro.request({
        url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
        timeout: 10000,
      })

      // 重试后仍然失败
      if (retryResponse.statusCode !== 200) {
        throw createApiError(
          retryResponse.statusCode,
          retryResponse.data?.message,
          { url, retried: true }
        )
      }

      return retryResponse.data as ApiResponse<ChannelProductDTO[]>
    }

    // 处理其他错误状态码
    if (response.statusCode !== 200) {
      throw createApiError(
        response.statusCode,
        response.data?.message,
        { url }
      )
    }

    return response.data as ApiResponse<ChannelProductDTO[]>
  } catch (error: unknown) {
    console.error('获取商品列表失败:', error)

    // 已经是 ApiError，直接抛出
    if (error instanceof ApiError) {
      throw error
    }

    // 判断错误类型
    if (error instanceof Error) {
      const msg = error.message.toLowerCase()

      // 网络超时
      if (msg.includes('timeout') || msg.includes('超时')) {
        throw createTimeoutError('请求超时，请检查网络后重试')
      }

      // 网络错误
      if (
        msg.includes('network') ||
        msg.includes('fail') ||
        msg.includes('连接')
      ) {
        throw createNetworkError('网络连接失败，请检查网络')
      }
    }

    // 未知错误
    throw new ApiError(
      ApiErrorCode.UNKNOWN,
      '请求失败，请稍后重试',
      undefined,
      { originalError: String(error) }
    )
  }
}

/**
 * 将 DTO 转换为 ProductCard
 * @param dto 渠道商品 DTO
 * @returns 商品卡片数据
 */
export function toProductCard(dto: ChannelProductDTO): ProductCard {
  return {
    id: dto.id,
    name: dto.productName,
    imageUrl: dto.mainImageUrl || '/assets/images/placeholder.svg',
    priceText: formatPrice(dto.priceInCents),
    tags: dto.tags,
    minSalesUnit: '杯', // 默认单位
    isAvailable: dto.status === 'ACTIVE' && dto.stockStatus === 'IN_STOCK',
    category: dto.category,
  }
}
