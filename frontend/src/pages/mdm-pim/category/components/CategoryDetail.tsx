/**
 * 类目详情组件
 * 显示选中类目的详细信息，支持编辑模式切换
 * 集成状态管理、属性模板显示等功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  Empty,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

// 导入面包屑组件
import CategoryBreadcrumb from './CategoryBreadcrumb';
// 临时定义以避免模块导入问题
type CategoryLevel = 1 | 2 | 3;
type CategoryStatus = 'enabled' | 'disabled';
type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';
type Category = {
  id: string;
  name: string;
  code?: string;
  level: CategoryLevel;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};
type CreateCategoryRequest = {
  name: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
};
type UpdateCategoryRequest = {
  name?: string;
  sortOrder?: number;
  status?: CategoryStatus;
};
// import type { Category, CategoryStatus, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

// 组件导入
import CategoryForm from './CategoryForm';
import AttributeTemplate from './AttributeTemplate';

// Hooks和Store导入
import { useCategoryStore, useCategoryActions } from '../../../../stores/categoryStore';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '../../../../services/category/categoryMutations';
import { useAttributeTemplateQuery } from '../../../../services/category/categoryQueries';
import { useCategoryTreeQuery } from '../../../../services/category/categoryQueries';

// 工具函数导入
import { CategoryDeletionUtils, CategoryFormatUtils } from '../../../../utils/categoryUtils';

const { Option } = Select;

/**
 * CategoryDetail组件属性接口
 */
export interface CategoryDetailProps {
  /** 当前类目数据 */
  category?: Category;
  /** 是否加载中 */
  loading?: boolean;
  /** 更新回调 */
  onUpdate?: (category: Category) => void;
  /** 创建回调 */
  onCreate?: (category: Category) => void;
  /** 删除回调 */
  onDelete?: () => void;
  /** 刷新回调 */
  onRefresh?: () => void;
}

/**
 * 格式化状态显示
 */
const formatStatus = (status: CategoryStatus): { color: string; text: string } => {
  const statusMap = {
    enabled: { color: 'success', text: '启用' },
    disabled: { color: 'default', text: '停用' }
  };
  return statusMap[status];
};

/**
 * 格式化层级显示
 */
const formatLevel = (level: number): { color: string; text: string } => {
  const levelMap = {
    1: { color: 'blue', text: '一级类目' },
    2: { color: 'green', text: '二级类目' },
    3: { color: 'orange', text: '三级类目' }
  };
  return levelMap[level as keyof typeof levelMap] || { color: 'default', text: `第${level}级类目` };
};

/**
 * 类目详情组件
 */
const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  loading = false,
  onUpdate,
  onCreate,
  onDelete,
  onRefresh
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editingData, setEditingData] = useState<UpdateCategoryRequest>({});
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteValidation, setDeleteValidation] = useState<{
    canDelete: boolean;
    reasons: string[];
    warnings: string[];
  } | null>(null);
  const [deleteValidating, setDeleteValidating] = useState(false);
  const form = Form.useForm();

  // 状态管理
  const { startEditing, cancelEditing } = useCategoryActions();

  // Mutations
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  // 属性模板查询
  const { data: attributeTemplate } = useAttributeTemplateQuery(category?.id || '', {
    enabled: !!category?.id
  });

  // 类目树数据查询（用于删除验证）
  const { data: treeData } = useCategoryTreeQuery('', {
    enabled: deleteConfirmVisible // 只在需要验证删除时查询
  });

  // 同步编辑状态
  useEffect(() => {
    if (category) {
      setEditingData({
        name: category.name,
        sortOrder: category.sortOrder,
        status: category.status
      });
      setIsEditing(false); // 默认不处于编辑状态
    }
  }, [category]);

  // 错误处理
  useEffect(() => {
    if (createMutation.error) {
      message.error(createMutation.error.message);
    }
    if (updateMutation.error) {
      message.error(updateMutation.error.message);
    }
    if (deleteMutation.error) {
      message.error(deleteMutation.error.message);
    }
  }, [createMutation.error, updateMutation.error, deleteMutation.error]);

  /**
   * 开始编辑
   */
  const handleEdit = useCallback(() => {
    if (category) {
      startEditing(category.id);
      setIsEditing(true);
      form.setFieldsValue({
        name: category.name,
        sortOrder: category.sortOrder,
        status: category.status
      });
    }
  }, [category, startEditing, form]);

  /**
   * 取消编辑
   */
  const handleCancel = useCallback(() => {
    cancelEditing();
    setIsEditing(false);
    if (category) {
      setEditingData({
        name: category.name,
        sortOrder: category.sortOrder,
        status: category.status
      });
      form.setFieldsValue({
        name: category.name,
        sortOrder: category.sortOrder,
        status: category.status
      });
    }
  }, [category, cancelEditing, form]);

  /**
   * 保存编辑
   */
  const handleSave = useCallback(async () => {
    if (!category) return;

    try {
      const values = await form.validateFields();

      // 更新本地状态
      setEditingData(values);

      // 调用 API 更新
      await updateMutation.mutateAsync({
        id: category.id,
        data: values
      });

      setIsEditing(false);
      cancelEditing();

      // 返回更新后的类目数据
      const updatedCategory: Category = {
        ...category,
        ...values,
        updatedAt: new Date().toISOString()
      };

      onUpdate?.(updatedCategory);
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [category, form, updateMutation, cancelEditing, onUpdate]);

  /**
   * 验证是否可以删除
   */
  const validateDeletion = useCallback(async () => {
    if (!category || !treeData?.data) return;

    setDeleteValidating(true);
    try {
      // 将树结构转换为扁平列表
      const allCategories: Category[] = treeData.data.map((node: any) => ({
        id: node.id,
        name: node.name,
        code: node.code || '',
        level: node.level,
        parentId: node.parentId,
        sortOrder: node.sortOrder,
        status: node.status,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        createdBy: node.createdBy,
        updatedBy: node.updatedBy
      }));

      const validation = await CategoryDeletionUtils.canDeleteCategory(category, allCategories);
      setDeleteValidation(validation);

      if (validation.canDelete) {
        setDeleteConfirmVisible(true);
      } else {
        // 如果不能删除，显示原因
        Modal.error({
          title: '无法删除',
          content: (
            <div>
              <p>该类目无法删除，原因如下：</p>
              <ul style={{ paddingLeft: 20 }}>
                {validation.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          ),
          width: 500
        });
      }
    } catch (error) {
      console.error('删除验证失败:', error);
      message.error('验证删除条件失败，请稍后重试');
    } finally {
      setDeleteValidating(false);
    }
  }, [category, treeData]);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(async () => {
    if (!category) return;

    // 先进行验证
    validateDeletion();
  }, [category, validateDeletion]);

  /**
   * 确认删除
   */
  const confirmDelete = useCallback(async () => {
    if (!category) return;

    try {
      await deleteMutation.mutateAsync(category.id);
      setDeleteConfirmVisible(false);
      onDelete?.();
    } catch (error) {
      console.error('删除失败:', error);
    }
  }, [category, deleteMutation, onDelete]);

  /**
   * 取消删除
   */
  const cancelDelete = useCallback(() => {
    setDeleteConfirmVisible(false);
    setDeleteValidation(null);
  }, []);

  /**
   * 处理创建子类目
   */
  const handleCreateChild = useCallback(() => {
    setCreateFormVisible(true);
  }, []);

  /**
   * 处理子类目创建成功
   */
  const handleCreateSuccess = useCallback((newCategory: Category) => {
    setCreateFormVisible(false);
    onCreate?.(newCategory);
  }, [onCreate]);

  return (
    <div className="category-detail">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}>📋</div>
          <div style={{ color: '#666' }}>加载类目详情...</div>
        </div>
      ) : !category ? (
        <Empty
          description="请从左侧选择一个类目查看详情"
          style={{ padding: '60px 0' }}
        />
      ) : (
        <div>
          {/* 面包屑导航 */}
          <CategoryBreadcrumb categoryId={category?.id} categoryName={category?.name} />

          {/* 操作栏 */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {isEditing ? (
                <>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={updateMutation.isPending}
                  >
                    保存
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    取消
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    disabled={updateMutation.isPending}
                  >
                    编辑
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleCreateChild}
                    disabled={category.level >= 3}
                  >
                    {category.level < 3 ? '创建子类目' : '已达最大层级'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    loading={deleteValidating || deleteMutation.isPending}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteValidating ? '验证中...' : '删除'}
                  </Button>
                </>
              )}
            </Space>

            <Tooltip title="刷新数据">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => onRefresh?.()}
                disabled={loading}
              >
                刷新
              </Button>
            </Tooltip>
          </div>

          {/* 基本信息 */}
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                initialValues={editingData}
              >
                <Form.Item
                  label="类目名称"
                  name="name"
                  rules={[
                    { required: true, message: '请输入类目名称' },
                    { min: 2, message: '类目名称至少需要2个字符' },
                    { max: 50, message: '类目名称不能超过50个字符' }
                  ]}
                >
                  <Input placeholder="请输入类目名称" />
                </Form.Item>

                <Form.Item
                  label="排序序号"
                  name="sortOrder"
                  rules={[
                    { type: 'number', min: 0, message: '排序序号必须为非负整数' },
                    { type: 'number', max: 999999, message: '排序序号不能大于999999' }
                  ]}
                >
                  <InputNumber
                    placeholder="请输入排序序号"
                    style={{ width: '100%' }}
                    min={0}
                    max={999999}
                  />
                </Form.Item>

                <Form.Item
                  label="状态"
                  name="status"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态">
                    <Option value="enabled">启用</Option>
                    <Option value="disabled">停用</Option>
                  </Select>
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={2} bordered>
                <Descriptions.Item label="类目名称">
                  {category.name}
                </Descriptions.Item>
                <Descriptions.Item label="类目编码">
                  {category.code || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="类目层级">
                  <Tag color={formatLevel(category.level).color}>
                    {formatLevel(category.level).text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="父类目">
                  {category.parentId ? (
                    <span style={{ color: '#1890ff', cursor: 'pointer' }}>
                      {category.parentId} {/* TODO: 显示父类目名称 */}
                    </span>
                  ) : (
                    <span style={{ color: '#999' }}>无（根类目）</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="排序序号">
                  {category.sortOrder || 0}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={formatStatus(category.status).color}>
                    {formatStatus(category.status).text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(category.createdAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {new Date(category.updatedAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          {/* 属性模板 */}
          {category && (
            <AttributeTemplate
              categoryId={category.id}
              disabled={isEditing}
            />
          )}
        </div>
      )}

      {/* 创建子类目弹窗 */}
      <Modal
        title="创建子类目"
        open={createFormVisible}
        onCancel={() => setCreateFormVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        {category && (
          <CategoryForm
            mode="create"
            parentId={category.id}
            visible={createFormVisible}
            onCancel={() => setCreateFormVisible(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </Modal>

      {/* 删除确认弹窗 */}
      {category && deleteValidation && (
        <Modal
          title="删除确认"
          open={deleteConfirmVisible}
          onOk={confirmDelete}
          onCancel={cancelDelete}
          okText="确认删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          confirmLoading={deleteMutation.isPending}
          width={600}
        >
          <div>
            {/* 基本信息 */}
            <div style={{ marginBottom: 16 }}>
              <h4>类目信息</h4>
              <p><strong>名称：</strong>{category.name}</p>
              <p><strong>编码：</strong>{category.code || '-'}</p>
              <p><strong>层级：</strong>{CategoryFormatUtils.formatLevel(category.level)}</p>
            </div>

            {/* 警告信息 */}
            <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#fff2e8', border: '1px solid #ffbb96', borderRadius: '6px' }}>
              <p style={{ margin: 0, color: '#d46b08' }}>
                <strong>⚠️ 注意事项：</strong>
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#d46b08' }}>
                删除后将无法恢复，请谨慎操作！
              </p>
            </div>

            {/* 警告列表 */}
            {deleteValidation.warnings.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: '#fa8c16' }}>操作影响：</h4>
                <ul style={{ paddingLeft: 20, color: '#fa8c16' }}>
                  {deleteValidation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 确认输入 */}
            <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#262626' }}>
                确认要删除类目 "<span style={{ color: '#ff4d4f' }}>{category.name}</span>" 吗？
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CategoryDetail;