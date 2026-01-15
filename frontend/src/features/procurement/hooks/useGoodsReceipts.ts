/**
 * @spec N001-purchase-inbound
 * 收货入库 TanStack Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiptApi } from '../services/goodsReceiptApi';
import type { GoodsReceiptQueryParams, CreateGoodsReceiptRequest } from '../types';

/**
 * Query keys for goods receipts
 */
export const goodsReceiptKeys = {
  all: ['goodsReceipts'] as const,
  lists: () => [...goodsReceiptKeys.all, 'list'] as const,
  list: (params?: GoodsReceiptQueryParams) => [...goodsReceiptKeys.lists(), params] as const,
  details: () => [...goodsReceiptKeys.all, 'detail'] as const,
  detail: (id: string) => [...goodsReceiptKeys.details(), id] as const,
};

/**
 * 获取收货入库单列表
 */
export function useGoodsReceipts(params?: GoodsReceiptQueryParams) {
  return useQuery({
    queryKey: goodsReceiptKeys.list(params),
    queryFn: () => goodsReceiptApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * 获取收货入库单详情
 */
export function useGoodsReceipt(id: string | undefined) {
  return useQuery({
    queryKey: goodsReceiptKeys.detail(id!),
    queryFn: () => goodsReceiptApi.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
}

/**
 * 创建收货入库单
 */
export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoodsReceiptRequest) => goodsReceiptApi.create(data),
    onSuccess: () => {
      // 刷新列表和采购订单（因为收货后采购订单状态可能变化）
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
}

/**
 * 确认收货（更新库存）
 */
export function useConfirmGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptApi.confirm(id),
    onSuccess: (_, id) => {
      // 刷新详情和列表
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
      // 刷新采购订单列表（收货状态变化）
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      // 刷新库存（因为确认收货会更新库存）
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * 取消收货单
 */
export function useCancelGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
    },
  });
}
