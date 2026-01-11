/** @spec M001-material-unit-system */
import React from 'react'
import { Form, Input, Select, InputNumber, Switch, Button, Space } from 'antd'
import type { Material, MaterialCreateRequest, MaterialUpdateRequest, MaterialCategory } from '@/types/material'
import { useUnits } from '@/hooks/useUnits'

interface MaterialFormProps {
  initialValues?: Material
  onSubmit: (values: MaterialCreateRequest | MaterialUpdateRequest) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  isEdit = false,
}) => {
  const [form] = Form.useForm()
  const { data: units } = useUnits()

  const handleFinish = (values: any) => {
    if (isEdit) {
      const updateData: MaterialUpdateRequest = {
        name: values.name,
        inventoryUnitId: values.inventoryUnitId,
        purchaseUnitId: values.purchaseUnitId,
        conversionRate: values.conversionRate,
        useGlobalConversion: values.useGlobalConversion,
        description: values.description,
        specifications: values.specifications,
      }
      onSubmit(updateData)
    } else {
      const createData: MaterialCreateRequest = {
        code: values.code,
        name: values.name,
        category: values.category,
        inventoryUnitId: values.inventoryUnitId,
        purchaseUnitId: values.purchaseUnitId,
        conversionRate: values.conversionRate,
        useGlobalConversion: values.useGlobalConversion ?? true,
        description: values.description,
        specifications: values.specifications,
      }
      onSubmit(createData)
    }
  }

  return (
    <Form
      form={form}
      initialValues={
        initialValues
          ? {
              ...initialValues,
              inventoryUnitId: initialValues.inventoryUnit?.id,
              purchaseUnitId: initialValues.purchaseUnit?.id,
            }
          : { useGlobalConversion: true }
      }
      onFinish={handleFinish}
      layout="vertical"
    >
      {!isEdit && (
        <>
          <Form.Item name="code" label="物料编码" help="留空则自动生成">
            <Input placeholder="例：MAT-RAW-001, MAT-PKG-001（可选）" />
          </Form.Item>
          <Form.Item name="category" label="物料分类" rules={[{ required: true, message: '请选择物料分类' }]}>
            <Select>
              <Select.Option value="RAW_MATERIAL">原料</Select.Option>
              <Select.Option value="PACKAGING">包材</Select.Option>
            </Select>
          </Form.Item>
        </>
      )}

      <Form.Item name="name" label="物料名称" rules={[{ required: !isEdit, message: '请输入物料名称' }]}>
        <Input placeholder="例：糖浆、塑料杯" />
      </Form.Item>

      <Form.Item
        name="inventoryUnitId"
        label="库存单位"
        rules={[{ required: !isEdit, message: '请选择库存单位' }]}
      >
        <Select placeholder="选择库存单位">
          {units?.map((unit) => (
            <Select.Option key={unit.id} value={unit.id}>
              {unit.name} ({unit.code})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="purchaseUnitId"
        label="采购单位"
        rules={[{ required: !isEdit, message: '请选择采购单位' }]}
      >
        <Select placeholder="选择采购单位">
          {units?.map((unit) => (
            <Select.Option key={unit.id} value={unit.id}>
              {unit.name} ({unit.code})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="useGlobalConversion" label="使用全局换算" valuePropName="checked">
        <Switch checkedChildren="是" unCheckedChildren="否" />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.useGlobalConversion !== currentValues.useGlobalConversion
        }
      >
        {({ getFieldValue }) =>
          !getFieldValue('useGlobalConversion') && (
            <Form.Item
              name="conversionRate"
              label="物料级换算率"
              rules={[{ required: true, message: '请输入换算率' }]}
            >
              <InputNumber
                min={0.000001}
                precision={6}
                style={{ width: '100%' }}
                placeholder="例：1000.00（1采购单位=1000库存单位）"
              />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item name="specifications" label="规格">
        <Input.TextArea rows={2} placeholder="例：500ml/瓶, 12瓶/箱" />
      </Form.Item>

      <Form.Item name="description" label="描述">
        <Input.TextArea rows={3} placeholder="物料详细描述" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
