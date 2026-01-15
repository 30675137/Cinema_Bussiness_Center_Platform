/** @spec M001-material-unit-system */
import React from 'react'
import { Table, Button, Space, Tag } from 'antd'
import type { Unit, UnitCategory } from '@/types/unit'

interface UnitTableProps {
  units: Unit[]
  loading?: boolean
  onEdit: (unit: Unit) => void
  onDelete: (id: string) => void
}

const categoryColors: Record<UnitCategory, string> = {
  VOLUME: 'blue',
  WEIGHT: 'green',
  COUNT: 'orange',
}

export const UnitTable: React.FC<UnitTableProps> = ({ units, loading, onEdit, onDelete }) => {
  const columns = [
    { title: '代码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: UnitCategory) => (
        <Tag color={categoryColors[category]}>{category}</Tag>
      ),
    },
    { title: '小数位数', dataIndex: 'decimalPlaces', key: 'decimalPlaces', width: 100 },
    {
      title: '基础单位',
      dataIndex: 'isBaseUnit',
      key: 'isBaseUnit',
      width: 100,
      render: (isBaseUnit: boolean) => (isBaseUnit ? '是' : '否'),
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Unit) => (
        <Space>
          <Button type="link" size="small" onClick={() => onEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  return <Table columns={columns} dataSource={units} rowKey="id" loading={loading} />
}
