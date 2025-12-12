import React from 'react'
import { Card, Descriptions, Tag, Space, Typography, Empty } from 'antd'
import { EditOutlined, EyeOutlined } from '@ant-design/icons'
import type { SPUAttribute } from '@/types/spu'

const { Text } = Typography

interface AttributeDisplayProps {
  attributes: SPUAttribute[]
  mode?: 'view' | 'edit'
  onEdit?: (attribute: SPUAttribute) => void
  layout?: 'horizontal' | 'vertical'
}

const AttributeDisplay: React.FC<AttributeDisplayProps> = ({
  attributes,
  mode = 'view',
  onEdit,
  layout = 'horizontal'
}) => {
  // 如果没有属性数据
  if (!attributes || attributes.length === 0) {
    return (
      <Empty
        description="暂无动态属性"
        style={{ margin: '48px 0' }}
      />
    )
  }

  // 渲染单个属性值
  const renderAttributeValue = (attribute: SPUAttribute) => {
    const { type, value } = attribute

    switch (type) {
      case 'text':
        return <Text>{value as string}</Text>

      case 'number':
        return <Text code>{value as number}</Text>

      case 'boolean':
        return (
          <Tag color={value ? 'green' : 'red'}>
            {value ? '是' : '否'}
          </Tag>
        )

      case 'date':
        return <Text>{new Date(value as string).toLocaleDateString()}</Text>

      case 'select':
        return (
          <Tag color="blue" style={{ fontSize: '13px' }}>
            {value as string}
          </Tag>
        )

      case 'multiselect':
        const values = value as string[]
        return (
          <Space wrap size={[4, 4]}>
            {values.map((v, index) => (
              <Tag key={index} color="blue" style={{ fontSize: '12px' }}>
                {v}
              </Tag>
            ))}
          </Space>
        )

      case 'url':
        return (
          <a href={value as string} target="_blank" rel="noopener noreferrer">
            <Text type="primary" underline>
              {value as string}
            </Text>
          </a>
        )

      case 'image':
        return (
          <img
            src={value as string}
            alt={attribute.name}
            style={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #f0f0f0'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )

      case 'file':
        return (
          <Tag color="orange" style={{ fontSize: '12px' }}>
            📎 {value as string}
          </Tag>
        )

      default:
        return <Text>{String(value)}</Text>
    }
  }

  // 渲染属性编辑按钮
  const renderEditButton = (attribute: SPUAttribute) => {
    if (mode !== 'edit' || !onEdit) return null

    return (
      <EditOutlined
        style={{ cursor: 'pointer', color: '#1890ff' }}
        onClick={() => onEdit(attribute)}
      />
    )
  }

  // 分组属性
  const groupedAttributes = attributes.reduce((acc, attr) => {
    const group = attr.group || '基础属性'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(attr)
    return acc
  }, {} as Record<string, SPUAttribute[]>)

  return (
    <div>
      {Object.entries(groupedAttributes).map(([groupName, groupAttributes]) => (
        <Card
          key={groupName}
          size="small"
          title={groupName}
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: 0 }}
        >
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3 }}
            size="small"
            layout={layout}
          >
            {groupAttributes.map((attribute, index) => (
              <Descriptions.Item
                key={`${attribute.id}-${index}`}
                label={
                  <Space size={4}>
                    <span>{attribute.name}</span>
                    {attribute.required && (
                      <Text type="danger" style={{ fontSize: 12 }}>*</Text>
                    )}
                    {renderEditButton(attribute)}
                  </Space>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {renderAttributeValue(attribute)}
                  {attribute.description && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 11 }}
                      title={attribute.description}
                    >
                      ?
                    </Text>
                  )}
                </div>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      ))}
    </div>
  )
}

export default AttributeDisplay