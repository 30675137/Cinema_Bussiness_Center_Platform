/** @spec M001-material-unit-system */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { unitService } from '@/services/unitService'
import type { UnitCategory, UnitCreateRequest, UnitUpdateRequest } from '@/types/unit'

const QUERY_KEY = 'units'

export const useUnits = (category?: UnitCategory) => {
  return useQuery({
    queryKey: [QUERY_KEY, category],
    queryFn: () => unitService.getAll(category),
    staleTime: 5 * 60 * 1000,
  })
}

export const useUnit = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => unitService.getById(id),
    enabled: !!id,
  })
}

export const useCreateUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UnitCreateRequest) => unitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export const useUpdateUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitUpdateRequest }) =>
      unitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export const useDeleteUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
