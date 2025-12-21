/**
 * 类目管理功能TanStack Query Mutations
 * 提供所有类目相关的变更操作hooks，遵循TanStack Query v5使用规范
 * 包含乐观更新、错误处理、缓存失效等最佳实践
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { categoryKeys } from '../queryKeys';
import { categoryService } from './categoryService';
import type {
  Category,
  CategoryAttribute,
  AttributeTemplate,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  SaveAttributeTemplateRequest,
  SuccessResponse
} from '../../../pages/mdm-pim/category/types/category.types';

// 默认变更配置
const DEFAULT_MUTATION_OPTIONS: Partial<UseMutationOptions> = {
  retry: 1, // 变更操作失败时重试1次
};

/**
 * 创建类目的Mutation Hook
 * @param options 额外的变更选项
 */
export const useCreateCategoryMutation = (
  options: Omit<UseMutationOptions<Category, Error, CreateCategoryRequest>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await categoryService.createCategory(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || '创建类目失败');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // 使类目树数据失效
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });

      // 使类目列表数据失效
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });

      // 如果有父类目，使父类目的子类目数据失效
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.children(variables.parentId) });
      }

      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('创建类目失败:', error);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 更新类目的Mutation Hook
 * @param options 额外的变更选项
 */
export const useUpdateCategoryMutation = (
  options: Omit<UseMutationOptions<Category, Error, { id: string; data: UpdateCategoryRequest }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryRequest }) => {
      const response = await categoryService.updateCategory(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || '更新类目失败');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // 取消所有进行中的相关查询
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: categoryKeys.tree() });

      // 获取当前类目数据的快照
      const previousCategory = queryClient.getQueryData(categoryKeys.detail(id));

      // 乐观更新类目数据
      queryClient.setQueryData(categoryKeys.detail(id), (old: Category | undefined) => {
        return old ? { ...old, ...data, updatedAt: new Date().toISOString() } : old;
      });

      // 返回包含快照的上下文
      return { previousCategory };
    },
    onError: (error, variables, context) => {
      // 如果有先前数据，恢复到之前的状态
      if (context?.previousCategory) {
        queryClient.setQueryData(categoryKeys.detail(variables.id), context.previousCategory);
      }

      console.error('更新类目失败:', error);
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // 使类目树数据失效（如果更新了名称或状态）
      if (variables.data.name || variables.data.status) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      }

      // 使类目列表数据失效
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });

      // 如果有父类目，使父类目的子类目数据失效
      const currentCategory = queryClient.getQueryData(categoryKeys.detail(variables.id)) as Category;
      if (currentCategory?.parentId) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.children(currentCategory.parentId) });
      }

      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 删除类目的Mutation Hook
 * @param options 额外的变更选项
 */
export const useDeleteCategoryMutation = (
  options: Omit<UseMutationOptions<SuccessResponse, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryService.deleteCategory(id);
      if (!response.success) {
        throw new Error(response.message || '删除类目失败');
      }
      return response;
    },
    onMutate: async (id) => {
      // 取消所有进行中的相关查询
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: categoryKeys.tree() });

      // 获取当前类目数据的快照
      const previousCategory = queryClient.getQueryData(categoryKeys.detail(id));

      // 乐观更新：从查询缓存中移除该类目
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });

      // 返回包含快照的上下文
      return { previousCategory };
    },
    onError: (error, id, context) => {
      // 如果有先前数据，恢复到之前的状态
      if (context?.previousCategory) {
        queryClient.setQueryData(categoryKeys.detail(id), context.previousCategory);
      }

      console.error('删除类目失败:', error);
      options.onError?.(error, id, context);
    },
    onSuccess: (data, id, context) => {
      // 使所有相关查询失效
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });

      // 调用用户提供的成功回调
      options.onSuccess?.(data, id, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 保存属性模板的Mutation Hook
 * @param options 额外的变更选项
 */
export const useSaveAttributeTemplateMutation = (
  options: Omit<UseMutationOptions<AttributeTemplate, Error, { categoryId: string; data: SaveAttributeTemplateRequest }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: string; data: SaveAttributeTemplateRequest }) => {
      const response = await categoryService.saveAttributeTemplate(categoryId, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || '保存属性模板失败');
      }
      return response.data;
    },
    onMutate: async ({ categoryId, data }) => {
      // 取消进行中的属性模板查询
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(categoryId) });

      // 获取当前属性模板数据的快照
      const previousTemplate = queryClient.getQueryData(categoryKeys.detail(categoryId));

      // 乐观更新属性模板数据
      queryClient.setQueryData(categoryKeys.detail(categoryId), (old: AttributeTemplate | undefined) => {
        if (!old) return old;

        return {
          ...old,
          attributes: data.attributes.map((attr, index) => ({
            ...attr,
            id: `temp-${Date.now()}-${index}`, // 临时ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
          updatedAt: new Date().toISOString(),
        };
      });

      // 返回包含快照的上下文
      return { previousTemplate };
    },
    onError: (error, variables, context) => {
      // 如果有先前数据，恢复到之前的状态
      if (context?.previousTemplate) {
        queryClient.setQueryData(categoryKeys.detail(variables.categoryId), context.previousTemplate);
      }

      console.error('保存属性模板失败:', error);
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // 更新属性模板缓存
      queryClient.setQueryData(categoryKeys.detail(variables.categoryId), data);

      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 新增属性的Mutation Hook
 * @param options 额外的变更选项
 */
export const useAddAttributeMutation = (
  options: Omit<UseMutationOptions<CategoryAttribute, Error, { categoryId: string; data: CreateAttributeRequest }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: string; data: CreateAttributeRequest }) => {
      const response = await categoryService.addAttribute(categoryId, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || '新增属性失败');
      }
      return response.data;
    },
    onMutate: async ({ categoryId, data }) => {
      // 取消进行中的属性模板查询
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(categoryId) });

      // 获取当前属性模板数据的快照
      const previousTemplate = queryClient.getQueryData(categoryKeys.detail(categoryId));

      // 乐观更新：添加新属性到模板
      queryClient.setQueryData(categoryKeys.detail(categoryId), (old: AttributeTemplate | undefined) => {
        if (!old) return old;

        const newAttribute: CategoryAttribute = {
          id: `temp-${Date.now()}`, // 临时ID
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          attributes: [...old.attributes, newAttribute],
          updatedAt: new Date().toISOString(),
        };
      });

      // 返回包含快照的上下文
      return { previousTemplate };
    },
    onError: (error, variables, context) => {
      // 如果有先前数据，恢复到之前的状态
      if (context?.previousTemplate) {
        queryClient.setQueryData(categoryKeys.detail(variables.categoryId), context.previousTemplate);
      }

      console.error('新增属性失败:', error);
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // 更新属性模板缓存
      queryClient.setQueryData(categoryKeys.detail(variables.categoryId), (old: AttributeTemplate | undefined) => {
        if (!old) return old;

        return {
          ...old,
          attributes: old.attributes.map(attr =>
            attr.id.startsWith('temp-') ? data : attr
          ),
          updatedAt: new Date().toISOString(),
        };
      });

      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 更新属性的Mutation Hook
 * @param options 额外的变更选项
 */
export const useUpdateAttributeMutation = (
  options: Omit<UseMutationOptions<CategoryAttribute, Error, { categoryId: string; attributeId: string; data: UpdateAttributeRequest }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, attributeId, data }: { categoryId: string; attributeId: string; data: UpdateAttributeRequest }) => {
      const response = await categoryService.updateAttribute(categoryId, attributeId, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || '更新属性失败');
      }
      return response.data;
    },
    onMutate: async ({ categoryId, attributeId, data }) => {
      // 取消进行中的属性模板查询
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(categoryId) });

      // 获取当前属性模板数据的快照
      const previousTemplate = queryClient.getQueryData(categoryKeys.detail(categoryId));

      // 乐观更新：更新模板中的属性
      queryClient.setQueryData(categoryKeys.detail(categoryId), (old: AttributeTemplate | undefined) => {
        if (!old) return old;

        return {
          ...old,
          attributes: old.attributes.map(attr =>
            attr.id === attributeId ? { ...attr, ...data, updatedAt: new Date().toISOString() } : attr
          ),
          updatedAt: new Date().toISOString(),
        };
      });

      // 返回包含快照的上下文
      return { previousTemplate };
    },
    onError: (error, variables, context) => {
      // 如果有先前数据，恢复到之前的状态
      if (context?.previousTemplate) {
        queryClient.setQueryData(categoryKeys.detail(variables.categoryId), context.previousTemplate);
      }

      console.error('更新属性失败:', error);
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // 更新属性模板缓存
      queryClient.setQueryData(categoryKeys.detail(variables.categoryId), (old: AttributeTemplate | undefined) => {
        if (!old) return old;

        return {
          ...old,
          attributes: old.attributes.map(attr =>
            attr.id === variables.attributeId ? data : attr
          ),
          updatedAt: new Date().toISOString(),
        };
      });

      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 删除属性的Mutation Hook
 * @param options 额外的变更选项
 */
export const useDeleteAttributeMutation = (
  options: Omit<UseMutationOptions<SuccessResponse, Error, { categoryId: string; attributeId: string }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, attributeId }: { categoryId: string; attributeId: string }) => {
      const response = await categoryService.deleteAttribute(categoryId, attributeId);
      if (!response.success) {
        throw new Error(response.message || '删除属性失败');
      }
      return response;
    },
    onMutate: async ({ categoryId, attributeId }) => {
      // 取消进行中的属性模板查询
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(categoryId) });

      // 获取当前属性模板数据的快照
      const previousTemplate = queryClient.getQueryData(categoryKeys.detail(categoryId));

      // 乐观更新：从模板中移除属性
      queryClient.setQueryData(categoryKeys.detail(categoryId), (old: AttributeTemplate | undefined) => {
        if (!old) return old;

        return {
          ...old,
          attributes: old.attributes.filter(attr => attr.id !== attributeId),
          updatedAt: new Date().toISOString(),
        };
      });

      // 返回包含快照的上下文
      return { previousTemplate };
    },
    onError: (error, variables, context) => {
      // 如果有先前数据，恢复到之前的状态
      if (context?.previousTemplate) {
        queryClient.setQueryData(categoryKeys.detail(variables.categoryId), context.previousTemplate);
      }

      console.error('删除属性失败:', error);
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

/**
 * 批量更新类目状态的Mutation Hook
 * @param options 额外的变更选项
 */
export const useBatchUpdateCategoryStatusMutation = (
  options: Omit<UseMutationOptions<Category[], Error, { ids: string[]; status: 'enabled' | 'disabled' }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: 'enabled' | 'disabled' }) => {
      const response = await categoryService.batchUpdateCategoryStatus(ids, status);
      if (!response.success || !response.data) {
        throw new Error(response.message || '批量更新状态失败');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // 使类目树数据失效
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });

      // 使类目列表数据失效
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });

      // 使涉及的类目详情数据失效
      variables.ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      });

      // 调用用户提供的成功回调
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('批量更新状态失败:', error);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
    ...DEFAULT_MUTATION_OPTIONS,
    ...options,
  });
};

export default {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useSaveAttributeTemplateMutation,
  useAddAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useBatchUpdateCategoryStatusMutation,
};