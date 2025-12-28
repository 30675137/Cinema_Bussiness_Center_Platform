/**
 * @spec O003-beverage-order
 * 饮品规格配置弹窗组件 (User Story 3 - FR-032, FR-033)
 */

import React, { useState } from 'react'
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import {
  getBeverageSpecs,
  addBeverageSpec,
  updateBeverageSpec,
  deleteBeverageSpec,
} from '../services/beverageAdminApi'
import type {
  BeverageSpecDTO,
  CreateSpecRequest,
  UpdateSpecRequest,
  SpecType,
} from '../types/beverage'

interface SpecConfigModalProps {
  open: boolean
  beverageId: string | null
  beverageName?: string
  onClose: () => void
}

/**
 * 规格类型选项
 */
const SPEC_TYPE_OPTIONS: { label: string; value: SpecType }[] = [
  { label: '容量大小', value: 'SIZE' },
  { label: '温度', value: 'TEMPERATURE' },
  { label: '甜度', value: 'SWEETNESS' },
  { label: '配料', value: 'TOPPING' },
]

const SPEC_TYPE_LABELS: Record<SpecType, string> = {
  SIZE: '容量大小',
  TEMPERATURE: '温度',
  SWEETNESS: '甜度',
  TOPPING: '配料',
}

export const SpecConfigModal: React.FC<SpecConfigModalProps> = ({
  open,
  beverageId,
  beverageName,
  onClose,
}) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [editingSpec, setEditingSpec] = useState<BeverageSpecDTO | null>(null)
  const [formVisible, setFormVisible] = useState(false)

  // 获取规格列表
  const { data: specs, isLoading } = useQuery({
    queryKey: ['beverage-specs', beverageId],
    queryFn: () => getBeverageSpecs(beverageId!),
    enabled: !!beverageId && open,
  })

  // 添加规格
  const addMutation = useMutation({
    mutationFn: (data: CreateSpecRequest) =>
      addBeverageSpec(beverageId!, data),
    onSuccess: () => {
      message.success('添加规格成功')
      queryClient.invalidateQueries({ queryKey: ['beverage-specs', beverageId] })
      handleFormCancel()
    },
    onError: (error: Error) => {
      message.error(`添加失败: ${error.message}`)
    },
  })

  // 更新规格
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSpecRequest }) =>
      updateBeverageSpec(beverageId!, id, data),
    onSuccess: () => {
      message.success('更新规格成功')
      queryClient.invalidateQueries({ queryKey: ['beverage-specs', beverageId] })
      handleFormCancel()
    },
    onError: (error: Error) => {
      message.error(`更新失败: ${error.message}`)
    },
  })

  // 删除规格
  const deleteMutation = useMutation({
    mutationFn: (specId: string) => deleteBeverageSpec(beverageId!, specId),
    onSuccess: () => {
      message.success('删除规格成功')
      queryClient.invalidateQueries({ queryKey: ['beverage-specs', beverageId] })
    },
    onError: (error: Error) => {
      message.error(`删除失败: ${error.message}`)
    },
  })

  const handleAddSpec = () => {
    setEditingSpec(null)
    form.resetFields()
    setFormVisible(true)
  }

  const handleEditSpec = (spec: BeverageSpecDTO) => {
    setEditingSpec(spec)
    form.setFieldsValue({
      specType: spec.specType,
      name: spec.name,
      priceAdjustment: spec.priceAdjustment / 100, // 转换为元
      isDefault: spec.isDefault,
      sortOrder: spec.sortOrder,
      description: spec.description,
    })
    setFormVisible(true)
  }

  const handleDeleteSpec = (specId: string) => {
    deleteMutation.mutate(specId)
  }

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields()

      // 转换价格为分
      const priceAdjustmentInCents = Math.round(values.priceAdjustment * 100)

      if (editingSpec) {
        // 编辑模式
        const updateData: UpdateSpecRequest = {
          specType: values.specType,
          name: values.name,
          priceAdjustment: priceAdjustmentInCents,
          isDefault: values.isDefault,
          sortOrder: values.sortOrder,
          description: values.description,
        }
        updateMutation.mutate({ id: editingSpec.id, data: updateData })
      } else {
        // 新增模式
        const createData: CreateSpecRequest = {
          specType: values.specType,
          name: values.name,
          priceAdjustment: priceAdjustmentInCents,
          isDefault: values.isDefault || false,
          sortOrder: values.sortOrder || 0,
          description: values.description,
        }
        addMutation.mutate(createData)
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleFormCancel = () => {
    form.resetFields()
    setFormVisible(false)
    setEditingSpec(null)
  }

  const columns: ColumnsType<BeverageSpecDTO> = [
    {
      title: '规格类型',
      dataIndex: 'specType',
      key: 'specType',
      width: 120,
      render: (type: SpecType) => (
        <Tag color="blue">{SPEC_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: '规格名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '价格调整',
      dataIndex: 'priceAdjustment',
      key: 'priceAdjustment',
      width: 120,
      render: (adjustment: number) => {
        const yuan = adjustment / 100
        return yuan >= 0 ? `+¥${yuan.toFixed(2)}` : `-¥${Math.abs(yuan).toFixed(2)}`
      },
    },
    {
      title: '默认选项',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (isDefault: boolean) =>
        isDefault ? <Tag color="green">默认</Tag> : '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: BeverageSpecDTO) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSpec(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此规格吗？"
            onConfirm={() => handleDeleteSpec(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Modal
      title={`规格配置 - ${beverageName || ''}`}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSpec}
        >
          添加规格
        </Button>
      </div>

      <Table<BeverageSpecDTO>
        columns={columns}
        dataSource={specs || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingSpec ? '编辑规格' : '添加规格'}
        open={formVisible}
        onOk={handleFormSubmit}
        onCancel={handleFormCancel}
        confirmLoading={addMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="规格类型"
            name="specType"
            rules={[{ required: true, message: '请选择规格类型' }]}
          >
            <Select
              placeholder="选择规格类型"
              options={SPEC_TYPE_OPTIONS}
              disabled={!!editingSpec}
            />
          </Form.Item>

          <Form.Item
            label="规格名称"
            name="name"
            rules={[
              { required: true, message: '请输入规格名称' },
              { max: 50, message: '名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="例如：大杯、中杯、小杯" />
          </Form.Item>

          <Form.Item
            label="价格调整（元）"
            name="priceAdjustment"
            rules={[{ required: true, message: '请输入价格调整' }]}
            tooltip="正数表示加价，负数表示减价，0表示无调整"
          >
            <InputNumber
              placeholder="0.00"
              precision={2}
              style={{ width: '100%' }}
              addonAfter="元"
            />
          </Form.Item>

          <Space>
            <Form.Item
              label="排序序号"
              name="sortOrder"
              initialValue={0}
            >
              <InputNumber min={0} placeholder="0" />
            </Form.Item>

            <Form.Item
              label="设为默认"
              name="isDefault"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </Space>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ max: 200, message: '描述不能超过200个字符' }]}
          >
            <Input.TextArea rows={2} placeholder="可选的规格描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  )
}

export default SpecConfigModal
