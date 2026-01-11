/** @spec M001-material-unit-system */
import React, { useState } from 'react'
import { Button, Card, Modal, message, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { MaterialTable } from '@/components/material/MaterialTable'
import { MaterialForm } from '@/components/material/MaterialForm'
import { useMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial } from '@/hooks/useMaterials'
import type { Material, MaterialCategory } from '@/types/material'

export const MaterialManagementPage: React.FC = () => {
  const [category, setCategory] = useState<MaterialCategory | undefined>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>()

  const { data: materials, isLoading } = useMaterials(category)
  const createMutation = useCreateMaterial()
  const updateMutation = useUpdateMaterial()
  const deleteMutation = useDeleteMaterial()

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
    <Card
      title="物料主数据管理"
      extra={
        <>
          <Select
            placeholder="分类筛选"
            style={{ width: 120, marginRight: 8 }}
            allowClear
            onChange={setCategory}
          >
            <Select.Option value="RAW_MATERIAL">原料</Select.Option>
            <Select.Option value="PACKAGING">包材</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建物料
          </Button>
        </>
      }
    >
      <MaterialTable
        materials={materials || []}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
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
  )
}
