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
    onError: (error, file) => {
      console.error('导入预览失败:', { fileName: file.name, fileSize: file.size, error })
    },
  })
}

/**
 * 确认导入物料
 */
export function useConfirmImport() {
  const queryClient = useQueryClient()

  return useMutation<MaterialImportResult, Error, File>({
    mutationFn: (file: File) => materialService.confirmImport(file),
    onSuccess: (result, file) => {
      // 导入成功后，使物料列表缓存失效，触发重新查询
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      console.log('导入确认成功:', {
        fileName: file.name,
        successCount: result.successCount,
        failureCount: result.failureCount,
      })
    },
    onError: (error, file) => {
      console.error('导入确认失败:', { fileName: file.name, fileSize: file.size, error })
    },
  })
}
