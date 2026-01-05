/**
 * @spec O009-miniapp-product-list
 * Product API service for fetching channel products
 */

import { get } from './request'
import { API_ENDPOINTS, DEFAULT_PARAMS } from '@/constants/api'
import type {
  ChannelProductDTO,
  ProductListResponse,
} from '@/types/product'

/**
 * Fetch channel products query parameters
 */
export interface FetchProductsParams {
  /** Category ID filter (UUID, optional) */
  categoryId?: string | null
  /** Page number (1-based) */
  page?: number
  /** Page size (default 20) */
  pageSize?: number
  /** Channel type (default MINIAPP) */
  channel?: 'MINIAPP' | 'POS'
}

/**
 * Fetch channel products from API
 * @param params - Query parameters
 * @returns Product list response with pagination
 * @example
 * // Fetch all products (first page)
 * fetchProducts({})
 *
 * // Fetch products by category
 * fetchProducts({ categoryId: 'uuid-xxx' })
 *
 * // Fetch second page
 * fetchProducts({ categoryId: 'uuid-xxx', page: 2 })
 */
export const fetchProducts = async (
  params: FetchProductsParams = {}
): Promise<ProductListResponse> => {
  const {
    categoryId = null,
    page = DEFAULT_PARAMS.INITIAL_PAGE,
    pageSize = DEFAULT_PARAMS.PAGE_SIZE,
    channel = DEFAULT_PARAMS.CHANNEL,
  } = params

  // Build query parameters
  const queryParams: Record<string, string | number> = {
    page,
    pageSize,
    channel,
  }

  // Add categoryId if provided (null means fetch all products)
  if (categoryId !== null && categoryId !== undefined) {
    queryParams.categoryId = categoryId
  }

  try {
    const response = await get<ProductListResponse>(
      API_ENDPOINTS.CHANNEL_PRODUCTS,
      queryParams
    )

    return response
  } catch (error) {
    console.error('Failed to fetch products:', error)
    throw error
  }
}

/**
 * Fetch single product by ID
 * @param productId - Product configuration ID (UUID)
 * @returns Channel product DTO
 */
export const fetchProductById = async (
  productId: string
): Promise<ChannelProductDTO> => {
  try {
    const response = await get<ChannelProductDTO>(
      `${API_ENDPOINTS.CHANNEL_PRODUCTS}/${productId}`
    )

    return response
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error)
    throw error
  }
}

/**
 * Fetch recommended products
 * @param params - Query parameters (optional)
 * @returns Product list response
 */
export const fetchRecommendedProducts = async (
  params: Omit<FetchProductsParams, 'categoryId'> = {}
): Promise<ProductListResponse> => {
  const {
    page = DEFAULT_PARAMS.INITIAL_PAGE,
    pageSize = DEFAULT_PARAMS.PAGE_SIZE,
    channel = DEFAULT_PARAMS.CHANNEL,
  } = params

  try {
    const response = await get<ProductListResponse>(
      `${API_ENDPOINTS.CHANNEL_PRODUCTS}/recommended`,
      {
        page,
        pageSize,
        channel,
      }
    )

    return response
  } catch (error) {
    console.error('Failed to fetch recommended products:', error)
    throw error
  }
}

/**
 * Search products by keyword
 * @param keyword - Search keyword
 * @param params - Query parameters (optional)
 * @returns Product list response
 */
export const searchProducts = async (
  keyword: string,
  params: Omit<FetchProductsParams, 'categoryId'> = {}
): Promise<ProductListResponse> => {
  if (!keyword || keyword.trim() === '') {
    throw new Error('Search keyword cannot be empty')
  }

  const {
    page = DEFAULT_PARAMS.INITIAL_PAGE,
    pageSize = DEFAULT_PARAMS.PAGE_SIZE,
    channel = DEFAULT_PARAMS.CHANNEL,
  } = params

  try {
    const response = await get<ProductListResponse>(
      `${API_ENDPOINTS.CHANNEL_PRODUCTS}/search`,
      {
        keyword: keyword.trim(),
        page,
        pageSize,
        channel,
      }
    )

    return response
  } catch (error) {
    console.error(`Failed to search products with keyword "${keyword}":`, error)
    throw error
  }
}
