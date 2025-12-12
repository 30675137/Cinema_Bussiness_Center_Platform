import React, { useState, useEffect, useCallback } from 'react'
import { Card, Form, Input, Select, Button, Space, DatePicker, Tag, Row, Col } from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import type { SPUStatus, Brand, Category } from '@/types/spu'
import { BrandSelect } from '@/components/forms/BrandSelect'
import { CategorySelector } from '@/components/forms/CategorySelector'
import { statusColors } from '@/theme'

const { RangePicker } = DatePicker
const { Option } = Select

interface SPUFilterValue {
  keyword?: string
  brandId?: string
  categoryId?: string
  status?: SPUStatus
  dateRange?: [string, string]
  tags?: string[]
}

interface SPUFilterProps {
  brands?: Brand[]
  categories?: Category[]
  value?: SPUFilterValue
  onChange?: (filters: SPUFilterValue) => void
  onSearch?: (filters: SPUFilterValue) => void
  onReset?: () => void
  onExport?: () => void
  loading?: boolean
}

const SPUFilter: React.FC<SPUFilterProps> = ({
  brands = [],
  categories = [],
  value = {},
  onChange,
  onSearch,
  onReset,
  onExport,
  loading = false,
}) => {
  const [form] = Form.useForm()
  const [expanded, setExpanded] = useState(false)

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue(value)
  }, [value, form])

  // 处理表单值变化
  const handleValuesChange = useCallback((changedValues: any, allValues: any) => {
    onChange?.({ ...allValues })
  }, [onChange])

  // 处理搜索
  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue()
    onSearch?.(values)
  }, [form, onSearch])

  // 处理重置
  const handleReset = useCallback(() => {
    form.resetFields()
    const emptyFilters: SPUFilterValue = {}
    onChange?.(emptyFilters)
    onReset?.()
  }, [form, onChange, onReset])

  // 处理键盘快捷键
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }, [handleSearch])

  // 状态选项
  const statusOptions = [
    {
      label: '全部状态',
      value: undefined,
      children: Object.entries(statusColors).map(([key, config]) => ({
        label: (
          <span style={{ color: config.color }}>
            <Tag color={config.color} style={{ fontSize: '12px', marginRight: 8 }}>
              {config.text}
            </Tag>
          </span>
        ),
        value: key,
      })),
    },
  ]

  // 快速标签选项
  const quickTagOptions = [
    '新品',
    '热销',
    '促销',
    '推荐',
    '限量',
    '进口',
    '国产',
    '有机',
    '无添加',
  ]

  // 渲染活动标签
  const renderActiveFilters = () => {
    const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> = []

    if (value.keyword) {
      activeFilters.push({
        key: 'keyword',
        label: `关键词: ${value.keyword}`,
        onRemove: () => {
          form.setFieldValue('keyword', undefined)
          onChange?.({ ...value, keyword: undefined })
        },
      })
    }

    if (value.brandId) {
      const brand = brands.find(b => b.id === value.brandId)
      activeFilters.push({
        key: 'brandId',
        label: `品牌: ${brand?.name || value.brandId}`,
        onRemove: () => {
          form.setFieldValue('brandId', undefined)
          onChange?.({ ...value, brandId: undefined })
        },
      })
    }

    if (value.categoryId) {
      activeFilters.push({
        key: 'categoryId',
        label: `分类: 已选择`,
        onRemove: () => {
          form.setFieldValue('categoryId', undefined)
          onChange?.({ ...value, categoryId: undefined })
        },
      })
    }

    if (value.status) {
      activeFilters.push({
        key: 'status',
        label: `状态: ${statusColors[value.status as keyof typeof statusColors]?.text}`,
        onRemove: () => {
          form.setFieldValue('status', undefined)
          onChange?.({ ...value, status: undefined })
        },
      })
    }

    if (value.tags && value.tags.length > 0) {
      activeFilters.push({
        key: 'tags',
        label: `标签: ${value.tags.join(', ')}`,
        onRemove: () => {
          form.setFieldValue('tags', [])
          onChange?.({ ...value, tags: [] })
        },
      })
    }

    if (value.dateRange && value.dateRange.length === 2) {
      activeFilters.push({
        key: 'dateRange',
        label: `日期: ${value.dateRange[0]} 至 ${value.dateRange[1]}`,
        onRemove: () => {
          form.setFieldValue('dateRange', undefined)
          onChange?.({ ...value, dateRange: undefined })
        },
      })
    }

    return activeFilters
  }

  const activeFilters = renderActiveFilters()

  return (
    <div style={{ marginBottom: 16 }}>
      <Card size="small" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        {/* 基础筛选条件 */}
        <Form
          form={form}
          onValuesChange={handleValuesChange}
          layout="inline"
          style={{ alignItems: 'center' }}
        >
          <Form.Item name="keyword" style={{ marginBottom: 0 }}>
            <Input.Search
              placeholder="搜索SPU编码、名称、描述"
              allowClear
              style={{ width: 240 }}
              onSearch={handleSearch}
              onPressEnter={handleKeyPress}
              enterButton={
                <Button type="primary" icon={<SearchOutlined />}>
                  搜索
                </Button>
              }
            />
          </Form.Item>

          <Form.Item name="brandId" style={{ marginBottom: 0 }}>
            <BrandSelect
              brands={brands}
              placeholder="选择品牌"
              allowClear
              showSearch
              style={{ width: 160 }}
            />
          </Form.Item>

          <Form.Item name="categoryId" style={{ marginBottom: 0 }}>
            <CategorySelector
              categories={categories}
              placeholder="选择分类"
              allowClear
              showSearch
              style={{ width: 160 }}
            />
          </Form.Item>

          <Form.Item name="status" style={{ marginBottom: 0 }}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: 120 }}
              options={statusOptions}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                handleReset()
                handleSearch()
              }}
            >
              刷新
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '收起' : '高级筛选'}
            </Button>
            {onExport && (
              <Button
                icon={<ExportOutlined />}
                onClick={onExport}
              >
                导出
              </Button>
            )}
          </Space>
        </Form>

        {/* 高级筛选条件 */}
        {expanded && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Form
              form={form}
              layout="vertical"
              style={{ marginTop: 16 }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="创建时间" name="dateRange">
                    <RangePicker
                      style={{ width: '100%' }}
                      placeholder={['开始日期', '结束日期']}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item label="标签" name="tags">
                    <Select
                      mode="multiple"
                      placeholder="选择或输入标签"
                      style={{ width: '100%' }}
                      options={quickTagOptions.map(tag => ({
                        label: tag,
                        value: tag,
                      }))}
                      maxTagCount="responsive"
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        )}

        {/* 活动筛选标签 */}
        {activeFilters.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
                当前筛选条件 ({activeFilters.length}):
              </span>
              <Button
                type="link"
                size="small"
                onClick={handleReset}
                style={{ fontSize: '12px' }}
              >
                清除所有
              </Button>
            </div>
            <div style={{ marginTop: 8 }}>
              <Space wrap size={[4, 4]}>
                {activeFilters.map(filter => (
                  <Tag
                    key={filter.key}
                    closable
                    onClose={filter.onRemove}
                    style={{ fontSize: '12px', marginBottom: 4 }}
                  >
                    {filter.label}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// 快速筛选组件
export const QuickFilter: React.FC<{
  options: Array<{
    key: string
    label: string
    color?: string
    icon?: React.ReactNode
  }>
  value?: string
  onChange?: (value?: string) => void
}> = ({ options, value, onChange }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ marginRight: 8, fontSize: '14px', fontWeight: 500 }}>快速筛选:</span>
      <Space size={[8, 8]} wrap>
        <Tag.CheckableTag
          checked={!value}
          onChange={() => onChange?.(undefined)}
          style={{ fontSize: '12px' }}
        >
          全部
        </Tag.CheckableTag>
        {options.map(option => (
          <Tag.CheckableTag
            key={option.key}
            checked={value === option.key}
            onChange={() => onChange?.(value === option.key ? undefined : option.key)}
            color={option.color}
            style={{ fontSize: '12px' }}
          >
            {option.icon && <span style={{ marginRight: 4 }}>{option.icon}</span>}
            {option.label}
          </Tag.CheckableTag>
        ))}
      </Space>
    </div>
  )
}

// 状态筛选快捷组件
export const StatusQuickFilter: React.FC<{
  value?: SPUStatus
  onChange?: (value?: SPUStatus) => void
}> = ({ value, onChange }) => {
  const statusOptions = Object.entries(statusColors).map(([key, config]) => ({
    key,
    label: config.text,
    color: config.color,
  }))

  return (
    <QuickFilter
      options={statusOptions}
      value={value}
      onChange={onChange}
    />
  )
}

export default SPUFilter