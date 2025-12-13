import React, { useEffect } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Card,
  Typography,
  Divider,
  message
} from 'antd'
import {
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryStatus } from '@/types/category'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

interface CategoryFormProps {
  mode: 'create' | 'edit'
  initialValues?: Category
  parentCategory?: Category
  onSubmit: (values: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  initialValues,
  parentCategory,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm()

  // 确定类目等级
  const categoryLevel = parentCategory 
    ? ((parentCategory.level + 1) as 1 | 2 | 3)
    : 1

  // 初始化表单值
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        sortOrder: initialValues.sortOrder,
        status: initialValues.status,
      })
    } else if (mode === 'create') {
      form.setFieldsValue({
        status: 'active',
        sortOrder: 0,
      })
    }
  }, [mode, initialValues, form])

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (mode === 'create') {
        const createData: CreateCategoryRequest = {
          name: values.name,
          parentId: parentCategory?.id,
          description: values.description,
          sortOrder: values.sortOrder || 0,
          status: values.status || 'active',
        }
        await onSubmit(createData)
      } else {
        const updateData: UpdateCategoryRequest = {
          id: initialValues!.id,
          name: values.name,
          description: values.description,
          sortOrder: values.sortOrder,
          status: values.status,
        }
        await onSubmit(updateData)
      }
    } catch (error) {
      console.error('Form validation error:', error)
    }
  }

  // 格式化路径显示
  const formatPath = (path: string[]): string => {
    return path.length > 0 ? path.join(' / ') : '根类目'
  }

  return (
    <Card
      title={
        <Title level={5} style={{ margin: 0 }}>
          {mode === 'create' ? '新建类目' : '编辑类目'}
        </Title>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* 只读字段显示 */}
        {mode === 'edit' && initialValues && (
          <>
            <Form.Item label="类目编码">
              <Input value={initialValues.code} disabled />
            </Form.Item>

            <Form.Item label="类目等级">
              <Input 
                value={initialValues.level === 1 ? '一级类目' : initialValues.level === 2 ? '二级类目' : '三级类目'} 
                disabled 
              />
            </Form.Item>

            {initialValues.parentName && (
              <Form.Item label="上级类目">
                <Input value={initialValues.parentName} disabled />
              </Form.Item>
            )}

            <Form.Item label="类目路径">
              <Input value={formatPath(initialValues.path)} disabled />
            </Form.Item>

            <Divider />
          </>
        )}

        {mode === 'create' && parentCategory && (
          <>
            <Form.Item label="上级类目">
              <Input value={parentCategory.name} disabled />
            </Form.Item>

            <Form.Item label="类目等级">
              <Input 
                value={categoryLevel === 2 ? '二级类目' : '三级类目'} 
                disabled 
              />
            </Form.Item>

            <Divider />
          </>
        )}

        {/* 可编辑字段 */}
        <Form.Item
          label="类目名称"
          name="name"
          rules={[
            { required: true, message: '类目名称不能为空' },
            { max: 50, message: '类目名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="请输入类目名称" />
        </Form.Item>

        <Form.Item
          label="类目描述"
          name="description"
          rules={[
            { max: 200, message: '类目描述不能超过200个字符' },
          ]}
        >
          <TextArea 
            rows={3} 
            placeholder="请输入类目描述（可选）"
            showCount
            maxLength={200}
          />
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
          label="状态"
          name="status"
          rules={[
            { required: true, message: '请选择状态' },
          ]}
        >
          <Select placeholder="请选择状态">
            <Option value="active">启用</Option>
            <Option value="inactive">停用</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {mode === 'create' ? '创建' : '保存'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default CategoryForm


