/**
 * @spec N001-purchase-inbound
 * 采购订单 TanStack Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderApi, supplierApi } from '../services/purchaseOrderApi';
import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  PurchaseOrderQueryParams,
} from '../types';

// Query Keys
export const purchaseOrderKeys = {
  all: ['purchaseOrders'] as const,
  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (params?: PurchaseOrderQueryParams) => [...purchaseOrderKeys.lists(), params] as const,
  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

export const supplierKeys = {
  all: ['suppliers'] as const,
  list: (status?: string) => [...supplierKeys.all, 'list', status] as const,
};

/**
 * 获取采购订单列表
 */
export function usePurchaseOrders(params?: PurchaseOrderQueryParams) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => purchaseOrderApi.list(params),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

/**
 * 获取采购订单详情
 */
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => purchaseOrderApi.getById(id),
    enabled: !!id,
  });
}

/**
 * 创建采购订单
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) => purchaseOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * 删除采购订单
 */
export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * 提交审核
 */
export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * 审批通过
 */
export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * 审批拒绝
 */
export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      purchaseOrderApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * 获取供应商列表
 */
export function useSuppliers(status?: string) {
  return useQuery({
    queryKey: supplierKeys.list(status),
    queryFn: () => supplierApi.list(status),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 获取采购订单状态变更历史
 */
export function usePurchaseOrderHistory(id: string | undefined) {
  return useQuery({
    queryKey: [...purchaseOrderKeys.detail(id!), 'history'] as const,
    queryFn: () => purchaseOrderApi.getStatusHistory(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
}

/**
 * 获取订单统计摘要
 */
export function usePurchaseOrderSummary(storeId?: string) {
  return useQuery({
    queryKey: [...purchaseOrderKeys.all, 'summary', storeId] as const,
    queryFn: () => purchaseOrderApi.getOrderSummary(storeId),
    staleTime: 1 * 60 * 1000, // 1分钟
    select: (response) => response.data,
  });
}

/**
 * 获取待审批订单列表
 */
export function usePendingApprovalOrders(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...purchaseOrderKeys.all, 'pending-approval', page, pageSize] as const,
    queryFn: () => purchaseOrderApi.getPendingApproval(page, pageSize),
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}
