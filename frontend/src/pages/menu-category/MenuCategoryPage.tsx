/**
 * @spec O002-miniapp-menu-config
 * 菜单分类管理页面
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Space, message, Typography, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  CategoryTable,
  CategoryForm,
  DeleteCategoryDialog,
} from '../../features/menu-category/components';
import {
  useMenuCategories,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useToggleCategoryVisibility,
} from '../../features/menu-category/hooks/useMenuCategories';
import type {
  MenuCategoryDTO,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  CategoryFormMode,
  DeleteCategoryData,
} from '../../features/menu-category/types';

const { Title } = Typography;

export const MenuCategoryPage: React.FC = () => {
  // 表单状态
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<CategoryFormMode>('create');
  const [editingCategory, setEditingCategory] = useState<MenuCategoryDTO | null>(null);

  // 删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<MenuCategoryDTO | null>(null);
  const [deletePreview, setDeletePreview] = useState<DeleteCategoryData | null>(null);

  // 可见性切换中的分类 ID
  const [toggleVisibilityId, setToggleVisibilityId] = useState<string | null>(null);

  // 数据查询
  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useMenuCategories({
    includeHidden: true,
    includeProductCount: true,
  });

  // Mutations
  const createMutation = useCreateMenuCategory();
  const updateMutation = useUpdateMenuCategory();
  const deleteMutation = useDeleteMenuCategory();
  const toggleVisibilityMutation = useToggleCategoryVisibility();

  // 打开创建表单
  const handleCreate = useCallback(() => {
    setFormMode('create');
    setEditingCategory(null);
    setFormOpen(true);
  }, []);

  // 打开编辑表单
  const handleEdit = useCallback((category: MenuCategoryDTO) => {
    setFormMode('edit');
    setEditingCategory(category);
    setFormOpen(true);
  }, []);

  // 关闭表单
  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingCategory(null);
  }, []);

  // 提交表单
  const handleFormSubmit = useCallback(
    async (data: CreateMenuCategoryRequest | UpdateMenuCategoryRequest) => {
      try {
        if (formMode === 'create') {
          await createMutation.mutateAsync(data as CreateMenuCategoryRequest);
          message.success('分类创建成功');
        } else if (editingCategory) {
          await updateMutation.mutateAsync({
            id: editingCategory.id,
            request: data as UpdateMenuCategoryRequest,
          });
          message.success('分类更新成功');
        }
        handleFormCancel();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败');
      }
    },
    [formMode, editingCategory, createMutation, updateMutation, handleFormCancel]
  );

  // 打开删除对话框
  const handleDelete = useCallback(async (category: MenuCategoryDTO) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);

    // 预览删除影响
    try {
      const preview = await deleteMutation.mutateAsync({
        id: category.id,
        confirm: false,
      });
      setDeletePreview(preview);
    } catch {
      // 如果获取预览失败，仍然允许删除
      setDeletePreview(null);
    }
  }, [deleteMutation]);

  // 确认删除
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingCategory) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingCategory.id,
        confirm: true,
      });
      message.success('分类删除成功');
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
      setDeletePreview(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  }, [deletingCategory, deleteMutation]);

  // 取消删除
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
    setDeletePreview(null);
  }, []);

  // 切换可见性
  const handleToggleVisibility = useCallback(
    async (id: string, isVisible: boolean) => {
      setToggleVisibilityId(id);
      try {
        await toggleVisibilityMutation.mutateAsync({ id, isVisible });
        message.success(isVisible ? '分类已显示' : '分类已隐藏');
      } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败');
      } finally {
        setToggleVisibilityId(null);
      }
    },
    [toggleVisibilityMutation]
  );

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            菜单分类管理
          </Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建分类
            </Button>
          </Space>
        </div>

        <Spin spinning={isLoading}>
          <CategoryTable
            data={categories}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
            toggleVisibilityLoading={toggleVisibilityId}
          />
        </Spin>
      </Card>

      {/* 创建/编辑表单 */}
      <CategoryForm
        open={formOpen}
        mode={formMode}
        initialData={editingCategory}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />

      {/* 删除确认对话框 */}
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        category={deletingCategory}
        deletePreview={deletePreview}
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default MenuCategoryPage;
