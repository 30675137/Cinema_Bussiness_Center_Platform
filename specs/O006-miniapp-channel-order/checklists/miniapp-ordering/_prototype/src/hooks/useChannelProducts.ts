/**
 * @spec O006-miniapp-channel-order
 * TanStack Query Hooks - 渠道商品数据查询
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ChannelProductDTO,
  ChannelProductSpecDTO,
  ChannelCategory,
} from '../types/channelProduct'
import {
  fetchChannelProducts,
  fetchChannelProductDetail,
  fetchChannelProductSpecs,
} from '../services/channelProductService'

/**
 * 查询渠道商品列表
 * @param category 可选分类筛选
 * @returns TanStack Query 结果
 */
export function useChannelProducts(category?: ChannelCategory) {
  return useQuery<ChannelProductDTO[], Error>({
    queryKey: ['channelProducts', category],
    queryFn: () => fetchChannelProducts(category),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000,   // 10分钟垃圾回收
  })
}

/**
 * 查询单个商品详情
 * @param id 商品ID
 * @returns TanStack Query 结果
 */
export function useChannelProductDetail(id: string | undefined) {
  return useQuery<ChannelProductDTO, Error>({
    queryKey: ['channelProduct', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Product ID is required')
      }
      return fetchChannelProductDetail(id)
    },
    enabled: !!id, // 仅在 ID 存在时查询
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * 查询商品规格列表
 * @param id 商品ID
 * @returns TanStack Query 结果
 */
export function useChannelProductSpecs(id: string | undefined) {
  return useQuery<ChannelProductSpecDTO[], Error>({
    queryKey: ['channelProductSpecs', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Product ID is required')
      }
      return fetchChannelProductSpecs(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * 预取商品详情（用于优化用户体验）
 */
export function usePrefetchProductDetail() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['channelProduct', id],
      queryFn: () => fetchChannelProductDetail(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}
