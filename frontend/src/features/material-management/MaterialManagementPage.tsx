/**
 * @spec M001-material-unit-system
 * @spec M002-material-filter
 */
import React, { useState, useEffect } from 'react'
import { Button, Card, Modal, message, Pagination, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { MaterialTable } from '@/components/material/MaterialTable'
import { MaterialForm } from '@/components/material/MaterialForm'
import { MaterialFilterComponent } from '@/components/material/MaterialFilter'
import { MaterialExportButton } from '@/components/material/MaterialExportButton'
import {
  useMaterials,
  useFilterMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '@/hooks/useMaterials'
import type { Material, MaterialFilter } from '@/types/material'

export const MaterialManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>()

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
          message.error('删除失败，该物料可能已被BOM引用')
        }
      },
    })
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <MaterialFilterComponent onFilter={handleFilter} loading={isLoading} />
      </Card>

      <Card
        title="物料主数据管理"
        extra={
          <Space>
            <MaterialExportButton filter={filter} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建物料
            </Button>
          </Space>
        }
      >
        <MaterialTable
          materials={materials}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
      </Card>
    </div>
  )
}
