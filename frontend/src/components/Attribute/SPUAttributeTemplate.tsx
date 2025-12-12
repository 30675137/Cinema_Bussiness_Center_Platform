import React, { useState, useEffect } from 'react'
import {
  Card,
  Select,
  Button,
  Space,
  Form,
  Input,
  Switch,
  InputNumber,
  DatePicker,
  Upload,
  Tag,
  Divider,
  Row,
  Col,
  Typography,
  Alert,
  Empty,
  Tooltip,
  Modal,
  message
} from 'antd'
import {
  AppstoreOutlined,
  SettingOutlined,
  PlusOutlined,
  EyeOutlined,
  RefreshOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { AttributeTemplate, AttributeTemplateItem, SPUAttribute } from '@/types/spu'
import { AttributeValidator } from '@/utils/attributeValidation'
import { attributeService } from '@/services/attributeService'

const { Option } = Select
const { TextArea } = Input
const { Text, Title } = Typography

interface SPUAttributeTemplateProps {
  categoryId?: string
  brandId?: string
  initialValues?: Record<string, any>
  onChange?: (attributes: SPUAttribute[]) => void
  onValidationChange?: (isValid: boolean, errors: string[]) => void
  readonly?: boolean
}

const SPUAttributeTemplate: React.FC<SPUAttributeTemplateProps> = ({
  categoryId,
  brandId,
  initialValues = {},
  onChange,
  onValidationChange,
  readonly = false
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<AttributeTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<AttributeTemplate | null>(null)
  const [templateVisible, setTemplateVisible] = useState(false)
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>(initialValues)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // 加载可用的属性模板
  const loadTemplates = async () => {
    if (!categoryId) return

    try {
      setLoading(true)
      const activeTemplates = await attributeService.getActiveTemplates()

      // 根据分类筛选模板
      const filteredTemplates = activeTemplates.filter(template =>
        !template.categoryId || template.categoryId === categoryId
      )

      setTemplates(filteredTemplates)
    } catch (error) {
      console.error('Load templates error:', error)
      message.error('加载属性模板失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [categoryId])

  // 处理模板选择
  const handleTemplateChange = async (templateId: string) => {
    try {
      if (!templateId) {
        setSelectedTemplate(null)
        setAttributeValues({})
        setValidationErrors([])
        onChange?.([])
        onValidationChange?.(true, [])
        return
      }

      const template = await attributeService.getTemplateById(templateId)
      setSelectedTemplate(template)

      // 初始化属性值
      const initialValues: Record<string, any> = {}
      template.attributes.forEach(attr => {
        if (attr.defaultValue !== undefined) {
          initialValues[attr.code] = attr.defaultValue
        }
      })

      setAttributeValues(initialValues)
      validateAndNotify(template.attributes, initialValues)
    } catch (error) {
      console.error('Load template error:', error)
      message.error('加载模板详情失败')
    }
  }

  // 验证属性值并通知
  const validateAndNotify = (attributes: AttributeTemplateItem[], values: Record<string, any>) => {
    const validationResults = AttributeValidator.validateAttributes(attributes, values)
    const errors = validationResults
      .filter(result => !result.isValid)
      .map(result => result.error!)

    setValidationErrors(errors)
    onValidationChange?.(errors.length === 0, errors)

    // 转换为SPUAttribute格式
    const spuAttributes: SPUAttribute[] = attributes
      .filter(attr => attr.status === 'active')
      .map(attr => ({
        id: attr.id,
        name: attr.name,
        value: values[attr.code] || null,
        type: attr.type,
        required: attr.required,
        editable: true,
        group: attr.group,
        category: attr.category,
        description: attr.description,
        validation: attr.validation
      }))

    onChange?.(spuAttributes)
  }

  // 处理属性值变更
  const handleAttributeValueChange = (attributeCode: string, value: any) => {
    const newValues = { ...attributeValues, [attributeCode]: value }
    setAttributeValues(newValues)

    if (selectedTemplate) {
      validateAndNotify(selectedTemplate.attributes, newValues)
    }
  }

  // 渲染属性编辑器
  const renderAttributeEditor = (attribute: AttributeTemplateItem) => {
    const value = attributeValues[attribute.code]
    const commonProps = {
      disabled: readonly,
      placeholder: `请输入${attribute.name}`,
      onChange: (val: any) => handleAttributeValueChange(attribute.code, val)
    }

    switch (attribute.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleAttributeValueChange(attribute.code, e.target.value)}
          />
        )

      case 'number':
        return (
          <InputNumber
            {...commonProps}
            value={value}
            style={{ width: '100%' }}
            min={attribute.validation?.min}
            max={attribute.validation?.max}
          />
        )

      case 'boolean':
        return (
          <Switch
            checked={value || false}
            onChange={(checked) => handleAttributeValueChange(attribute.code, checked)}
          />
        )

      case 'select':
        return (
          <Select
            {...commonProps}
            value={value}
            style={{ width: '100%' }}
            allowClear={!attribute.required}
          >
            {attribute.options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )

      case 'multiselect':
        return (
          <Select
            {...commonProps}
            value={value || []}
            mode="multiple"
            style={{ width: '100%' }}
            allowClear={!attribute.required}
          >
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
            value={value ? new Date(value) : null}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            onChange={(date) => handleAttributeValueChange(attribute.code, date?.format('YYYY-MM-DD'))}
          />
        )

      case 'url':
        return (
          <Input
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleAttributeValueChange(attribute.code, e.target.value)}
            addonBefore="http://"
          />
        )

      case 'image':
        return (
          <Upload
            {...commonProps}
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
            showUploadList={false}
          >
            {value ? (
              <img src={value} alt={attribute.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
        )

      case 'file':
        return (
          <Upload
            {...commonProps}
            beforeUpload={() => false}
            showUploadList={false}
          >
            <Button icon={<PlusOutlined />}>
              {value ? '重新选择' : '选择文件'}
            </Button>
          </Upload>
        )

      default:
        return (
          <TextArea
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleAttributeValueChange(attribute.code, e.target.value)}
            rows={2}
          />
        )
    }
  }

  // 按分组渲染属性
  const renderAttributesByGroup = () => {
    if (!selectedTemplate || selectedTemplate.attributes.length === 0) {
      return (
        <Empty
          description="暂无属性配置"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    }

    // 按分组组织属性
    const groupedAttributes = selectedTemplate.attributes
      .filter(attr => attr.status === 'active')
      .reduce((groups, attr) => {
        const group = attr.group || '默认属性'
        if (!groups[group]) {
          groups[group] = []
        }
        groups[group].push(attr)
        return groups
      }, {} as Record<string, AttributeTemplateItem[]>)

    return Object.entries(groupedAttributes).map(([groupName, attributes]) => (
      <Card
        key={groupName}
        size="small"
        title={
          <span>
            <SettingOutlined /> {groupName}
            <Tag size="small" style={{ marginLeft: 8 }}>
              {attributes.length}
            </Tag>
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          {attributes.map(attribute => (
            <Col key={attribute.id} xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={
                  <span>
                    {attribute.name}
                    {attribute.required && <Text type="danger"> *</Text>}
                    {attribute.description && (
                      <Tooltip title={attribute.description}>
                        <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                      </Tooltip>
                    )}
                  </span>
                }
                validateStatus={validationErrors.some(err => err.includes(attribute.name)) ? 'error' : ''}
                help={validationErrors.find(err => err.includes(attribute.name))}
              >
                {renderAttributeEditor(attribute)}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Card>
    ))
  }

  return (
    <div>
      <Card size="small" title="属性模板配置" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Text strong>选择属性模板：</Text>
              <Select
                style={{ width: 300 }}
                placeholder="请选择属性模板"
                allowClear
                loading={loading}
                value={selectedTemplate?.id}
                onChange={handleTemplateChange}
              >
                {templates.map(template => (
                  <Option key={template.id} value={template.id}>
                    <div>
                      <div>{template.name}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {template.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>

              <Button
                icon={<RefreshOutlined />}
                onClick={loadTemplates}
                loading={loading}
                title="刷新模板列表"
              />

              <Button
                icon={<EyeOutlined />}
                onClick={() => setTemplateVisible(true)}
                disabled={!selectedTemplate}
                title="查看模板详情"
              />
            </Space>
          </Col>

          <Col>
            <Button
              type="link"
              href="/attribute-templates"
              target="_blank"
              icon={<PlusOutlined />}
            >
              管理模板
            </Button>
          </Col>
        </Row>

        {selectedTemplate && (
          <Alert
            message={`已选择模板：${selectedTemplate.name}`}
            description={`包含 ${selectedTemplate.attributes.filter(attr => attr.status === 'active').length} 个有效属性`}
            type="info"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </Card>

      {/* 属性编辑区域 */}
      {selectedTemplate && (
        <Card size="small" title="属性配置">
          {renderAttributesByGroup()}

          {validationErrors.length > 0 && (
            <Alert
              message="属性验证失败"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      )}

      {/* 模板详情弹窗 */}
      <Modal
        title={
          <span>
            <AppstoreOutlined /> 模板详情 - {selectedTemplate?.name}
          </span>
        }
        open={templateVisible}
        onCancel={() => setTemplateVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTemplateVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <Card size="small" title="基础信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>模板编码：</Text> {selectedTemplate.code}
                </Col>
                <Col span={12}>
                  <Text strong>所属分类：</Text> {selectedTemplate.categoryName || '通用'}
                </Col>
                <Col span={12}>
                  <Text strong>属性数量：</Text> {selectedTemplate.attributes.length}
                </Col>
                <Col span={12}>
                  <Text strong>模板类型：</Text>
                  {selectedTemplate.isSystem ? (
                    <Tag color="blue">系统模板</Tag>
                  ) : (
                    <Tag color="default">自定义模板</Tag>
                  )}
                </Col>
              </Row>
              {selectedTemplate.description && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>描述：</Text>
                  <div style={{ marginTop: 4, color: '#666' }}>
                    {selectedTemplate.description}
                  </div>
                </div>
              )}
            </Card>

            <Card size="small" title="属性列表">
              {selectedTemplate.attributes.map((attr, index) => (
                <div key={attr.id}>
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
                    <Col span={4}>
                      <Text type="secondary">分组：</Text>
                      {attr.group || '默认'}
                    </Col>
                    <Col span={10}>
                      {attr.description && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {attr.description}
                        </Text>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SPUAttributeTemplate