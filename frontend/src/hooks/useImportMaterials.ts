/**
 * @spec M002-material-filter
 * useImportMaterials Hook - 物料导入相关的自定义 Hook
 * User Story: US3 - 批量导入物料数据
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '@/services/materialService'
import type { MaterialImportResult } from '@/types/material'

/**
 * 预览导入物料
 */
export function usePreviewImport() {
  return useMutation<MaterialImportResult, Error, File>({
    mutationFn: (file: File) => materialService.previewImport(file),
  })
}

/**
 * 确认导入物料
 */
export function useConfirmImport() {
  const queryClient = useQueryClient()

  return useMutation<MaterialImportResult, Error, File>({
    mutationFn: (file: File) => materialService.confirmImport(file),
    onSuccess: () => {
      // 导入成功后，使物料列表缓存失效，触发重新查询
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}
