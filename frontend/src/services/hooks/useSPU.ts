import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { spuService } from '../api/spuApi'
import { SPUItem, SPUQueryParams, SPUCreationForm, SPUUpdateForm, SPUBatchOperation } from '@/types/spu'

// Query Keys
export const spuQueryKeys = {
  all: ['spu'] as const,
  lists: ['spu', 'list'] as const,
  list: (params: SPUQueryParams) => ['spu', 'list', params] as const,
  details: ['spu', 'detail'] as const,
  detail: (id: string) => ['spu', 'detail', id] as const,
}

// 获取SPU列表
export const useSPUList = (
  params: SPUQueryParams,
  options?: Omit<UseQueryOptions<SPUItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: spuQueryKeys.list(params),
    queryFn: () => {
      const result = spuService.getSPUList(params)
      return result.list
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// 获取SPU列表（完整响应，包含分页）
export const useSPUListWithPagination = (
  params: SPUQueryParams,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: spuQueryKeys.list(params),
    queryFn: () => spuService.getSPUList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// 获取SPU详情
export const useSPUDetail = (
  id: string,
  options?: Omit<UseQueryOptions<SPUItem, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: spuQueryKeys.detail(id),
    queryFn: () => spuService.getSPUDetail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

// 创建SPU
export const useCreateSPU = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SPUCreationForm) => spuService.createSPU(data),
    onSuccess: (data) => {
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: spuQueryKeys.lists })

      // 可选：预先添加新数据到缓存
      queryClient.setQueryData(
        spuQueryKeys.detail(data.id),
        data
      )
    },
    onError: (error) => {
      console.error('Failed to create SPU:', error)
    },
  })
}

// 更新SPU
export const useUpdateSPU = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SPUUpdateForm }) =>
      spuService.updateSPU(id, data),
    onSuccess: (data, { id }) => {
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: spuQueryKeys.lists })

      // 更新详情缓存
      queryClient.setQueryData(
        spuQueryKeys.detail(id),
        data
      )
    },
    onError: (error) => {
      console.error('Failed to update SPU:', error)
    },
  })
}

// 删除SPU
export const useDeleteSPU = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => spuService.deleteSPU(id),
    onSuccess: () => {
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: spuQueryKeys.lists })
    },
    onError: (error) => {
      console.error('Failed to delete SPU:', error)
    },
  })
}

// 批量操作
export const useBatchOperation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SPUBatchOperation) => spuService.batchOperation(data),
    onSuccess: () => {
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: spuQueryKeys.lists })
    },
    onError: (error) => {
      console.error('Failed to perform batch operation:', error)
    },
  })
}