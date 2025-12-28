/**
 * P004-inventory-adjustment: 库存流水查询 Hook
 * 
 * 提供库存流水记录的查询功能。
 * 实现 T032 任务。
 * 
 * @since US2 - 查看库存流水记录
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { TransactionQueryParams } from '../types/adjustment';

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
 * 库存流水记录
 */
export interface InventoryTransaction {
  id: string;
  skuId: string;
  storeId: string;
  transactionType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  availableBefore?: number;
  availableAfter?: number;
  operatorId: string;
  operatorName: string;
  sourceType?: string;
  sourceId?: string;
  remarks?: string;
  transactionTime: string;
  createdAt: string;
}

/**
 * 流水列表响应
 */
export interface TransactionListResponse {
  success: boolean;
  data: InventoryTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 流水查询 Query Keys
 */
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionQueryParams) => [...transactionKeys.lists(), params] as const,
};

/**
 * 获取流水列表
 */
async function fetchTransactions(params: TransactionQueryParams): Promise<TransactionListResponse> {
  const searchParams = new URLSearchParams();
  if (params.skuId) searchParams.set('skuId', params.skuId);
  if (params.storeId) searchParams.set('storeId', params.storeId);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const queryString = searchParams.toString();
  const url = `/transactions${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get<TransactionListResponse>(url);
  return response.data;
}

/**
 * 库存流水查询 Hook
 * 
 * @param params 查询参数
 * @param enabled 是否启用查询
 * @returns 查询结果
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useTransactions({ skuId: 'xxx', storeId: 'yyy' });
 * ```
 */
export function useTransactions(params: TransactionQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => fetchTransactions(params),
    enabled,
    staleTime: 30 * 1000, // 30秒缓存
  });
}

export default useTransactions;
