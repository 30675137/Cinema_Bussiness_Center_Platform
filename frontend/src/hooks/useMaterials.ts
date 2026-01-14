/**
 * @spec M001-material-unit-system
 * @spec M002-material-filter
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '@/services/materialService'
import type {
  MaterialCategory,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialFilter,
} from '@/types/material'

const QUERY_KEY = 'materials'

export const useMaterials = (category?: MaterialCategory) => {
  return useQuery({
    queryKey: [QUERY_KEY, category],
    queryFn: () => materialService.getAll(category),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * M002: 使用筛选条件查询物料
 * User Story: US1 - 快速筛选物料
 */
export const useFilterMaterials = (filter: MaterialFilter, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'filter', filter, page, size],
    queryFn: () => materialService.filterMaterials(filter, page, size),
    staleTime: 30 * 1000, // 30秒缓存
    enabled: true,
  })
}

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => materialService.getById(id),
    enabled: !!id,
  })
}

export const useCreateMaterial = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MaterialCreateRequest) => materialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaterialUpdateRequest }) =>
      materialService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => materialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
