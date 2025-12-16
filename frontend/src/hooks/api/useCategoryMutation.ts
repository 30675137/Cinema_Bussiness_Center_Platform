import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { categoryService } from '@/services/categoryService';
import { categoryKeys } from '@/services/queryKeys';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

/**
 * 创建类目 Mutation Hook
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: (response) => {
      if (response.success) {
        message.success('类目创建成功');
        
        // 使树查询失效，触发重新获取
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
        queryClient.invalidateQueries({ queryKey: categoryKeys.all() });
        
        // 预取新创建的类目详情
        if (response.data) {
          queryClient.prefetchQuery({
            queryKey: categoryKeys.detail(response.data.id),
            queryFn: () => categoryService.getCategoryDetail(response.data.id),
          });
        }
      } else {
        message.error(response.message || '类目创建失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || '类目创建失败';
      message.error(errorMessage);
      console.error('Create category error:', error);
    },
  });
}

/**
 * 更新类目 Mutation Hook
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => 
      categoryService.updateCategory({ ...data, id }),
    onSuccess: (response) => {
      if (response.success) {
        message.success('类目更新成功');
        
        // 更新类目详情缓存
        if (response.data) {
          queryClient.setQueryData(categoryKeys.detail(response.data.id), response.data);
        }
        
        // 使树查询失效，触发重新获取
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
        queryClient.invalidateQueries({ queryKey: categoryKeys.all() });
      } else {
        message.error(response.message || '类目更新失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || '类目更新失败';
      message.error(errorMessage);
      console.error('Update category error:', error);
    },
  });
}

/**
 * 删除类目 Mutation Hook
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (response) => {
      if (response.success) {
        message.success('类目删除成功');
        
        // 移除类目详情缓存
        queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
        
        // 使树查询失效，触发重新获取
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
        queryClient.invalidateQueries({ queryKey: categoryKeys.all() });
      } else {
        message.error(response.message || '类目删除失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || '类目删除失败';
      message.error(errorMessage);
      console.error('Delete category error:', error);
    },
  });
}

/**
 * 更新类目状态 Mutation Hook
 */
export function useUpdateCategoryStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => 
      categoryService.updateCategoryStatus(id, status),
    onSuccess: (response) => {
      if (response.success) {
        const statusText = response.data.status === 'active' ? '启用' : '停用';
        message.success(`类目已${statusText}`);
        
        // 更新类目详情缓存
        if (response.data) {
          queryClient.setQueryData(categoryKeys.detail(response.data.id), response.data);
        }
        
        // 使树查询失效，触发重新获取
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      } else {
        message.error(response.message || '状态更新失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || '状态更新失败';
      message.error(errorMessage);
      console.error('Update category status error:', error);
    },
  });
}



