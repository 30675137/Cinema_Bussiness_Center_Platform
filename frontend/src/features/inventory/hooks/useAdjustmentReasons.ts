/**
 * P004-inventory-adjustment: 调整原因 Hook
 *
 * 获取调整原因字典数据，支持按类型筛选。
 */

import { useQuery } from '@tanstack/react-query';
import { adjustmentService } from '../services/adjustmentService';
import type { AdjustmentReason, AdjustmentType } from '../types/adjustment';

// ========== Query Keys ==========

export const adjustmentReasonKeys = {
  all: ['adjustment-reasons'] as const,
  list: () => [...adjustmentReasonKeys.all, 'list'] as const,
  byCategory: (category: AdjustmentType) =>
    [...adjustmentReasonKeys.all, 'category', category] as const,
};

// ========== Hooks ==========

/**
 * 获取所有调整原因
 */
export function useAdjustmentReasons() {
  return useQuery({
    queryKey: adjustmentReasonKeys.list(),
    queryFn: async () => {
      const response = await adjustmentService.listAdjustmentReasons();
      if (!response.success) {
        throw new Error(response.message || '获取调整原因失败');
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 30 * 60 * 1000, // 30分钟后垃圾回收
  });
}

/**
 * 根据调整类型获取可用原因
 *
 * @param adjustmentType 调整类型 (surplus/shortage/damage)
 */
export function useAdjustmentReasonsByType(adjustmentType?: AdjustmentType) {
  const { data: reasons, ...rest } = useAdjustmentReasons();

  // 根据调整类型筛选原因
  const filteredReasons = adjustmentType
    ? reasons?.filter((reason) => reason.category === adjustmentType)
    : reasons;

  return {
    ...rest,
    data: filteredReasons,
    allReasons: reasons,
  };
}

/**
 * 获取原因选项（用于 Select 组件）
 *
 * @param adjustmentType 调整类型（可选，用于筛选）
 */
export function useAdjustmentReasonOptions(adjustmentType?: AdjustmentType) {
  const { data: reasons, isLoading, error } = useAdjustmentReasonsByType(adjustmentType);

  const options =
    reasons?.map((reason) => ({
      value: reason.code,
      label: reason.name,
      category: reason.category,
    })) || [];

  return {
    options,
    isLoading,
    error,
  };
}

/**
 * 根据代码获取原因信息
 *
 * @param code 原因代码
 */
export function useAdjustmentReasonByCode(code?: string) {
  const { data: reasons } = useAdjustmentReasons();

  if (!code || !reasons) {
    return undefined;
  }

  return reasons.find((reason) => reason.code === code);
}

export default useAdjustmentReasons;
