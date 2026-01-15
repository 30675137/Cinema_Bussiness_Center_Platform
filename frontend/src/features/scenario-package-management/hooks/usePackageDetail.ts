/**
 * 场景包详情查询 Hook
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import { useQuery } from '@tanstack/react-query';
import packageService from '../services/packageService';

export const usePackageDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['scenario-package', id],
    queryFn: () => packageService.getById(id!),
    enabled: !!id, // 只有当 id 存在时才执行查询
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
};
