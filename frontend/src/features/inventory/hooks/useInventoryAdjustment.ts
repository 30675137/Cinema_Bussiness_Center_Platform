/**
 * P004-inventory-adjustment: 库存调整 Hooks
 * 
 * 提供库存调整创建、查询等 React Query hooks。
 * 实现 T021 任务。
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { adjustmentService } from '../services/adjustmentService';
import type {
  CreateAdjustmentRequest,
  AdjustmentQueryParams,
  InventoryAdjustment,
} from '../types/adjustment';

// ========== Query Keys ==========

export const adjustmentKeys = {
  all: ['adjustments'] as const,
  lists: () => [...adjustmentKeys.all, 'list'] as const,
  list: (params: AdjustmentQueryParams) => [...adjustmentKeys.lists(), params] as const,
  details: () => [...adjustmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...adjustmentKeys.details(), id] as const,
};

// ========== 创建调整 Hook ==========

/**
 * useCreateAdjustment hook 配置
 */
export interface UseCreateAdjustmentOptions {
  /** 成功回调 */
  onSuccess?: (data: InventoryAdjustment) => void;
  /** 失败回调 */
  onError?: (error: Error) => void;
  /** 是否显示成功消息 */
  showSuccessMessage?: boolean;
  /** 是否显示错误消息 */
  showErrorMessage?: boolean;
}

/**
 * 创建库存调整的 mutation hook
 * 
 * 功能：
 * - 调用 API 创建调整记录
 * - 自动刷新调整列表缓存
 * - 提供加载状态和错误处理
 * - 显示操作结果消息
 * 
 * @param options 配置选项
 * @returns mutation 对象
 * 
 * @example
 * ```tsx
 * const { mutate: createAdjustment, isPending } = useCreateAdjustment({
 *   onSuccess: (data) => {
 *     console.log('调整成功', data);
 *     closeModal();
 *   },
 * });
 * 
 * // 提交调整
 * createAdjustment({
 *   skuId: 'xxx',
 *   storeId: 'xxx',
 *   adjustmentType: 'surplus',
 *   quantity: 10,
 *   reasonCode: 'STOCK_DIFF',
 * });
 * ```
 */
export function useCreateAdjustment(options: UseCreateAdjustmentOptions = {}) {
  const {
    onSuccess,
    onError,
    showSuccessMessage = true,
    showErrorMessage = true,
  } = options;

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdjustmentRequest) => {
      const response = await adjustmentService.createAdjustment(data);

      if (!response.success || !response.data) {
        throw new Error(response.message || '创建调整失败');
      }

      return response.data;
    },

    onSuccess: (data) => {
      // 刷新调整列表缓存
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.lists() });

      // 刷新库存列表缓存（因为库存数量可能已变化）
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      // 显示成功消息
      if (showSuccessMessage) {
        const statusMessage = data.requiresApproval
          ? '调整已提交审批'
          : '调整成功，库存已更新';
        message.success(statusMessage);
      }

      // 调用成功回调
      onSuccess?.(data);
    },

    onError: (error: Error) => {
      // 显示错误消息
      if (showErrorMessage) {
        message.error(error.message || '调整失败，请重试');
      }

      // 调用错误回调
      onError?.(error);
    },
  });
}

// ========== 查询调整列表 Hook ==========

/**
 * 查询调整列表的 hook
 * 
 * @param params 查询参数
 * @param enabled 是否启用查询
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useAdjustments({
 *   storeId: 'xxx',
 *   status: ['pending_approval'],
 * });
 * ```
 */
export function useAdjustments(params: AdjustmentQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: adjustmentKeys.list(params),
    queryFn: async () => {
      const response = await adjustmentService.listAdjustments(params);
      if (!response.success) {
        throw new Error(response.message || '查询调整列表失败');
      }
      return response;
    },
    enabled,
    staleTime: 30 * 1000, // 30秒缓存
  });
}

// ========== 查询调整详情 Hook ==========

/**
 * 查询调整详情的 hook
 * 
 * @param id 调整记录 ID
 * @param enabled 是否启用查询
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * const { data: adjustment, isLoading } = useAdjustmentDetail(adjustmentId);
 * ```
 */
export function useAdjustmentDetail(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: adjustmentKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('调整记录 ID 不能为空');
      const response = await adjustmentService.getAdjustment(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || '查询调整详情失败');
      }
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1分钟缓存
  });
}

// ========== 撤回调整 Hook ==========

/**
 * 撤回调整请求的 hook 配置
 */
export interface UseWithdrawAdjustmentOptions {
  /** 成功回调 */
  onSuccess?: (data: InventoryAdjustment) => void;
  /** 失败回调 */
  onError?: (error: Error) => void;
}

/**
 * 撤回调整申请的 mutation hook
 * 
 * @param options 配置选项
 * @returns mutation 对象
 * 
 * @example
 * ```tsx
 * const { mutate: withdrawAdjustment, isPending } = useWithdrawAdjustment({
 *   onSuccess: () => {
 *     message.success('已撤回');
 *   },
 * });
 * 
 * // 撤回
 * withdrawAdjustment('adjustment-id');
 * ```
 */
export function useWithdrawAdjustment(options: UseWithdrawAdjustmentOptions = {}) {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adjustmentService.withdrawAdjustment(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || '撤回失败');
      }
      return response.data;
    },

    onSuccess: (data, id) => {
      // 刷新列表和详情缓存
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.detail(id) });

      message.success('调整申请已撤回');
      onSuccess?.(data);
    },

    onError: (error: Error) => {
      message.error(error.message || '撤回失败');
      onError?.(error);
    },
  });
}

export default {
  useCreateAdjustment,
  useAdjustments,
  useAdjustmentDetail,
  useWithdrawAdjustment,
};
