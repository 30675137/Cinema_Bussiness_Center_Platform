// 导出API服务
export { spuService } from './api/spuApi'

// 导出React Query hooks
export {
  useSPUList,
  useSPUListWithPagination,
  useSPUDetail,
  useCreateSPU,
  useUpdateSPU,
  useDeleteSPU,
  useBatchOperation,
  spuQueryKeys
} from './hooks/useSPU'

// 导出服务类型
export type { SPUService } from './api/spuApi'