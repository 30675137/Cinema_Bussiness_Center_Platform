import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tooltip,
  Typography,
  Row,
  Col,
  Divider,
  Badge
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { AttributeTemplate, AttributeTemplateItem, AttributeTemplateQueryParams } from '@/types/spu'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

interface AttributeTemplateProps {
  mode?: 'manage' | 'select'
  categoryId?: string
  onTemplateSelect?: (template: AttributeTemplate) => void
  showActions?: boolean
  height?: number
}

const AttributeTemplateManager: React.FC<AttributeTemplateProps> = ({
  mode = 'manage',
  categoryId,
  onTemplateSelect,
  showActions = true,
  height = 600
}) => {
  const [templates, setTemplates] = useState<AttributeTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AttributeTemplate | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [form] = Form.useForm()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<AttributeTemplate | null>(null)

  // 模拟数据
  const mockTemplates: AttributeTemplate[] = [
    {
      id: '1',
      name: '服装基础属性模板',
      code: 'clothing_basic',
      description: '适用于服装类商品的基础属性模板，包含尺码、颜色、材质等',
      categoryId: 'cat_001',
      categoryName: '服装',
      status: 'active',
      isSystem: false,
      attributes: [
        {
          id: 'attr_1',
          name: '尺码',
          code: 'size',
          type: 'select',
          required: true,
          defaultValue: 'M',
          description: '商品尺码',
          options: [
            { id: 'opt_1', label: 'XS', value: 'XS', sort: 1, status: 'active' },
            { id: 'opt_2', label: 'S', value: 'S', sort: 2, status: 'active' },
            { id: 'opt_3', label: 'M', value: 'M', sort: 3, status: 'active' },
            { id: 'opt_4', label: 'L', value: 'L', sort: 4, status: 'active' },
            { id: 'opt_5', label: 'XL', value: 'XL', sort: 5, status: 'active' },
            { id: 'opt_6', label: 'XXL', value: 'XXL', sort: 6, status: 'active' }
          ],
          group: '基础属性',
          sort: 1,
          status: 'active'
        },
        {
          id: 'attr_2',
          name: '颜色',
          code: 'color',
          type: 'multiselect',
          required: true,
          description: '商品颜色',
          options: [
            { id: 'opt_7', label: '红色', value: 'red', sort: 1, status: 'active' },
            { id: 'opt_8', label: '蓝色', value: 'blue', sort: 2, status: 'active' },
            { id: 'opt_9', label: '黑色', value: 'black', sort: 3, status: 'active' },
            { id: 'opt_10', label: '白色', value: 'white', sort: 4, status: 'active' }
          ],
          group: '基础属性',
          sort: 2,
          status: 'active'
        },
        {
          id: 'attr_3',
          name: '材质',
          code: 'material',
          type: 'select',
          required: false,
          description: '主要材质成分',
          options: [
            { id: 'opt_11', label: '纯棉', value: 'cotton', sort: 1, status: 'active' },
            { id: 'opt_12', label: '涤纶', value: 'polyester', sort: 2, status: 'active' },
            { id: 'opt_13', label: '混纺', value: 'blend', sort: 3, status: 'active' },
            { id: 'opt_14', label: '羊毛', value: 'wool', sort: 4, status: 'active' }
          ],
          group: '材质属性',
          sort: 3,
          status: 'active'
        }
      ],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T15:45:00Z',
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      name: '电子产品属性模板',
      code: 'electronics_basic',
      description: '适用于电子产品的基础属性模板，包含规格、参数、保修等',
      categoryId: 'cat_002',
      categoryName: '电子产品',
      status: 'active',
      isSystem: false,
      attributes: [
        {
          id: 'attr_4',
          name: '型号',
          code: 'model',
          type: 'text',
          required: true,
          description: '产品型号',
          group: '基础属性',
          sort: 1,
          status: 'active'
        },
        {
          id: 'attr_5',
          name: '保修期',
          code: 'warranty',
          type: 'number',
          required: true,
          defaultValue: 12,
          description: '保修期（月）',
          validation: { min: 1, max: 60 },
          group: '服务属性',
          sort: 2,
          status: 'active'
        },
        {
          id: 'attr_6',
          name: '是否防水',
          code: 'waterproof',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: '是否支持防水',
          group: '特性属性',
          sort: 3,
          status: 'active'
        }
      ],
      createdAt: '2024-01-16T09:20:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '3',
      name: '食品基础属性模板',
      code: 'food_basic',
      description: '适用于食品类商品的基础属性模板，包含保质期、成分、产地等',
      categoryId: 'cat_003',
      categoryName: '食品',
      status: 'inactive',
      isSystem: true,
      attributes: [
        {
          id: 'attr_7',
          name: '保质期',
          code: 'shelf_life',
          type: 'number',
          required: true,
          description: '保质期（天）',
          validation: { min: 1 },
          group: '基础属性',
          sort: 1,
          status: 'active'
        },
        {
          id: 'attr_8',
          name: '产地',
          code: 'origin',
          type: 'text',
          required: true,
          description: '商品产地',
          group: '基础属性',
          sort: 2,
          status: 'active'
        }
      ],
      createdAt: '2024-01-10T08:15:00Z',
      updatedAt: '2024-01-10T08:15:00Z',
      createdBy: 'system',
      updatedBy: 'system'
    }
  ]

  // 加载模板数据
  const loadTemplates = async (params?: AttributeTemplateQueryParams) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))

      let filteredTemplates = mockTemplates

      if (params?.keyword) {
        filteredTemplates = filteredTemplates.filter(template =>
          template.name.toLowerCase().includes(params.keyword!.toLowerCase()) ||
          template.code.toLowerCase().includes(params.keyword!.toLowerCase()) ||
          template.description?.toLowerCase().includes(params.keyword!.toLowerCase())
        )
      }

      if (params?.categoryId) {
        filteredTemplates = filteredTemplates.filter(template =>
          template.categoryId === params.categoryId
        )
      }

      if (params?.status) {
        filteredTemplates = filteredTemplates.filter(template =>
          template.status === params.status
        )
      }

      if (params?.isSystem !== undefined) {
        filteredTemplates = filteredTemplates.filter(template =>
          template.isSystem === params.isSystem
        )
      }

      setTemplates(filteredTemplates)
    } catch (error) {
      message.error('加载属性模板失败')
      console.error('Load templates error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates({ categoryId })
  }, [categoryId])

  // 处理添加模板
  const handleAddTemplate = () => {
    setSelectedTemplate(null)
    setModalMode('create')
    form.resetFields()
    setIsModalVisible(true)
  }

  // 处理编辑模板
  const handleEditTemplate = (template: AttributeTemplate) => {
    setSelectedTemplate(template)
    setModalMode('edit')
    form.setFieldsValue({
      name: template.name,
      code: template.code,
      description: template.description,
      categoryId: template.categoryId,
      status: template.status
    })
    setIsModalVisible(true)
  }

  // 处理查看模板
  const handleViewTemplate = (template: AttributeTemplate) => {
    setPreviewTemplate(template)
    setPreviewVisible(true)
  }

  // 处理复制模板
  const handleCopyTemplate = (template: AttributeTemplate) => {
    setSelectedTemplate({ ...template, id: '', name: `${template.name}_副本`, code: `${template.code}_copy` })
    setModalMode('create')
    form.setFieldsValue({
      name: `${template.name}_副本`,
      code: `${template.code}_copy`,
      description: template.description,
      categoryId: template.categoryId,
      status: 'inactive'
    })
    setIsModalVisible(true)
    message.success('模板已复制，请修改后保存')
  }

  // 处理删除模板
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      setTemplates(prev => prev.filter(template => template.id !== templateId))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
      console.error('Delete template error:', error)
    }
  }

  // 处理选择模板（选择模式下）
  const handleSelectTemplate = (template: AttributeTemplate) => {
    if (mode === 'select' && onTemplateSelect) {
      onTemplateSelect(template)
    }
  }

  // 处理模板状态切换
  const handleToggleStatus = async (template: AttributeTemplate) => {
    try {
      const newStatus = template.status === 'active' ? 'inactive' : 'active'

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))

      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id ? { ...t, status: newStatus } : t
        )
      )

      message.success(`${newStatus === 'active' ? '启用' : '停用'}成功`)
    } catch (error) {
      message.error('状态切换失败')
      console.error('Toggle status error:', error)
    }
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (modalMode === 'create') {
        const newTemplate: AttributeTemplate = {
          id: `template_${Date.now()}`,
          ...values,
          attributes: selectedTemplate?.attributes || [],
          isSystem: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current_user',
          updatedBy: 'current_user'
        }

        setTemplates(prev => [...prev, newTemplate])
        message.success('创建成功')
      } else if (modalMode === 'edit' && selectedTemplate) {
        setTemplates(prev =>
          prev.map(template =>
            template.id === selectedTemplate.id
              ? { ...template, ...values, updatedAt: new Date().toISOString(), updatedBy: 'current_user' }
              : template
          )
        )
        message.success('更新成功')
      }

      setIsModalVisible(false)
      form.resetFields()
      setSelectedTemplate(null)
    } catch (error) {
      message.error(`${modalMode === 'create' ? '创建' : '更新'}失败`)
      console.error('Submit template error:', error)
    }
  }

  // 表格列定义
  const columns: ColumnsType<AttributeTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {text}
            {record.isSystem && <Tag color="blue" size="small" style={{ marginLeft: 8 }}>系统</Tag>}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <CodeOutlined /> {record.code}
          </div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '所属分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (text) => text || '通用'
    },
    {
      title: '属性数量',
      key: 'attributeCount',
      width: 100,
      render: (_, record) => (
        <Badge count={record.attributes.length} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        status === 'active' ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>启用</Tag>
        ) : (
          <Tag color="warning" icon={<CloseCircleOutlined />}>停用</Tag>
        )
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN')
    }
  ]

  // 操作列
  if (showActions && mode === 'manage') {
    columns.push({
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditTemplate(record)}
              disabled={record.isSystem}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleCopyTemplate(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '停用' : '启用'}>
            <Switch
              size="small"
              checked={record.status === 'active'}
              onChange={() => handleToggleStatus(record)}
              disabled={record.isSystem}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确认删除该属性模板吗？"
              description="删除后将无法恢复，请谨慎操作。"
              onConfirm={() => handleDeleteTemplate(record.id)}
              disabled={record.isSystem}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
                disabled={record.isSystem}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    })
  }

  return (
    <div>
      {/* 操作按钮区域 */}
      {showActions && mode === 'manage' && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTemplate}
            >
              新建模板
            </Button>
          </Space>
        </div>
      )}

      {/* 模板列表表格 */}
      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={loading}
        scroll={{ y: height }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onRow={mode === 'select' ? (record) => ({
          style: { cursor: 'pointer' },
          onClick: () => handleSelectTemplate(record)
        }) : undefined}
      />

      {/* 新建/编辑模板弹窗 */}
      <Modal
        title={
          <span>
            <SettingOutlined /> {modalMode === 'create' ? '新建属性模板' : '编辑属性模板'}
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模板名称"
                name="name"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="模板编码"
                name="code"
                rules={[
                  { required: true, message: '请输入模板编码' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码只能包含字母、数字和下划线，且以字母开头' }
                ]}
              >
                <Input placeholder="请输入模板编码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="模板描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="请输入模板描述（选填）"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属分类"
                name="categoryId"
              >
                <Select placeholder="请选择所属分类（选填）" allowClear>
                  <Option value="cat_001">服装</Option>
                  <Option value="cat_002">电子产品</Option>
                  <Option value="cat_003">食品</Option>
                  <Option value="cat_004">家居用品</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                initialValue="active"
              >
                <Select>
                  <Option value="active">启用</Option>
                  <Option value="inactive">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

      {/* 模板预览弹窗 */}
      <Modal
        title={
          <span>
            <EyeOutlined /> 模板详情 - {previewTemplate?.name}
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        {previewTemplate && (
          <div>
            <Card size="small" title="基础信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>模板编码：</Text> {previewTemplate.code}
                </Col>
                <Col span={12}>
                  <Text strong>所属分类：</Text> {previewTemplate.categoryName || '通用'}
                </Col>
                <Col span={12}>
                  <Text strong>状态：</Text>
                  {previewTemplate.status === 'active' ? (
                    <Tag color="success">启用</Tag>
                  ) : (
                    <Tag color="warning">停用</Tag>
                  )}
                </Col>
                <Col span={12}>
                  <Text strong>类型：</Text>
                  {previewTemplate.isSystem ? (
                    <Tag color="blue">系统模板</Tag>
                  ) : (
                    <Tag color="default">自定义模板</Tag>
                  )}
                </Col>
              </Row>
              {previewTemplate.description && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>描述：</Text>
                  <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                    {previewTemplate.description}
                  </Paragraph>
                </div>
              )}
            </Card>

            <Card size="small" title="属性列表">
              {previewTemplate.attributes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  暂无属性配置
                </div>
              ) : (
                <div>
                  {previewTemplate.attributes.map((attr, index) => (
                    <div key={attr.id} style={{ marginBottom: 12 }}>
                      {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                      <Row gutter={16}>
                        <Col span={6}>
                          <Text strong>{attr.name}</Text>
                          {attr.required && <Tag color="red" size="small" style={{ marginLeft: 4 }}>必填</Tag>}
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{attr.code}</Text>
                        </Col>
                        <Col span={4}>
                          <Text type="secondary">类型：</Text>
                          <Tag>{attr.type}</Tag>
                        </Col>
                        <Col span={6}>
                          <Text type="secondary">分组：</Text>
                          {attr.group || '默认'}
                        </Col>
                        <Col span={8}>
                          {attr.description && (
                            <div>
                              <Text type="secondary">说明：</Text>
                              <Text style={{ fontSize: '12px' }}>{attr.description}</Text>
                            </div>
                          )}
                        </Col>
                      </Row>
                      {attr.options && attr.options.length > 0 && (
                        <div style={{ marginTop: 8, paddingLeft: 12 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>可选项：</Text>
                          <div style={{ marginTop: 4 }}>
                            {attr.options.map(option => (
                              <Tag key={option.id} size="small" style={{ marginBottom: 4 }}>
                                {option.label} ({option.value})
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AttributeTemplateManager