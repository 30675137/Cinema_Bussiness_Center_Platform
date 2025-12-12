import React, { useState } from 'react'
import { Layout, Button, Space, Typography, Row, Col, message, Modal } from 'antd'
import {
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import CategoryTree from '@/components/Category/CategoryTree'
import CategoryDetail from '@/components/Category/CategoryDetail'
import CategoryForm from '@/components/Category/CategoryForm'
import AttributeTemplatePanel from '@/components/Category/AttributeTemplatePanel'
import { Breadcrumb as CustomBreadcrumb } from '@/components/common'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCreateCategoryMutation } from '@/hooks/api/useCategoryMutation'
import { useQueryClient } from '@tanstack/react-query'
import { categoryKeys } from '@/services/queryKeys'

const { Title } = Typography
const { Content } = Layout

interface CategoryManagementProps {}

const CategoryManagementPage: React.FC<CategoryManagementProps> = () => {
  const navigate = useNavigate()
  const { setSelectedCategoryId, reset, setEditing } = useCategoryStore()
  const queryClient = useQueryClient()
  
  // 创建类目相关状态
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [parentCategory, setParentCategory] = useState<Category | undefined>()
  
  const createMutation = useCreateCategoryMutation()

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: '基础设置', path: '/basic-settings' },
    { title: '类目管理' }
  ]

  // 处理添加类目
  const handleAddCategory = (parentId?: string) => {
    if (parentId) {
      // 从缓存中获取父类目信息
      const parent = queryClient.getQueryData<Category>(categoryKeys.detail(parentId))
      setParentCategory(parent)
    } else {
      setParentCategory(undefined)
    }
    setCreateModalVisible(true)
  }

  // 处理创建类目提交
  const handleCreateSubmit = async (values: CreateCategoryRequest) => {
    try {
      const response = await createMutation.mutateAsync(values)
      if (response.success && response.data) {
        setCreateModalVisible(false)
        setParentCategory(undefined)
        
        // 刷新树
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
        
        // 自动选中新创建的类目
        setSelectedCategoryId(response.data.id)
        
        message.success('类目创建成功')
      }
    } catch (error) {
      console.error('Create category error:', error)
    }
  }

  // 处理取消创建
  const handleCreateCancel = () => {
    setCreateModalVisible(false)
    setParentCategory(undefined)
  }

  // 处理编辑类目
  const handleEditCategory = (category: Category) => {
    setEditing(true)
  }

  // 处理删除类目
  const handleDeleteCategory = (categoryId: string) => {
    message.info('删除类目功能将在用户故事3中实现')
  }

  // 处理刷新
  const handleRefresh = () => {
    reset()
    setSelectedCategoryId(null)
    message.success('已刷新')
  }

  // 处理返回
  const handleBack = () => {
    navigate(-1)
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: 24 }}>
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
              <FolderOutlined /> 类目管理
            </Title>
            <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
              三级类目体系管理 - 浏览、查看、管理商品类目
            </div>
          </div>

          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => handleAddCategory()}
            >
              新增一级类目
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
            <Button onClick={handleBack}>
              返回
            </Button>
          </Space>
        </div>

        {/* 主要内容区域 - 左右分栏布局 */}
        <Row gutter={16} style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* 左侧：类目树 */}
          <Col xs={24} sm={24} md={10} lg={8} xl={8}>
            <CategoryTree
              mode="manage"
              onCategorySelect={(category) => {
                setSelectedCategoryId(category.id)
              }}
              onCategoryAdd={handleAddCategory}
              onCategoryEdit={handleEditCategory}
              onCategoryDelete={handleDeleteCategory}
              showSearch={true}
              showActions={true}
              height="100%"
            />
          </Col>

          {/* 右侧：类目详情和属性模板 */}
          <Col xs={24} sm={24} md={14} lg={16} xl={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              {/* 类目详情 */}
              <CategoryDetail
                onEdit={handleEditCategory}
                showEditButton={true}
              />
              
              {/* 属性模板配置 */}
              <AttributeTemplatePanel
                categoryId={selectedCategoryId}
              />
            </div>
          </Col>
        </Row>

        {/* 创建类目弹窗 */}
        <Modal
          title={parentCategory ? '新增子类目' : '新增一级类目'}
          open={createModalVisible}
          onCancel={handleCreateCancel}
          footer={null}
          width={600}
          destroyOnClose
        >
          <CategoryForm
            mode="create"
            parentCategory={parentCategory}
            onSubmit={handleCreateSubmit}
            onCancel={handleCreateCancel}
            loading={createMutation.isPending}
          />
        </Modal>
      </Content>
    </Layout>
  )
}

export default CategoryManagementPage