/**
 * 场景包列表查询 Hook
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import { useQuery } from '@tanstack/react-query';
import packageService from '../services/packageService';
import type { ListPackagesParams } from '../types';

export const usePackageList = (params: ListPackagesParams = {}) => {
  return useQuery({
    queryKey: ['scenario-packages', params],
    queryFn: () => packageService.list(params),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
};
