/** @spec M001-material-unit-system */
import React from 'react'
import { Table, Button, Space, Tag } from 'antd'
import type { Material, MaterialCategory } from '@/types/material'

interface MaterialTableProps {
  materials: Material[]
  loading?: boolean
  onEdit: (material: Material) => void
  onDelete: (id: string) => void
}

const categoryColors: Record<MaterialCategory, string> = {
  RAW_MATERIAL: 'blue',
  PACKAGING: 'green',
}

const categoryLabels: Record<MaterialCategory, string> = {
  RAW_MATERIAL: '原料',
  PACKAGING: '包材',
}

export const MaterialTable: React.FC<MaterialTableProps> = ({ materials, loading, onEdit, onDelete }) => {
  const columns = [
    { title: '物料编码', dataIndex: 'code', key: 'code', width: 150 },
    { title: '物料名称', dataIndex: 'name', key: 'name', width: 200 },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: MaterialCategory) => (
        <Tag color={categoryColors[category]}>{categoryLabels[category]}</Tag>
      ),
    },
    {
      title: '库存单位',
      dataIndex: ['inventoryUnit', 'name'],
      key: 'inventoryUnit',
      width: 100,
    },
    {
      title: '采购单位',
      dataIndex: ['purchaseUnit', 'name'],
      key: 'purchaseUnit',
      width: 100,
    },
    {
      title: '换算率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 100,
      render: (rate: number, record: Material) =>
        record.useGlobalConversion ? '使用全局' : rate?.toFixed(2) || '-',
    },
    {
      title: '标准成本',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 100,
      render: (cost: number | undefined) =>
        cost !== undefined && cost > 0 ? `¥${cost.toFixed(2)}` : '-',
    },
    { title: '规格', dataIndex: 'specification', key: 'specification', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Material) => (
        <Space>
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return <Table columns={columns} dataSource={materials} rowKey="id" loading={loading} scroll={{ x: 1300 }} />
}
