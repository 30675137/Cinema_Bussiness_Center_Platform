/**
 * @spec O007-miniapp-menu-api
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

/**
 * 是否使用 Mock 数据
 * 开发环境下默认使用 Mock
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
      })
      
      const token = response.data.data?.token
      if (token) {
        Taro.setStorageSync('auth_token', token)
        return token
      }
    }
    
    return ''
  } catch (error) {
    console.error('静默登录失败:', error)
    throw new Error('登录失败，请重试')
  }
}

/**
 * 构建查询参数
 */
function buildQueryParams(params: ProductListParams): string {
  const queryParams = new URLSearchParams()
  
  if (params.category) {
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
      
      return retryResponse.data as ApiResponse<ChannelProductDTO[]>
    }
    
    // 处理其他错误状态码
    if (response.statusCode !== 200) {
      throw new Error(`请求失败: ${response.statusCode}`)
    }
    
    return response.data as ApiResponse<ChannelProductDTO[]>
  } catch (error: any) {
    console.error('获取商品列表失败:', error)
    throw new Error(error.message || '网络请求失败')
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
