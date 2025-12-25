/**
 * 单位换算 TanStack Query Hooks
 * P002-unit-conversion
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversionService } from '../services/conversionService';
import type { CreateConversionRequest, DbUnitCategory } from '../types';

/**
 * 查询键常量
 */
export const CONVERSION_KEYS = {
  all: ['conversions'] as const,
  list: (params?: { category?: DbUnitCategory; search?: string }) =>
    [...CONVERSION_KEYS.all, 'list', params] as const,
  stats: () => [...CONVERSION_KEYS.all, 'stats'] as const,
  detail: (id: string) => [...CONVERSION_KEYS.all, 'detail', id] as const,
};

/**
 * 获取所有换算规则
 */
export function useConversions(params?: { category?: DbUnitCategory; search?: string }) {
  return useQuery({
    queryKey: CONVERSION_KEYS.list(params),
    queryFn: () => conversionService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 获取单个换算规则
 */
export function useConversion(id: string) {
  return useQuery({
    queryKey: CONVERSION_KEYS.detail(id),
    queryFn: () => conversionService.getById(id),
    enabled: !!id,
  });
}

/**
 * 获取统计信息
 */
export function useConversionStats() {
  return useQuery({
    queryKey: CONVERSION_KEYS.stats(),
    queryFn: conversionService.getStats,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 创建换算规则
 */
export function useCreateConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversionRequest) => conversionService.create(data),
    onSuccess: () => {
      // 使所有换算相关缓存失效
      queryClient.invalidateQueries({ queryKey: CONVERSION_KEYS.all });
    },
  });
}

/**
 * 更新换算规则
 */
export function useUpdateConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateConversionRequest }) =>
      conversionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSION_KEYS.all });
    },
  });
}

/**
 * 删除换算规则
 */
export function useDeleteConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSION_KEYS.all });
    },
  });
}
