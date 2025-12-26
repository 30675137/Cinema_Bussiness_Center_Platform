/**
 * P004-inventory-adjustment: 审批相关 Hooks
 * 
 * 提供审批列表查询、审批操作等功能。
 * 实现 T048 任务。
 * 
 * @since US4 - 大额库存调整审批
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import type { 
  InventoryAdjustment, 
  AdjustmentStatus,
  ApprovalRequest,
} from '../types/adjustment';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 待审批列表响应
 */
export interface PendingApprovalsResponse {
  success: boolean;
  data: InventoryAdjustment[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 审批操作响应
 */
export interface ApprovalActionResponse {
  success: boolean;
  data?: InventoryAdjustment;
  message?: string;
}

/**
 * 待审批查询参数
 */
export interface PendingApprovalsParams {
  page?: number;
  pageSize?: number;
  storeId?: string;
}

/**
 * 调整记录查询参数（支持状态筛选）
 */
export interface AdjustmentsQueryParams {
  page?: number;
  pageSize?: number;
  storeId?: string;
  status?: string; // pending_approval | approved | rejected | withdrawn | 空表示全部
}

/**
 * Query Keys
 */
export const approvalKeys = {
  all: ['approvals'] as const,
  pending: () => [...approvalKeys.all, 'pending'] as const,
  pendingList: (params: PendingApprovalsParams) => [...approvalKeys.pending(), params] as const,
  adjustments: () => [...approvalKeys.all, 'adjustments'] as const,
  adjustmentsList: (params: AdjustmentsQueryParams) => [...approvalKeys.adjustments(), params] as const,
};

/**
 * 获取待审批列表
 */
async function fetchPendingApprovals(params: PendingApprovalsParams): Promise<PendingApprovalsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('status', 'pending_approval');
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.storeId) searchParams.set('storeId', params.storeId);

  const response = await apiClient.get<PendingApprovalsResponse>(
    `/adjustments?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * 获取调整记录列表（支持状态筛选）
 */
async function fetchAdjustments(params: AdjustmentsQueryParams): Promise<PendingApprovalsResponse> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.storeId) searchParams.set('storeId', params.storeId);

  const response = await apiClient.get<PendingApprovalsResponse>(
    `/adjustments?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * 审批操作
 */
async function processApproval(
  adjustmentId: string, 
  action: 'approve' | 'reject',
  comments?: string
): Promise<ApprovalActionResponse> {
  const response = await apiClient.post<ApprovalActionResponse>(
    `/adjustments/${adjustmentId}/${action}`,
    { comments }
  );
  return response.data;
}

/**
 * 撤回操作
 */
async function withdrawAdjustment(adjustmentId: string): Promise<ApprovalActionResponse> {
  const response = await apiClient.post<ApprovalActionResponse>(
    `/adjustments/${adjustmentId}/withdraw`
  );
  return response.data;
}

/**
 * 待审批列表 Hook
 * 
 * @param params 查询参数
 * @param enabled 是否启用查询
 */
export function usePendingApprovals(params: PendingApprovalsParams = {}, enabled = true) {
  return useQuery({
    queryKey: approvalKeys.pendingList(params),
    queryFn: () => fetchPendingApprovals(params),
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * 调整记录列表 Hook（支持状态筛选）
 * 
 * @param params 查询参数，包含 status 筛选
 * @param enabled 是否启用查询
 */
export function useAdjustmentsByStatus(params: AdjustmentsQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: approvalKeys.adjustmentsList(params),
    queryFn: () => fetchAdjustments(params),
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * 审批操作 Hook 配置
 */
export interface UseProcessApprovalOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 审批操作 Hook
 */
export function useProcessApproval(options: UseProcessApprovalOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      adjustmentId, 
      action, 
      comments 
    }: { 
      adjustmentId: string; 
      action: 'approve' | 'reject';
      comments?: string;
    }) => {
      const response = await processApproval(adjustmentId, action, comments);
      if (!response.success) {
        throw new Error(response.message || '审批操作失败');
      }
      return response;
    },
    onSuccess: (_, variables) => {
      const actionText = variables.action === 'approve' ? '通过' : '拒绝';
      message.success(`审批${actionText}成功`);
      
      // 刷新待审批列表
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
      // 刷新调整记录列表
      queryClient.invalidateQueries({ queryKey: ['adjustments'] });
      
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      message.error(error.message || '审批操作失败');
      options.onError?.(error);
    },
  });
}

/**
 * 撤回操作 Hook 配置
 */
export interface UseWithdrawAdjustmentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 撤回调整 Hook
 */
export function useWithdrawAdjustment(options: UseWithdrawAdjustmentOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adjustmentId: string) => {
      const response = await withdrawAdjustment(adjustmentId);
      if (!response.success) {
        throw new Error(response.message || '撤回失败');
      }
      return response;
    },
    onSuccess: () => {
      message.success('已撤回调整申请');
      
      // 刷新相关列表
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
      queryClient.invalidateQueries({ queryKey: ['adjustments'] });
      
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      message.error(error.message || '撤回失败');
      options.onError?.(error);
    },
  });
}

export default {
  usePendingApprovals,
  useAdjustmentsByStatus,
  useProcessApproval,
  useWithdrawAdjustment,
};
