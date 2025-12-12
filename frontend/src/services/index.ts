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

// 导出查询键
export { skuKeys } from './queryKeys'

// 导出查询选项工具函数
export const createQueryOptions = <TData, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    retry?: boolean | number
  }
) => {
  return {
    queryKey,
    queryFn,
    ...options,
  }
}

// 导出变更选项工具函数
export const createMutationOptions = <TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: TError, variables: TVariables) => void
    retry?: boolean | number
  }
) => {
  return {
    mutationFn,
    ...options,
  }
}

// 导出服务类型
export type { SPUService } from './api/spuApi'