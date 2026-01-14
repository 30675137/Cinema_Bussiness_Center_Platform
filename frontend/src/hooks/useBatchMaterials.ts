/**
 * @spec M002-material-filter
 * useBatchMaterials Hook - 物料批量操作相关的自定义 Hook
 * User Story: US4 - 批量操作物料
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '@/services/materialService'
import type { MaterialBatchOperationRequest, MaterialBatchOperationResult } from '@/types/material'

/**
 * 批量操作物料（删除或修改状态）
 */
export function useBatchOperateMaterials() {
  const queryClient = useQueryClient()

  return useMutation<MaterialBatchOperationResult, Error, MaterialBatchOperationRequest>({
    mutationFn: (request: MaterialBatchOperationRequest) => materialService.batchOperateMaterials(request),
    onSuccess: () => {
      // 批量操作成功后，使物料列表缓存失效，触发重新查询
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}
