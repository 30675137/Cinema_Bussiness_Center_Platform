/** @spec M001-material-unit-system */
import React from 'react'
import { Form, Input, Select, InputNumber, Switch, Button, Space } from 'antd'
import type { Unit, UnitCategory, UnitCreateRequest, UnitUpdateRequest } from '@/types/unit'

interface UnitFormProps {
  initialValues?: Unit
  onSubmit: (values: UnitCreateRequest | UnitUpdateRequest) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

export const UnitForm: React.FC<UnitFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  isEdit = false,
}) => {
  const [form] = Form.useForm()

  return (
    <Form form={form} initialValues={initialValues} onFinish={onSubmit} layout="vertical">
      <Form.Item name="code" label="单位代码" rules={[{ required: !isEdit }]}>
        <Input disabled={isEdit} placeholder="例：ml, L, kg" />
      </Form.Item>
      <Form.Item name="name" label="单位名称" rules={[{ required: !isEdit }]}>
        <Input placeholder="例：毫升, 升, 千克" />
      </Form.Item>
      {!isEdit && (
        <Form.Item name="category" label="分类" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="VOLUME">体积</Select.Option>
            <Select.Option value="WEIGHT">重量</Select.Option>
            <Select.Option value="COUNT">计数</Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item name="decimalPlaces" label="小数位数" initialValue={2}>
        <InputNumber min={0} max={6} />
      </Form.Item>
      <Form.Item name="isBaseUnit" label="基础单位" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>提交</Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
