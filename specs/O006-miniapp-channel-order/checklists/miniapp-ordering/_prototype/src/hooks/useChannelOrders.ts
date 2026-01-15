/**
 * @spec O006-miniapp-channel-order
 * TanStack Query Hooks - 渠道商品订单查询与变更
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateChannelProductOrderDTO,
  ChannelProductOrderDTO,
  OrderListQuery,
  OrderListResponse,
  OrderStatus,
} from '../types/order'
import {
  createChannelProductOrder,
  getChannelOrderDetail,
  getChannelOrderList,
} from '../services/orderService'

/**
 * 查询订单列表
 * @param query 查询参数（分页、状态筛选）
 * @returns TanStack Query 结果
 */
export function useChannelOrders(query?: OrderListQuery) {
  return useQuery<OrderListResponse, Error>({
    queryKey: ['channelOrders', query],
    queryFn: () => getChannelOrderList(query),
    staleTime: 2 * 60 * 1000, // 2分钟缓存（订单数据更新频繁）
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * 查询单个订单详情
 * @param orderId 订单ID
 * @returns TanStack Query 结果
 */
export function useChannelOrderDetail(orderId: string | undefined) {
  return useQuery<ChannelProductOrderDTO, Error>({
    queryKey: ['channelOrder', orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error('Order ID is required')
      }
      return getChannelOrderDetail(orderId)
    },
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1分钟缓存
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * 创建订单 Mutation
 * @returns TanStack Mutation 钩子
 */
export function useCreateChannelOrder() {
  const queryClient = useQueryClient()

  return useMutation<
    ChannelProductOrderDTO,
    Error,
    CreateChannelProductOrderDTO
  >({
    mutationFn: createChannelProductOrder,
    onSuccess: (data) => {
      // 使订单列表缓存失效，触发重新查询
      queryClient.invalidateQueries({ queryKey: ['channelOrders'] })

      // 立即缓存新创建的订单详情
      queryClient.setQueryData(['channelOrder', data.id], data)
    },
  })
}

/**
 * 按状态查询订单列表（快捷方法）
 */
export function useChannelOrdersByStatus(status?: OrderStatus) {
  return useChannelOrders(
    status
      ? { status, page: 1, pageSize: 20 }
      : { page: 1, pageSize: 20 }
  )
}
