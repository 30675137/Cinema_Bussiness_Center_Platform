/**
 * @spec M002-material-filter
 * Material Batch Actions - 物料批量操作组件
 * User Story: US4 - 批量操作物料
 */
import { useState } from 'react'
import { Button, Space, Modal, message, Table } from 'antd'
import { DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { BatchOperationType, MaterialBatchOperationResult, MaterialBatchOperationItem } from '@/types/material'

interface MaterialBatchActionsProps {
  selectedCount: number
  selectedRowKeys: React.Key[]
  onBatchDelete: (materialIds: string[]) => Promise<void>
  onBatchUpdateStatus: (materialIds: string[], targetStatus: 'ACTIVE' | 'INACTIVE') => Promise<void>
  onClearSelection: () => void
}

/**
 * 物料批量操作组件
 * 
 * 功能：
 * 1. 批量删除
 * 2. 批量停用
 * 3. 批量启用
 * 4. 显示操作结果
 */
export function MaterialBatchActions({
  selectedCount,
  selectedRowKeys,
  onBatchDelete,
  onBatchUpdateStatus,
  onClearSelection,
}: MaterialBatchActionsProps) {
  const [resultModalVisible, setResultModalVisible] = useState(false)
  const [operationResult, setOperationResult] = useState<MaterialBatchOperationResult | null>(null)

  // 批量删除确认对话框
  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedCount} 个物料吗？删除后无法恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const materialIds = selectedRowKeys.map(String)
          await onBatchDelete(materialIds)
          message.success('批量删除成功')
          onClearSelection()
        } catch (error: any) {
          // 错误已经在 useBatchOperateMaterials 中处理
        }
      },
    })
  }

  // 批量停用确认对话框
  const handleBatchInactivate = () => {
    Modal.confirm({
      title: '确认批量停用',
      content: `确定要停用选中的 ${selectedCount} 个物料吗？`,
      okText: '确认停用',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        try {
          const materialIds = selectedRowKeys.map(String)
          await onBatchUpdateStatus(materialIds, 'INACTIVE')
          message.success('批量停用成功')
          onClearSelection()
        } catch (error: any) {
          // 错误已经在 useBatchOperateMaterials 中处理
        }
      },
    })
  }

  // 批量启用确认对话框
  const handleBatchActivate = () => {
    Modal.confirm({
      title: '确认批量启用',
      content: `确定要启用选中的 ${selectedCount} 个物料吗？`,
      okText: '确认启用',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        try {
          const materialIds = selectedRowKeys.map(String)
          await onBatchUpdateStatus(materialIds, 'ACTIVE')
          message.success('批量启用成功')
          onClearSelection()
        } catch (error: any) {
          // 错误已经在 useBatchOperateMaterials 中处理
        }
      },
    })
  }

  // 显示操作结果详情的表格列定义
  const resultColumns = [
    {
      title: '物料ID',
      dataIndex: 'materialId',
      key: 'materialId',
      width: 280,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'success',
      key: 'success',
      width: 80,
      render: (success: boolean) =>
        success ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <StopOutlined style={{ color: '#ff4d4f' }} />
        ),
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      render: (error?: string) => error || '-',
    },
  ]

  return (
    <>
      <Space>
        <span style={{ marginRight: 8 }}>
          已选择 <strong>{selectedCount}</strong> 项
        </span>
        
        <Button 
          icon={<CheckCircleOutlined />} 
          onClick={handleBatchActivate}
          disabled={selectedCount === 0}
        >
          批量启用
        </Button>
        
        <Button 
          icon={<StopOutlined />} 
          onClick={handleBatchInactivate}
          disabled={selectedCount === 0}
        >
          批量停用
        </Button>
        
        <Button 
          danger
          icon={<DeleteOutlined />} 
          onClick={handleBatchDelete}
          disabled={selectedCount === 0}
        >
          批量删除
        </Button>
        
        <Button onClick={onClearSelection} disabled={selectedCount === 0}>
          取消选择
        </Button>
      </Space>

      {/* 操作结果详情弹窗 */}
      {operationResult && (
        <Modal
          title="批量操作结果"
          open={resultModalVisible}
          onCancel={() => setResultModalVisible(false)}
          width={800}
          footer={[
            <Button key="close" type="primary" onClick={() => setResultModalVisible(false)}>
              关闭
            </Button>,
          ]}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <span>总数：{operationResult.successCount + operationResult.failureCount} </span>
              <span style={{ color: '#52c41a' }}>成功：{operationResult.successCount} </span>
              {operationResult.failureCount > 0 && (
                <span style={{ color: '#ff4d4f' }}>失败：{operationResult.failureCount}</span>
              )}
            </div>

            <Table
              dataSource={operationResult.items}
              columns={resultColumns}
              rowKey="materialId"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Space>
        </Modal>
      )}
    </>
  )
}
