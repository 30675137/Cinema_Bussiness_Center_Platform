/** @spec M001-material-unit-system */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '@/services/materialService'
import type { MaterialCategory, MaterialCreateRequest, MaterialUpdateRequest } from '@/types/material'

const QUERY_KEY = 'materials'

export const useMaterials = (category?: MaterialCategory) => {
  return useQuery({
    queryKey: [QUERY_KEY, category],
    queryFn: () => materialService.getAll(category),
    staleTime: 5 * 60 * 1000,
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
