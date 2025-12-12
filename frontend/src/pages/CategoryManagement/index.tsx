import React, { useState, useEffect } from 'react'
import { Card, Button, Space, Typography, Breadcrumb, Row, Col, message, Tabs } from 'antd'
import {
  FolderOutlined,
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import CategoryManager from '@/components/Category/CategoryManager'
import CategoryTree from '@/components/Category/CategoryTree'
import { Breadcrumb as CustomBreadcrumb } from '@/components/common'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types/spu'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface CategoryManagementProps {}

const CategoryManagementPage: React.FC<CategoryManagementProps> = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState('tree')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    level1: 0,
    level2: 0,
    level3: 0
  })

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: '系统管理', path: '/system' },
    { title: '分类管理' }
  ]

  // 加载分类数据
  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryService.getCategoryList({
        page: 1,
        pageSize: 1000 // 获取所有数据用于统计
      })

      if (response.success) {
        const categoriesData = response.data.list
        setCategories(categoriesData)

        // 计算统计数据
        const newStats = {
          total: categoriesData.length,
          active: categoriesData.filter(cat => cat.status === 'active').length,
          inactive: categoriesData.filter(cat => cat.status === 'inactive').length,
          level1: categoriesData.filter(cat => cat.level === 1).length,
          level2: categoriesData.filter(cat => cat.level === 2).length,
          level3: categoriesData.filter(cat => cat.level === 3).length
        }
        setStats(newStats)
      } else {
        message.error(response.message || '加载分类数据失败')
      }
    } catch (error) {
      console.error('Load categories error:', error)
      message.error('加载分类数据失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    loadCategories()
  }, [])

  // 处理添加分类
  const handleAddCategory = (parentId?: string) => {
    // 这里可以打开添加分类的弹窗
    message.info(`添加${parentId ? '子' : '根'}分类功能开发中...`)
  }

  // 处理编辑分类
  const handleEditCategory = (category: Category) => {
    // 这里可以打开编辑分类的弹窗
    message.info(`编辑分类 "${category.name}" 功能开发中...`)
  }

  // 处理删除分类
  const handleDeleteCategory = (categoryId: string) => {
    // 这里可以实现删除逻辑
    message.info(`删除分类功能开发中...`)
  }

  // 处理导出
  const handleExport = () => {
    message.info('导出功能开发中...')
  }

  // 处理刷新
  const handleRefresh = () => {
    loadCategories()
  }

  // 处理返回
  const handleBack = () => {
    navigate('/dashboard')
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
            <FolderOutlined /> 分类管理
          </Title>
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
            三级分类体系管理
          </div>
        </div>

        <Space>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => handleAddCategory()}
          >
            添加分类
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
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                总分类数
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {stats.active}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                启用分类
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {stats.level1}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                一级分类
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {stats.level2 + stats.level3}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                二三级分类
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <FolderOutlined />
                树形视图
              </span>
            }
            key="tree"
          >
            <div style={{ padding: '16px 0' }}>
              <CategoryTree
                categories={categories}
                mode="manage"
                onCategoryAdd={handleAddCategory}
                onCategoryEdit={handleEditCategory}
                onCategoryDelete={handleDeleteCategory}
                showActions={true}
                height={500}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                列表管理
              </span>
            }
            key="list"
          >
            <div style={{ padding: '16px 0' }}>
              <CategoryManager
                mode="manage"
                maxLevel={3}
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
              <Title level={4}>分类数据统计</Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="分类数量分布">
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text>总分类数:</Text>
                        <Text strong>{stats.total}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text>启用分类:</Text>
                        <Text strong style={{ color: '#52c41a' }}>{stats.active}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>停用分类:</Text>
                        <Text strong style={{ color: '#fa8c16' }}>{stats.inactive}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="层级分布">
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text>一级分类:</Text>
                        <Text strong>{stats.level1}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text>二级分类:</Text>
                        <Text strong>{stats.level2}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>三级分类:</Text>
                        <Text strong>{stats.level3}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>平均每级:</Text>
                        <Text strong>{(stats.total / 3).toFixed(1)}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default CategoryManagementPage