import React, { useState } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Spin,
  Modal,
  Tooltip,
  Popconfirm
} from 'antd'
import {
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PoweroffOutlined
} from '@ant-design/icons'
import type { Category } from '@/types/category'
import { useCategoryDetailQuery } from '@/hooks/api/useCategoryQuery'
import { useCategoryStore } from '@/stores/categoryStore'
import CategoryForm from './CategoryForm'
import { 
  useUpdateCategoryMutation, 
  useUpdateCategoryStatusMutation,
  useDeleteCategoryMutation 
} from '@/hooks/api/useCategoryMutation'
import { useQueryClient } from '@tanstack/react-query'
import { categoryKeys } from '@/services/queryKeys'

const { Title, Text } = Typography

interface CategoryDetailProps {
  categoryId?: string | null
  onEdit?: (category: Category) => void
  showEditButton?: boolean
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({
  categoryId,
  onEdit,
  showEditButton = true
}) => {
  const { selectedCategoryId, isEditing, setEditing, setSelectedCategoryId } = useCategoryStore()
  const effectiveCategoryId = categoryId || selectedCategoryId
  const queryClient = useQueryClient()

  const { data: category, isLoading, error } = useCategoryDetailQuery(
    effectiveCategoryId || '',
    !!effectiveCategoryId
  )

  const updateMutation = useUpdateCategoryMutation()
  const statusMutation = useUpdateCategoryStatusMutation()
  const deleteMutation = useDeleteCategoryMutation()
  
  const [statusModalVisible, setStatusModalVisible] = useState(false)

  // 处理编辑按钮点击
  const handleEditClick = () => {
    if (category) {
      setEditing(true)
      onEdit?.(category)
    }
  }

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditing(false)
  }

  // 处理保存编辑
  const handleSaveEdit = async (values: any) => {
    if (!category) return
    
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: values
      })
      setEditing(false)
    } catch (error) {
      console.error('Update category error:', error)
    }
  }

  // 处理状态切换
  const handleStatusToggle = () => {
    if (!category) return
    setStatusModalVisible(true)
  }

  // 确认状态切换
  const handleConfirmStatusChange = async () => {
    if (!category) return
    
    const newStatus = category.status === 'active' ? 'inactive' : 'active'
    try {
      await statusMutation.mutateAsync({
        id: category.id,
        status: newStatus
      })
      setStatusModalVisible(false)
    } catch (error) {
      console.error('Update status error:', error)
    }
  }

  // 处理删除
  const handleDelete = async () => {
    if (!category) return
    
    try {
      await deleteMutation.mutateAsync(category.id)
      // 删除成功后，清除选中状态并刷新树
      setSelectedCategoryId(null)
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() })
    } catch (error) {
      console.error('Delete category error:', error)
    }
  }

  if (!effectiveCategoryId) {
    return (
      <Card>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#999'
        }}>
          <Text type="secondary">请选择一个类目查看详情</Text>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px'
        }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (error || !category) {
    return (
      <Card>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#ff4d4f'
        }}>
          <CloseCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Text type="danger">加载类目详情失败</Text>
        </div>
      </Card>
    )
  }

  // 编辑模式：显示表单
  if (isEditing && category) {
    return (
      <CategoryForm
        mode="edit"
        initialValues={category}
        onSubmit={handleSaveEdit}
        onCancel={handleCancelEdit}
        loading={updateMutation.isPending}
      />
    )
  }

  // 格式化路径显示
  const formatPath = (path: string[]): string => {
    return path.length > 0 ? path.join(' / ') : '根类目'
  }

  // 格式化日期
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            类目详情
          </Title>
          {showEditButton && !isEditing && (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditClick}
                size="small"
              >
                编辑
              </Button>
              {category && (
                <>
                  <Button
                    icon={category.status === 'active' ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                    onClick={handleStatusToggle}
                    size="small"
                    loading={statusMutation.isPending}
                  >
                    {category.status === 'active' ? '停用' : '启用'}
                  </Button>
                  <Popconfirm
                    title="确认删除"
                    description={
                      category.spuCount > 0
                        ? '该类目已有 SPU 使用，不可删除'
                        : '删除后无法恢复，确定要删除该类目吗？'
                    }
                    onConfirm={handleDelete}
                    okText="确定"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    disabled={category.spuCount > 0}
                  >
                    <Tooltip
                      title={category.spuCount > 0 ? '该类目已有 SPU 使用，不可删除' : '删除类目'}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        disabled={category.spuCount > 0}
                        loading={deleteMutation.isPending}
                      >
                        删除
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </>
              )}
            </>
          )}
        </Space>
      }
      role="region"
      aria-label="类目详情信息"
      style={{ height: '100%' }}
    >
      <Descriptions
        column={1}
        bordered
        size="small"
        labelStyle={{
          width: '120px',
          backgroundColor: '#fafafa',
          fontWeight: 500
        }}
      >
        <Descriptions.Item label="类目名称">
          <Text strong>{category.name}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="类目编码">
          <Tag color="blue">{category.code}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="类目等级">
          <Tag color={category.level === 1 ? 'red' : category.level === 2 ? 'orange' : 'green'}>
            {category.level === 1 ? '一级类目' : category.level === 2 ? '二级类目' : '三级类目'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="上级类目">
          {category.parentName ? (
            <Text>{category.parentName}</Text>
          ) : (
            <Text type="secondary">无（一级类目）</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="类目路径">
          <Text code>{formatPath(category.path)}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="排序序号">
          <Text>{category.sortOrder}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="状态">
          {category.status === 'active' ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              启用
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              停用
            </Tag>
          )}
        </Descriptions.Item>

        {category.description && (
          <Descriptions.Item label="描述">
            <Text>{category.description}</Text>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="关联SPU数量">
          <Tag color={category.spuCount > 0 ? 'orange' : 'default'}>
            {category.spuCount} 个
          </Tag>
          {category.spuCount > 0 && (
            <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
              （该类目已被使用，不可删除）
            </Text>
          )}
        </Descriptions.Item>

        {category.attributeTemplateId && (
          <Descriptions.Item label="属性模板">
            <Tag color="purple">已配置</Tag>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
              ID: {category.attributeTemplateId}
            </Text>
          </Descriptions.Item>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Descriptions.Item label="创建时间">
          <Text type="secondary">{formatDate(category.createdAt)}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="更新时间">
          <Text type="secondary">{formatDate(category.updatedAt)}</Text>
        </Descriptions.Item>

        {category.createdBy && (
          <Descriptions.Item label="创建人">
            <Text type="secondary">{category.createdBy}</Text>
          </Descriptions.Item>
        )}

        {category.updatedBy && (
          <Descriptions.Item label="更新人">
            <Text type="secondary">{category.updatedBy}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* 状态切换确认对话框 */}
      <Modal
        title={category?.status === 'active' ? '确认停用类目' : '确认启用类目'}
        open={statusModalVisible}
        onOk={handleConfirmStatusChange}
        onCancel={() => setStatusModalVisible(false)}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ 
          danger: category?.status === 'active',
          loading: statusMutation.isPending 
        }}
      >
        {category?.status === 'active' ? (
          <div>
            <p>停用后，新增 SPU 时将无法选择该类目，已有 SPU 不受影响。</p>
            <p style={{ marginTop: 8, color: '#666' }}>
              确定要停用类目 <Text strong>"{category.name}"</Text> 吗？
            </p>
          </div>
        ) : (
          <div>
            <p>启用后，该类目将重新可用于新建 SPU。</p>
            <p style={{ marginTop: 8, color: '#666' }}>
              确定要启用类目 <Text strong>"{category.name}"</Text> 吗？
            </p>
          </div>
        )}
      </Modal>
    </Card>
  )
}

export default CategoryDetail

