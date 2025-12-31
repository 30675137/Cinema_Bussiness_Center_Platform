// 导出API服务
export { spuService } from './api/spuApi';

// 导出React Query hooks
export {
  useSPUList,
  useSPUListWithPagination,
  useSPUDetail,
  useCreateSPU,
  useUpdateSPU,
  useDeleteSPU,
  useBatchOperation,
  spuQueryKeys,
} from './hooks/useSPU';

// 导出SKU相关
export { skuService } from './skuService';
export { skuKeys } from './queryKeys';

// 导出查询选项工具函数
export const createQueryOptions = (options: any = {}) => ({
  staleTime: 5 * 60 * 1000, // 5分钟
  gcTime: 10 * 60 * 1000, // 10分钟（原cacheTime）
  retry: 1,
  ...options,
});

export const createMutationOptions = (options: any = {}) => ({
  retry: 0,
  ...options,
});

// 导出服务类型
export type { SPUService } from './api/spuApi';
