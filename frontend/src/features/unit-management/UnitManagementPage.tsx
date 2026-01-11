/** @spec M001-material-unit-system */
import React, { useState } from 'react'
import { Button, Card, Modal, message, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { UnitTable } from '@/components/unit/UnitTable'
import { UnitForm } from '@/components/unit/UnitForm'
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits'
import type { Unit, UnitCategory } from '@/types/unit'

export const UnitManagementPage: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory | undefined>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()

  const { data: units, isLoading } = useUnits(category)
  const createMutation = useCreateUnit()
  const updateMutation = useUpdateUnit()
  const deleteMutation = useDeleteUnit()

  const handleCreate = () => {
    setEditingUnit(undefined)
    setModalVisible(true)
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingUnit) {
        await updateMutation.mutateAsync({ id: editingUnit.id, data: values })
        message.success('单位更新成功')
      } else {
        await createMutation.mutateAsync(values)
        message.success('单位创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          message.success('删除成功')
        } catch (error) {
          message.error('删除失败，该单位可能已被引用')
        }
      },
    })
  }

  return (
    <Card
      title="单位主数据管理"
      extra={
        <>
          <Select
            placeholder="分类筛选"
            style={{ width: 120, marginRight: 8 }}
            allowClear
            onChange={setCategory}
          >
            <Select.Option value="VOLUME">体积</Select.Option>
            <Select.Option value="WEIGHT">重量</Select.Option>
            <Select.Option value="COUNT">计数</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建单位
          </Button>
        </>
      }
    >
      <UnitTable
        units={units || []}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Modal
        title={editingUnit ? '编辑单位' : '新建单位'}
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <UnitForm
          initialValues={editingUnit}
          onSubmit={handleSubmit}
          onCancel={() => setModalVisible(false)}
          loading={createMutation.isPending || updateMutation.isPending}
          isEdit={!!editingUnit}
        />
      </Modal>
    </Card>
  )
}
