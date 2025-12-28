/**
 * P004-inventory-adjustment: 安全库存更新 Hook
 * 
 * 提供安全库存编辑功能，支持乐观锁冲突处理。
 * 实现 T058 任务。
 * 
 * @since US5 - 设置安全库存阈值
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';

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
 * 安全库存更新请求
 */
export interface UpdateSafetyStockRequest {
  /** 库存记录ID */
  inventoryId: string;
  /** 新的安全库存值 */
  safetyStock: number;
  /** 乐观锁版本号 */
  version: number;
}

/**
 * 安全库存更新响应
 */
export interface UpdateSafetyStockResponse {
  success: boolean;
  data?: {
    id: string;
    safetyStock: number;
    version: number;
    updatedAt: string;
  };
  error?: string;
  message?: string;
}

/**
 * 冲突错误类
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * 更新安全库存
 */
async function updateSafetyStock(request: UpdateSafetyStockRequest): Promise<UpdateSafetyStockResponse> {
  try {
    const response = await apiClient.put<UpdateSafetyStockResponse>(
      `/inventory/${request.inventoryId}/safety-stock`,
      {
        safetyStock: request.safetyStock,
        version: request.version,
      }
    );
    return response.data;
  } catch (error: any) {
    // 处理 409 冲突错误
    if (error.response?.status === 409) {
      throw new ConflictError(
        error.response?.data?.message || '该记录已被他人修改，请刷新后重试'
      );
    }
    throw error;
  }
}

/**
 * useSafetyStock Hook 配置
 */
export interface UseSafetyStockOptions {
  /** 成功回调 */
  onSuccess?: (data: UpdateSafetyStockResponse['data']) => void;
  /** 失败回调 */
  onError?: (error: Error) => void;
  /** 冲突回调 */
  onConflict?: () => void;
}

/**
 * 安全库存更新 Hook
 * 
 * 功能：
 * - 更新安全库存值
 * - 自动处理乐观锁冲突 (409)
 * - 刷新相关缓存
 * 
 * @param options 配置选项
 * @returns mutation 对象
 * 
 * @example
 * ```tsx
 * const { mutate: updateStock, isPending, isConflict } = useSafetyStock({
 *   onSuccess: () => message.success('安全库存已更新'),
 *   onConflict: () => refreshData(),
 * });
 * 
 * updateStock({ inventoryId: 'xxx', safetyStock: 10, version: 1 });
 * ```
 */
export function useSafetyStock(options: UseSafetyStockOptions = {}) {
  const { onSuccess, onError, onConflict } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSafetyStock,

    onSuccess: (response) => {
      if (response.success && response.data) {
        message.success('安全库存已更新');

        // 刷新库存详情和列表缓存
        queryClient.invalidateQueries({ queryKey: ['inventory'] });

        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || '更新失败');
      }
    },

    onError: (error: Error) => {
      if (error instanceof ConflictError) {
        message.warning(error.message);
        onConflict?.();
      } else {
        message.error(error.message || '更新安全库存失败');
        onError?.(error);
      }
    },
  });
}

/**
 * 判断是否为冲突错误
 */
export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}

export default useSafetyStock;
