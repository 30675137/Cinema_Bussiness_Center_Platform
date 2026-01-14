/**
 * @spec M001-material-unit-system
 * @spec M002-material-filter
 */
import React, { useState, useEffect } from 'react'
import { Button, Card, Modal, message, Pagination, Space } from 'antd'
import { PlusOutlined, ImportOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { Key } from 'react'
import { MaterialTable } from '@/components/material/MaterialTable'
import { MaterialForm } from '@/components/material/MaterialForm'
import { MaterialFilterComponent } from '@/components/material/MaterialFilter'
import { MaterialExportButton } from '@/components/material/MaterialExportButton'
import { MaterialImportModal } from '@/components/material/MaterialImportModal'
import { MaterialBatchActions } from '@/components/material/MaterialBatchActions'
import { MaterialErrorBoundary } from '@/components/material/MaterialErrorBoundary'
import {
  useMaterials,
  useFilterMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '@/hooks/useMaterials'
import { usePreviewImport, useConfirmImport } from '@/hooks/useImportMaterials'
import { useBatchOperateMaterials } from '@/hooks/useBatchMaterials'
import type { Material, MaterialFilter, BatchOperationType } from '@/types/material'

export const MaterialManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>()
  
  // M002: 批量选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  // M002: 从 URL 读取筛选条件
  const [filter, setFilter] = useState<MaterialFilter>(() => ({
    category: searchParams.get('category') as any,
    status: searchParams.get('status') as any,
    minCost: searchParams.get('minCost') ? Number(searchParams.get('minCost')) : undefined,
    maxCost: searchParams.get('maxCost') ? Number(searchParams.get('maxCost')) : undefined,
    keyword: searchParams.get('keyword') || undefined,
  }))

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page')
    return pageParam ? Number(pageParam) : 0
  })

  const [pageSize] = useState(20)

  // M002: 使用筛选 hook
  const { data: pageData, isLoading } = useFilterMaterials(filter, page, pageSize)
  const materials = pageData?.data || []
  const total = pageData?.total || 0

  const createMutation = useCreateMaterial()
  const updateMutation = useUpdateMaterial()
  const deleteMutation = useDeleteMaterial()

  // M002: 导入相关 hooks
  const previewImportMutation = usePreviewImport()
  const confirmImportMutation = useConfirmImport()
  
  // M002: 批量操作 hooks
  const batchOperateMutation = useBatchOperateMaterials()

  // M002: 同步筛选条件到 URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filter.category) params.set('category', filter.category)
    if (filter.status) params.set('status', filter.status)
    if (filter.minCost !== undefined) params.set('minCost', String(filter.minCost))
    if (filter.maxCost !== undefined) params.set('maxCost', String(filter.maxCost))
    if (filter.keyword) params.set('keyword', filter.keyword)
    if (page > 0) params.set('page', String(page))

    setSearchParams(params, { replace: true })
  }, [filter, page, setSearchParams])

  const handleFilter = (newFilter: MaterialFilter) => {
    setFilter(newFilter)
    setPage(0) // 筛选条件变化时重置到第一页
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1) // Ant Design Pagination 使用 1-indexed
  }

  const handleCreate = () => {
    setEditingMaterial(undefined)
    setModalVisible(true)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingMaterial) {
        await updateMutation.mutateAsync({ id: editingMaterial.id, data: values })
        message.success('物料更新成功')
      } else {
        await createMutation.mutateAsync(values)
        message.success('物料创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      console.error('物料操作失败:', {
        operation: editingMaterial ? 'update' : 'create',
        materialId: editingMaterial?.id,
        error,
      })
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除该物料吗？',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success('删除成功')
        } catch (error) {
          console.error('物料删除失败:', { materialId: id, error })
          message.error('删除失败，该物料可能已被BOM引用')
        }
      },
    })
  }

  // M002: 导入相关处理函数
  const handleImport = () => {
    setImportModalVisible(true)
  }

  const handleImportSuccess = () => {
    setImportModalVisible(false)
    // 列表会自动刷新（因为 confirmImport 成功后会 invalidate queries）
  }

  // M002: 批量操作相关处理函数
  const handleBatchDelete = async (materialIds: string[]) => {
    try {
      await batchOperateMutation.mutateAsync({
        materialIds,
        operation: 'DELETE' as BatchOperationType,
      })
    } catch (error) {
      console.error('批量删除失败:', { materialIds, error })
      throw error
    }
  }

  const handleBatchUpdateStatus = async (materialIds: string[], targetStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      await batchOperateMutation.mutateAsync({
        materialIds,
        operation: 'UPDATE_STATUS' as BatchOperationType,
        targetStatus,
      })
    } catch (error) {
      console.error('批量修改状态失败:', { materialIds, targetStatus, error })
      throw error
    }
  }

  const handleClearSelection = () => {
    setSelectedRowKeys([])
  }

  return (
    <MaterialErrorBoundary>
      <div>
      <Card style={{ marginBottom: 16 }}>
        <MaterialFilterComponent onFilter={handleFilter} loading={isLoading} />
      </Card>

      <Card
        title="物料主数据管理"
        extra={
          <Space>
            <MaterialExportButton filter={filter} />
            <Button icon={<ImportOutlined />} onClick={handleImport}>
              批量导入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建物料
            </Button>
          </Space>
        }
      >
        {/* M002: 批量操作区域 */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <MaterialBatchActions
              selectedCount={selectedRowKeys.length}
              selectedRowKeys={selectedRowKeys}
              onBatchDelete={handleBatchDelete}
              onBatchUpdateStatus={handleBatchUpdateStatus}
              onClearSelection={handleClearSelection}
            />
          </div>
        )}

        <MaterialTable
          materials={materials}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={setSelectedRowKeys}
        />

        {/* M002: 分页组件 */}
        {total > 0 && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={page + 1}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        )}

        <Modal
          title={editingMaterial ? '编辑物料' : '新建物料'}
          open={modalVisible}
          footer={null}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <MaterialForm
            initialValues={editingMaterial}
            onSubmit={handleSubmit}
            onCancel={() => setModalVisible(false)}
            loading={createMutation.isPending || updateMutation.isPending}
            isEdit={!!editingMaterial}
          />
        </Modal>

        {/* M002: 导入弹窗 */}
        <MaterialImportModal
          open={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          onSuccess={handleImportSuccess}
          onPreview={async (file) => {
            return await previewImportMutation.mutateAsync(file)
          }}
          onConfirm={async (file) => {
            return await confirmImportMutation.mutateAsync(file)
          }}
        />
      </Card>
    </div>
    </MaterialErrorBoundary>
  )
}
