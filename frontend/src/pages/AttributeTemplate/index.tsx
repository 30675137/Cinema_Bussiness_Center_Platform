import React, { useState, useEffect } from 'react'
import { Card, Button, Space, Typography, Breadcrumb, Row, Col, message, Tabs, Statistic, Input } from 'antd'
import {
  AppstoreOutlined,
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  SearchOutlined,
  FilterOutlined,
  CopyOutlined,
  DeleteOutlined,
  AppstoreAddOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AttributeTemplateManager from '@/components/Attribute/AttributeTemplate'
import AttributeEditor from '@/components/Attribute/AttributeEditor'
import { Breadcrumb as CustomBreadcrumb } from '@/components/common'
import { attributeService } from '@/services/attributeService'
import type { AttributeTemplate, AttributeTemplateItem } from '@/types/spu'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { Search } = Input

interface AttributeTemplateManagementProps {}

const AttributeTemplateManagementPage: React.FC<AttributeTemplateManagementProps> = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<AttributeTemplate[]>([])
  const [activeTab, setActiveTab] = useState('list')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    system: 0,
    custom: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<AttributeTemplate | null>(null)
  const [editorVisible, setEditorVisible] = useState(false)

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: '系统管理', path: '/system' },
    { title: '属性模板管理' }
  ]

  // 加载模板数据
  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await attributeService.getTemplateList({
        page: 1,
        pageSize: 1000 // 获取所有数据用于统计
      })

      if (response.list) {
        setTemplates(response.list)
      }
    } catch (error) {
      console.error('Load templates error:', error)
      message.error('加载属性模板数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const statsData = await attributeService.getTemplateStats()
      setStats(statsData)
    } catch (error) {
      console.error('Load stats error:', error)
    }
  }

  // 初始化
  useEffect(() => {
    loadTemplates()
    loadStats()
  }, [])

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  // 处理添加模板
  const handleAddTemplate = () => {
    setSelectedTemplate(null)
    setEditorVisible(true)
  }

  // 处理编辑模板
  const handleEditTemplate = (template: AttributeTemplate) => {
    setSelectedTemplate(template)
    setEditorVisible(true)
  }

  // 处理复制模板
  const handleCopyTemplate = async (template: AttributeTemplate) => {
    try {
      const response = await attributeService.copyTemplate(template.id)
      if (response.success) {
        message.success('复制模板成功')
        loadTemplates()
        loadStats()
      } else {
        message.error(response.message || '复制模板失败')
      }
    } catch (error) {
      console.error('Copy template error:', error)
      message.error('复制模板失败')
    }
  }

  // 处理删除模板
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await attributeService.deleteTemplate(templateId)
      if (response.success) {
        message.success('删除模板成功')
        loadTemplates()
        loadStats()
      } else {
        message.error(response.message || '删除模板失败')
      }
    } catch (error) {
      console.error('Delete template error:', error)
      message.error('删除模板失败')
    }
  }

  // 处理导出
  const handleExport = () => {
    message.info('导出功能开发中...')
  }

  // 处理刷新
  const handleRefresh = () => {
    loadTemplates()
    loadStats()
  }

  // 处理返回
  const handleBack = () => {
    navigate('/dashboard')
  }

  // 处理编辑器关闭
  const handleEditorClose = () => {
    setEditorVisible(false)
    setSelectedTemplate(null)
  }

  // 处理编辑器保存
  const handleEditorSave = async (templateData: any) => {
    try {
      if (selectedTemplate) {
        // 更新模板
        const response = await attributeService.updateTemplate(selectedTemplate.id, templateData)
        if (response.success) {
          message.success('更新模板成功')
          handleEditorClose()
          loadTemplates()
          loadStats()
        } else {
          message.error(response.message || '更新模板失败')
        }
      } else {
        // 创建模板
        const response = await attributeService.createTemplate(templateData)
        if (response.success) {
          message.success('创建模板成功')
          handleEditorClose()
          loadTemplates()
          loadStats()
        } else {
          message.error(response.message || '创建模板失败')
        }
      }
    } catch (error) {
      console.error('Save template error:', error)
      message.error('保存模板失败')
    }
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 页面标题和操作按钮 */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <AppstoreOutlined /> 属性模板管理
          </Title>
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
            商品属性模板配置和管理
          </div>
        </div>

        <Space>
          <Search
            placeholder="搜索模板名称、编码或描述"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchKeyword('')}
          />
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleAddTemplate}
          >
            新建模板
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
          <Button onClick={handleBack}>
            返回
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总模板数"
              value={stats.total}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="启用模板"
              value={stats.active}
              prefix={<AppstoreAddOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="停用模板"
              value={stats.inactive}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="系统模板"
              value={stats.system}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                模板管理
              </span>
            }
            key="list"
          >
            <div style={{ padding: '16px 0' }}>
              <AttributeTemplateManager
                mode="manage"
                showActions={true}
                height={500}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <EyeOutlined />
                数据统计
              </span>
            }
            key="stats"
          >
            <div style={{ padding: '32px' }}>
              <Title level={4}>属性模板数据统计</Title>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Card title="模板状态分布" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text>总模板数</Text>
                          <Text strong style={{ fontSize: '18px' }}>{stats.total}</Text>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#52c41a' }}>启用模板</Text>
                          <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>{stats.active}</Text>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#fa8c16' }}>停用模板</Text>
                          <Text strong style={{ fontSize: '18px', color: '#fa8c16' }}>{stats.inactive}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="模板类型分布" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text>系统模板</Text>
                          <Text strong style={{ fontSize: '18px', color: '#722ed1' }}>{stats.system}</Text>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text>自定义模板</Text>
                          <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>{stats.custom}</Text>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text>自定义比例</Text>
                          <Text strong style={{ fontSize: '18px' }}>
                            {stats.total > 0 ? Math.round((stats.custom / stats.total) * 100) : 0}%
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 32 }}>
                <Title level={5}>模板使用情况</Title>
                <Row gutter={[16, 16]}>
                  {templates.slice(0, 6).map(template => (
                    <Col xs={12} sm={8} md={6} lg={4} key={template.id}>
                      <Card
                        size="small"
                        hoverable
                        onClick={() => handleEditTemplate(template)}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                      >
                        <AppstoreOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{template.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                          {template.code}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {template.attributes.length} 个属性
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <span style={{
                            fontSize: '10px',
                            color: template.status === 'active' ? '#52c41a' : '#fa8c16'
                          }}>
                            ● {template.status === 'active' ? '启用' : '停用'}
                          </span>
                          {template.isSystem && (
                            <span style={{ fontSize: '10px', color: '#722ed1', marginLeft: 8 }}>
                              ● 系统
                            </span>
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FilterOutlined />
                属性编辑器
              </span>
            }
            key="editor"
          >
            <div style={{ padding: '16px 0' }}>
              <AttributeEditor
                attributes={selectedTemplate?.attributes || []}
                onChange={(attributes) => {
                  if (selectedTemplate) {
                    setSelectedTemplate({
                      ...selectedTemplate,
                      attributes
                    })
                  }
                }}
                readonly={false}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 属性模板编辑器弹窗 */}
      {editorVisible && (
        <Modal
          title={
            <span>
              <SettingOutlined /> {selectedTemplate ? '编辑属性模板' : '新建属性模板'}
            </span>
          }
          open={editorVisible}
          onCancel={handleEditorClose}
          footer={null}
          width={1200}
          destroyOnClose
        >
          {/* 这里可以放置详细的属性模板编辑表单 */}
          <div style={{ padding: '20px 0' }}>
            <Text>详细的属性模板编辑表单将在后续版本中实现</Text>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button onClick={handleEditorClose}>关闭</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AttributeTemplateManagementPage