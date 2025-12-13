import React, { useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  InputNumber,
  message
} from 'antd'
import type { CategoryAttribute, AttributeType } from '@/types/category'

const { TextArea } = Input
const { Option } = Select

interface AttributeFormProps {
  mode: 'create' | 'edit'
  initialValues?: CategoryAttribute
  onSubmit: (values: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  loading?: boolean
}

const AttributeForm: React.FC<AttributeFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm()

  // 监听属性类型变化，控制可选值显示
  const attributeType = Form.useWatch('type', form)

  // 初始化表单值
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        displayName: initialValues.displayName,
        type: initialValues.type,
        required: initialValues.required,
        optionalValues: initialValues.optionalValues || [],
        sortOrder: initialValues.sortOrder,
        description: initialValues.description,
      })
    } else if (mode === 'create') {
      form.setFieldsValue({
        required: false,
        sortOrder: 0,
        type: 'text',
      })
    }
  }, [mode, initialValues, form])

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 处理可选值（如果是数组，转换为字符串数组）
      let optionalValues: string[] | undefined = undefined
      if (values.type === 'single-select' || values.type === 'multi-select') {
        if (values.optionalValues) {
          // 如果输入的是字符串，按换行符分割
          if (typeof values.optionalValues === 'string') {
            optionalValues = values.optionalValues
              .split('\n')
              .map(v => v.trim())
              .filter(v => v.length > 0)
          } else if (Array.isArray(values.optionalValues)) {
            optionalValues = values.optionalValues.map(v => String(v).trim()).filter(v => v.length > 0)
          }
        }
        
        if (!optionalValues || optionalValues.length === 0) {
          message.error(`${values.type === 'single-select' ? '单选' : '多选'}类型必须提供至少一个可选值`)
          return
        }
      }

      const formData: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'> = {
        name: values.name,
        displayName: values.displayName || values.name,
        type: values.type,
        required: values.required || false,
        optionalValues,
        sortOrder: values.sortOrder || 0,
        description: values.description,
      }

      onSubmit(formData)
    } catch (error) {
      console.error('Form validation error:', error)
    }
  }

  // 属性类型选项
  const attributeTypeOptions = [
    { value: 'text', label: '文本' },
    { value: 'number', label: '数字' },
    { value: 'single-select', label: '单选' },
    { value: 'multi-select', label: '多选' },
  ]

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="属性名称"
        name="name"
        rules={[
          { required: true, message: '属性名称不能为空' },
          { max: 50, message: '属性名称不能超过50个字符' },
        ]}
      >
        <Input placeholder="请输入属性名称" />
      </Form.Item>

      <Form.Item
        label="显示名称"
        name="displayName"
        rules={[
          { max: 50, message: '显示名称不能超过50个字符' },
        ]}
        tooltip="用于UI展示的名称，如果不填写则使用属性名称"
      >
        <Input placeholder="请输入显示名称（可选）" />
      </Form.Item>

      <Form.Item
        label="属性类型"
        name="type"
        rules={[
          { required: true, message: '请选择属性类型' },
        ]}
      >
        <Select placeholder="请选择属性类型">
          {attributeTypeOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {(attributeType === 'single-select' || attributeType === 'multi-select') && (
        <Form.Item
          label="可选值"
          name="optionalValues"
          rules={[
            { required: true, message: '可选值不能为空' },
          ]}
          tooltip="每行输入一个可选值，或使用逗号分隔"
        >
          <TextArea
            rows={4}
            placeholder="请输入可选值，每行一个&#10;例如：&#10;选项1&#10;选项2&#10;选项3"
          />
        </Form.Item>
      )}

      <Form.Item
        label="是否必填"
        name="required"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="排序序号"
        name="sortOrder"
        rules={[
          { type: 'number', min: 0, message: '排序序号必须大于等于0' },
        ]}
      >
        <InputNumber
          min={0}
          placeholder="请输入排序序号"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="属性描述"
        name="description"
        rules={[
          { max: 200, message: '属性描述不能超过200个字符' },
        ]}
      >
        <TextArea
          rows={3}
          placeholder="请输入属性描述（可选）"
          showCount
          maxLength={200}
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            {mode === 'create' ? '创建' : '保存'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default AttributeForm


