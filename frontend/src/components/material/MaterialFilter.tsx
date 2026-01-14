/**
 * @spec M002-material-filter
 * Material Filter Component - 物料筛选组件
 * User Story: US1 - 快速筛选物料
 */
import { Form, Select, InputNumber, Input, Button, Space, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { MaterialFilter, MaterialCategory } from '@/types/material'

interface MaterialFilterProps {
  onFilter: (values: MaterialFilter) => void
  loading?: boolean
}

export function MaterialFilterComponent({ onFilter, loading = false }: MaterialFilterProps) {
  const [form] = Form.useForm()

  const handleSubmit = (values: MaterialFilter) => {
    // 过滤掉空值
    const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key as keyof MaterialFilter] = value
      }
      return acc
    }, {} as MaterialFilter)

    onFilter(filteredValues)
  }

  const handleReset = () => {
    form.resetFields()
    onFilter({})
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ padding: '16px', background: '#fafafa', borderRadius: '4px' }}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="category" label="分类">
            <Select placeholder="全部" allowClear>
              <Select.Option value="RAW_MATERIAL">原料</Select.Option>
              <Select.Option value="PACKAGING">包材</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name="status" label="状态">
            <Select placeholder="全部" allowClear>
              <Select.Option value="ACTIVE">在用</Select.Option>
              <Select.Option value="INACTIVE">停用</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="成本范围（元）">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="minCost"
                noStyle
                rules={[
                  { type: 'number', min: 0, message: '最小成本不能为负数' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const maxCost = getFieldValue('maxCost')
                      if (value && maxCost && value > maxCost) {
                        return Promise.reject(new Error('最小成本不能大于最大成本'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <InputNumber
                  placeholder="最小"
                  style={{ width: '50%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
              <Form.Item
                name="maxCost"
                noStyle
                rules={[
                  { type: 'number', min: 0, message: '最大成本不能为负数' },
                ]}
              >
                <InputNumber
                  placeholder="最大"
                  style={{ width: '50%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="keyword"
            label="关键词"
            rules={[{ max: 100, message: '关键词长度不能超过100字符' }]}
          >
            <Input placeholder="物料编码或名称" allowClear />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
              查询
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  )
}
