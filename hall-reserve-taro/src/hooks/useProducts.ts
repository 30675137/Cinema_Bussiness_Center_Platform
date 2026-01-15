/**
 * @spec O009-miniapp-product-list
 * React hooks for product data fetching with TanStack Query
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProductById,
  fetchRecommendedProducts,
  searchProducts,
} from '@/services/productService'
import type { FetchProductsParams } from '@/services/productService'
import type { ProductListResponse, ChannelProductDTO } from '@/types/product'
import { CACHE_CONFIG } from '@/constants/api'

/**
 * Query key factory for products
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: FetchProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  recommended: () => [...productKeys.all, 'recommended'] as const,
  search: (keyword: string) => [...productKeys.all, 'search', keyword] as const,
}

/**
 * Hook to fetch products with optional category filter
 * @param params - Query parameters
 * @param options - TanStack Query options
 * @returns Query result with product list
 * @example
 * // Fetch all products
 * const { data, isLoading } = useProducts({})
 *
 * // Fetch products by category
 * const { data } = useProducts({ categoryId: 'uuid-xxx' })
 */
export const useProducts = (
  params: FetchProductsParams = {},
  options?: Omit<
    UseQueryOptions<ProductListResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
    gcTime: CACHE_CONFIG.PRODUCTS_CACHE_TIME,
    refetchInterval: CACHE_CONFIG.PRODUCTS_REFETCH_INTERVAL,
    ...options,
  })
}

/**
 * Hook to fetch products with infinite scroll pagination
 * @param params - Base query parameters (excluding page)
 * @param options - TanStack Query infinite options
 * @returns Infinite query result with paginated products
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteProducts({ categoryId: 'uuid-xxx' })
 */
export const useInfiniteProducts = (
  params: Omit<FetchProductsParams, 'page'> = {},
  options?: Omit<
    UseInfiniteQueryOptions<ProductListResponse>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  return useInfiniteQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ pageParam }) =>
      fetchProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasNext) {
        return allPages.length + 1
      }
      return undefined
    },
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
    gcTime: CACHE_CONFIG.PRODUCTS_CACHE_TIME,
    ...options,
  })
}

/**
 * Hook to fetch a single product by ID
 * @param productId - Product configuration ID (UUID)
 * @param options - TanStack Query options
 * @returns Query result with product detail
 * @example
 * const { data, isLoading } = useProduct('uuid-xxx')
 */
export const useProduct = (
  productId: string,
  options?: Omit<
    UseQueryOptions<ChannelProductDTO>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProductById(productId),
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
    gcTime: CACHE_CONFIG.PRODUCTS_CACHE_TIME,
    enabled: !!productId,
    ...options,
  })
}

/**
 * Hook to fetch recommended products
 * @param params - Query parameters (optional)
 * @param options - TanStack Query options
 * @returns Query result with recommended products
 * @example
 * const { data } = useRecommendedProducts()
 */
export const useRecommendedProducts = (
  params: Omit<FetchProductsParams, 'categoryId'> = {},
  options?: Omit<
    UseQueryOptions<ProductListResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productKeys.recommended(),
    queryFn: () => fetchRecommendedProducts(params),
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
    gcTime: CACHE_CONFIG.PRODUCTS_CACHE_TIME,
    ...options,
  })
}

/**
 * Hook to search products by keyword
 * @param keyword - Search keyword
 * @param params - Query parameters (optional)
 * @param options - TanStack Query options
 * @returns Query result with search results
 * @example
 * const { data, isLoading } = useSearchProducts('可乐')
 */
export const useSearchProducts = (
  keyword: string,
  params: Omit<FetchProductsParams, 'categoryId'> = {},
  options?: Omit<
    UseQueryOptions<ProductListResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: productKeys.search(keyword),
    queryFn: () => searchProducts(keyword, params),
    staleTime: CACHE_CONFIG.PRODUCTS_STALE_TIME,
    gcTime: CACHE_CONFIG.PRODUCTS_CACHE_TIME,
    enabled: !!keyword && keyword.trim() !== '',
    ...options,
  })
}
