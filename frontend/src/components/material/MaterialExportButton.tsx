/**
 * @spec M002-material-filter
 * Material Export Button - 物料导出按钮组件
 * User Story: US2 - 批量导出物料数据
 */
import { Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { MaterialFilter } from '@/types/material'
import { materialService } from '@/services/materialService'

interface MaterialExportButtonProps {
  filter: MaterialFilter
  disabled?: boolean
}

export function MaterialExportButton({ filter, disabled = false }: MaterialExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)
      console.log('开始导出物料:', filter)
      await materialService.exportMaterials(filter)
      console.log('导出成功')
      message.success('导出成功')
    } catch (error: any) {
      console.error('导出失败:', { filter, error })
      message.error(error.message || '导出失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      loading={loading}
      disabled={disabled}
    >
      批量导出
    </Button>
  )
}
