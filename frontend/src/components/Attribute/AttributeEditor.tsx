import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Divider,
  InputNumber,
  DatePicker,
  Upload,
  Tag,
  Modal,
  Table,
  message,
  Tooltip,
  Typography,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DragOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  EyeOutlined,
  CopyOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { AttributeTemplateItem, AttributeOption, AttributeType, AttributeValidation } from '@/types/spu'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface AttributeEditorProps {
  attributes?: AttributeTemplateItem[]
  onChange?: (attributes: AttributeTemplateItem[]) => void
  readonly?: boolean
  showGroup?: boolean
}

const AttributeEditor: React.FC<AttributeEditorProps> = ({
  attributes = [],
  onChange,
  readonly = false,
  showGroup = true
}) => {
  const [form] = Form.useForm()
  const [attributeList, setAttributeList] = useState<AttributeTemplateItem[]>(attributes)
  const [editingAttribute, setEditingAttribute] = useState<AttributeTemplateItem | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewAttribute, setPreviewAttribute] = useState<AttributeTemplateItem | null>(null)

  // 属性类型选项
  const attributeTypes: { value: AttributeType; label: string; description: string }[] = [
    { value: 'text', label: '文本', description: '单行文本输入' },
    { value: 'number', label: '数字', description: '数字输入，支持验证规则' },
    { value: 'boolean', label: '布尔值', description: '是/否选择' },
    { value: 'select', label: '单选', description: '从预设选项中选择一个' },
    { value: 'multiselect', label: '多选', description: '从预设选项中选择多个' },
    { value: 'date', label: '日期', description: '日期选择器' },
    { value: 'url', label: '网址', description: 'URL地址输入' },
    { value: 'image', label: '图片', description: '图片上传' },
    { value: 'file', label: '文件', description: '文件上传' }
  ]

  // 常用属性分组
  const commonGroups = ['基础属性', '规格参数', '材质工艺', '功能特性', '服务保障', '包装信息']

  useEffect(() => {
    setAttributeList(attributes)
  }, [attributes])

  // 通知父组件属性变更
  const notifyChange = (newAttributes: AttributeTemplateItem[]) => {
    setAttributeList(newAttributes)
    onChange?.(newAttributes)
  }

  // 处理添加属性
  const handleAddAttribute = () => {
    setEditingAttribute(null)
    setModalMode('create')
    form.resetFields()
    setIsModalVisible(true)
  }

  // 处理编辑属性
  const handleEditAttribute = (attribute: AttributeTemplateItem) => {
    setEditingAttribute(attribute)
    setModalMode('edit')
    form.setFieldsValue({
      name: attribute.name,
      code: attribute.code,
      type: attribute.type,
      required: attribute.required,
      defaultValue: attribute.defaultValue,
      description: attribute.description,
      group: attribute.group,
      sort: attribute.sort,
      status: attribute.status,
      validation: attribute.validation,
      options: attribute.options?.map(opt => opt.label) || []
    })
    setIsModalVisible(true)
  }

  // 处理复制属性
  const handleCopyAttribute = (attribute: AttributeTemplateItem) => {
    const newAttribute: Partial<AttributeTemplateItem> = {
      ...attribute,
      id: '',
      name: `${attribute.name}_副本`,
      code: `${attribute.code}_copy`,
      sort: attributeList.length + 1
    }
    delete newAttribute.id

    setEditingAttribute(newAttribute as AttributeTemplateItem)
    setModalMode('create')
    form.setFieldsValue({
      ...newAttribute,
      options: attribute.options?.map(opt => opt.label) || []
    })
    setIsModalVisible(true)
    message.success('属性已复制，请修改后保存')
  }

  // 处理删除属性
  const handleDeleteAttribute = (attributeId: string) => {
    const newAttributes = attributeList.filter(attr => attr.id !== attributeId)
    notifyChange(newAttributes)
    message.success('删除成功')
  }

  // 处理属性状态切换
  const handleToggleStatus = (attributeId: string) => {
    const newAttributes = attributeList.map(attr =>
      attr.id === attributeId
        ? { ...attr, status: attr.status === 'active' ? 'inactive' : 'active' }
        : attr
    )
    notifyChange(newAttributes)
  }

  // 处理属性排序
  const handleMoveAttribute = (index: number, direction: 'up' | 'down') => {
    const newAttributes = [...attributeList]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newAttributes.length) {
      [newAttributes[index], newAttributes[targetIndex]] = [newAttributes[targetIndex], newAttributes[index]]

      // 更新排序值
      newAttributes.forEach((attr, idx) => {
        attr.sort = idx + 1
      })

      notifyChange(newAttributes)
    }
  }

  // 处理预览属性
  const handlePreviewAttribute = (attribute: AttributeTemplateItem) => {
    setPreviewAttribute(attribute)
    setPreviewVisible(true)
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      // 处理选项数据
      const options: AttributeOption[] = values.options?.map((label: string, index: number) => ({
        id: `opt_${Date.now()}_${index}`,
        label: label.trim(),
        value: label.trim().toLowerCase().replace(/\s+/g, '_'),
        sort: index + 1,
        status: 'active'
      })) || []

      const attributeData: AttributeTemplateItem = {
        id: editingAttribute?.id || `attr_${Date.now()}`,
        name: values.name,
        code: values.code,
        type: values.type,
        required: values.required || false,
        defaultValue: values.defaultValue,
        description: values.description,
        group: values.group,
        sort: values.sort || (attributeList.length + 1),
        status: values.status || 'active',
        validation: values.validation,
        options
      }

      let newAttributes: AttributeTemplateItem[]

      if (modalMode === 'create') {
        newAttributes = [...attributeList, attributeData]
        message.success('添加成功')
      } else {
        newAttributes = attributeList.map(attr =>
          attr.id === editingAttribute?.id ? attributeData : attr
        )
        message.success('更新成功')
      }

      notifyChange(newAttributes)
      setIsModalVisible(false)
      form.resetFields()
      setEditingAttribute(null)
    } catch (error) {
      message.error(`${modalMode === 'create' ? '添加' : '更新'}失败`)
      console.error('Submit attribute error:', error)
    }
  }

  // 属性表格列定义
  const columns: ColumnsType<AttributeTemplateItem> = [
    {
      title: '拖拽',
      key: 'drag',
      width: 60,
      render: (_, __, index) => (
        <div style={{ cursor: 'grab', color: '#999' }}>
          <DragOutlined />
        </div>
      )
    },
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const typeConfig = attributeTypes.find(t => t.value === type)
        return (
          <Tooltip title={typeConfig?.description}>
            <Tag>{typeConfig?.label || type}</Tag>
          </Tooltip>
        )
      }
    },
    {
      title: '分组',
      dataIndex: 'group',
      key: 'group',
      width: 120,
      render: (group) => group || '默认'
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      align: 'center',
      render: (required) => (
        <Switch size="small" checked={required} disabled />
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      ellipsis: true,
      render: (value) => {
        if (value === undefined || value === null) return '-'
        if (typeof value === 'boolean') return value ? '是' : '否'
        if (Array.isArray(value)) return value.join(', ')
        return String(value)
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status, record) => (
        <Switch
          size="small"
          checked={status === 'active'}
          onChange={() => handleToggleStatus(record.id)}
          disabled={readonly}
        />
      )
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center'
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record, index) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handlePreviewAttribute(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditAttribute(record)}
              disabled={readonly}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleCopyAttribute(record)}
              disabled={readonly}
            />
          </Tooltip>
          <Tooltip title={index > 0 ? '上移' : ''}>
            <Button
              type="text"
              icon="↑"
              size="small"
              disabled={readonly || index === 0}
              onClick={() => handleMoveAttribute(index, 'up')}
            />
          </Tooltip>
          <Tooltip title={index < attributeList.length - 1 ? '下移' : ''}>
            <Button
              type="text"
              icon="↓"
              size="small"
              disabled={readonly || index === attributeList.length - 1}
              onClick={() => handleMoveAttribute(index, 'down')}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确认删除该属性吗？"
              onConfirm={() => handleDeleteAttribute(record.id)}
              disabled={readonly}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
                disabled={readonly}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  // 渲染属性预览组件
  const renderAttributePreview = (attribute: AttributeTemplateItem) => {
    const commonProps = {
      placeholder: `请输入${attribute.name}`,
      disabled: true
    }

    switch (attribute.type) {
      case 'text':
        return <Input {...commonProps} />
      case 'number':
        return <InputNumber {...commonProps} style={{ width: '100%' }} />
      case 'boolean':
        return <Switch checked={attribute.defaultValue} disabled />
      case 'select':
        return (
          <Select {...commonProps} style={{ width: '100%' }}>
            {attribute.options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      case 'multiselect':
        return (
          <Select {...commonProps} mode="multiple" style={{ width: '100%' }}>
            {attribute.options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      case 'date':
        return (
          <DatePicker
            {...commonProps}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        )
      case 'url':
        return <Input {...commonProps} addonBefore="http://" />
      case 'image':
        return (
          <Upload
            disabled
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传图片</div>
            </div>
          </Upload>
        )
      case 'file':
        return (
          <Upload disabled>
            <Button icon={<PlusOutlined />}>选择文件</Button>
          </Upload>
        )
      default:
        return <Input {...commonProps} />
    }
  }

  return (
    <div>
      {/* 操作按钮区域 */}
      {!readonly && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAttribute}
          >
            添加属性
          </Button>
        </div>
      )}

      {/* 属性列表表格 */}
      <Card size="small">
        <Table
          columns={columns}
          dataSource={attributeList}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </Card>

      {/* 新建/编辑属性弹窗 */}
      <Modal
        title={
          <span>
            <SettingOutlined /> {modalMode === 'create' ? '新建属性' : '编辑属性'}
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
          initialValues={{ required: false, status: 'active', sort: attributeList.length + 1 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="属性名称"
                name="name"
                rules={[{ required: true, message: '请输入属性名称' }]}
              >
                <Input placeholder="请输入属性名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="属性编码"
                name="code"
                rules={[
                  { required: true, message: '请输入属性编码' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码只能包含字母、数字和下划线，且以字母开头' }
                ]}
              >
                <Input placeholder="请输入属性编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="属性类型"
                name="type"
                rules={[{ required: true, message: '请选择属性类型' }]}
              >
                <Select placeholder="请选择属性类型">
                  {attributeTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{type.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="属性分组"
                name="group"
              >
                <Select
                  placeholder="请选择属性分组"
                  allowClear
                  showSearch
                  mode="tags"
                  maxTagCount={1}
                >
                  {commonGroups.map(group => (
                    <Option key={group} value={group}>
                      {group}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="required" valuePropName="checked">
                    <Switch checkedChildren="必填" unCheckedChildren="选填" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" valuePropName="checked">
                    <Switch checkedChildren="启用" unCheckedChildren="停用" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Form.Item
            label="属性说明"
            name="description"
          >
            <TextArea
              rows={2}
              placeholder="请输入属性说明（选填）"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    默认值
                    <Tooltip title="属性的默认值，用户可以修改">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                name="defaultValue"
              >
                <Input placeholder="请输入默认值（选填）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="排序"
                name="sort"
              >
                <InputNumber
                  min={1}
                  max={999}
                  placeholder="排序值"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 根据属性类型显示不同的验证规则配置 */}
          <Form.Item dependencies={['type']} noStyle>
            {({ getFieldValue }) => {
              const type = getFieldValue('type') as AttributeType
              return (
                <Card size="small" title="验证规则配置" style={{ marginBottom: 16 }}>
                  {type === 'number' && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['validation', 'min']} label="最小值">
                          <InputNumber placeholder="最小值" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['validation', 'max']} label="最大值">
                          <InputNumber placeholder="最大值" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {type === 'text' && (
                    <Form.Item name={['validation', 'pattern']} label="正则表达式">
                      <Input placeholder="请输入正则表达式" />
                    </Form.Item>
                  )}

                  {['select', 'multiselect'].includes(type) && (
                    <Form.Item name="options" label="可选项配置">
                      <Select
                        mode="tags"
                        placeholder="输入选项后按回车添加"
                        style={{ width: '100%' }}
                        tokenSeparators={[',']}
                      />
                    </Form.Item>
                  )}
                </Card>
              )
            }}
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {modalMode === 'create' ? '创建' : '更新'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 属性预览弹窗 */}
      <Modal
        title={
          <span>
            <EyeOutlined /> 属性预览 - {previewAttribute?.name}
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        {previewAttribute && (
          <div>
            <Card size="small" title="属性信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>属性编码：</Text> {previewAttribute.code}
                </Col>
                <Col span={12}>
                  <Text strong>属性类型：</Text>
                  <Tag>{previewAttribute.type}</Tag>
                </Col>
                <Col span={12}>
                  <Text strong>属性分组：</Text> {previewAttribute.group || '默认'}
                </Col>
                <Col span={12}>
                  <Text strong>是否必填：</Text> {previewAttribute.required ? '是' : '否'}
                </Col>
              </Row>
              {previewAttribute.description && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>属性说明：</Text>
                  <div style={{ marginTop: 4, color: '#666' }}>
                    {previewAttribute.description}
                  </div>
                </div>
              )}
            </Card>

            <Card size="small" title="属性预览">
              <div style={{ marginBottom: 8 }}>
                <Text strong>用户界面：</Text>
              </div>
              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                {renderAttributePreview(previewAttribute)}
              </div>

              {previewAttribute.options && previewAttribute.options.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>可选项：</Text>
                  <div style={{ marginTop: 8 }}>
                    {previewAttribute.options.map(option => (
                      <Tag key={option.id} style={{ marginBottom: 4 }}>
                        {option.label} ({option.value})
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AttributeEditor