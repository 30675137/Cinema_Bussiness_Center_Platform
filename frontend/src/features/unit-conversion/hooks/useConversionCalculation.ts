/**
 * 换算计算 TanStack Query Hooks
 * P002-unit-conversion
 */

import { useMutation } from '@tanstack/react-query';
import { conversionService } from '../services/conversionService';
import type { ValidateCycleRequest, CalculatePathRequest } from '../types';

/**
 * 验证循环依赖
 */
export function useValidateCycle() {
  return useMutation({
    mutationFn: (data: ValidateCycleRequest) => conversionService.validateCycle(data),
  });
}

/**
 * 计算换算路径
 */
export function useCalculatePath() {
  return useMutation({
    mutationFn: (data: CalculatePathRequest) => conversionService.calculatePath(data),
  });
}
