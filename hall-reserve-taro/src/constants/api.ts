/**
 * @spec O009-miniapp-product-list
 * API endpoint constants for mini-program product list
 */

/**
 * Base API URL
 * - Development: http://localhost:8080
 * - Production: from environment variable
 */
export const BASE_URL =
  process.env.TARO_APP_API_URL || 'http://localhost:8080'

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  /**
   * Menu Categories API
   * GET /api/client/menu-categories
   * Returns all visible menu categories sorted by sortOrder
   */
  MENU_CATEGORIES: '/api/client/menu-categories',

  /**
   * Channel Products API
   * GET /api/client/channel-products?categoryId={uuid}&page={number}&pageSize={number}
   * Returns products filtered by category with pagination
   */
  CHANNEL_PRODUCTS: '/api/client/channel-products',

  /**
   * Auth/Token APIs
   */
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh',
} as const

/**
 * Default query parameters
 */
export const DEFAULT_PARAMS = {
  PAGE_SIZE: 20,
  INITIAL_PAGE: 1,
  CHANNEL: 'MINIAPP',
} as const

/**
 * Cache configuration (in milliseconds)
 */
export const CACHE_CONFIG = {
  /**
   * Categories cache: 30 minutes
   * Category data changes infrequently
   */
  CATEGORIES_STALE_TIME: 30 * 60 * 1000,
  CATEGORIES_CACHE_TIME: 60 * 60 * 1000,

  /**
   * Products cache: 5 minutes
   * Products data may change more frequently (price, stock)
   */
  PRODUCTS_STALE_TIME: 5 * 60 * 1000,
  PRODUCTS_CACHE_TIME: 10 * 60 * 1000,
  PRODUCTS_REFETCH_INTERVAL: 60 * 1000, // 1 minute background polling
} as const

/**
 * API timeout configuration (in milliseconds)
 */
export const TIMEOUT_CONFIG = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000, // 60 seconds for image upload
} as const

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  /**
   * Max retry attempts for failed requests
   */
  MAX_RETRIES: 2,

  /**
   * Retry delay calculation (exponential backoff)
   * @param attemptIndex - 0-based retry attempt index
   * @returns delay in milliseconds
   */
  RETRY_DELAY: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const

/**
 * Request headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const

/**
 * Helper function to build full API URL
 * @param endpoint - API endpoint path
 * @returns Full URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${BASE_URL}${endpoint}`
}

/**
 * Helper function to build query string
 * @param params - Query parameters object
 * @returns Query string (e.g., "?key1=value1&key2=value2")
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean | null | undefined>
): string => {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== null && value !== undefined
  )

  if (filtered.length === 0) return ''

  const queryParams = filtered
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return `?${queryParams}`
}
