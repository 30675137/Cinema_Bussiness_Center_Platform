import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { attributeService } from '@/services/attributeService';
import { categoryKeys } from '@/services/queryKeys';
import type { CategoryAttribute, AttributeTemplate } from '@/types/category';

/**
 * 获取类目的属性模板 Query Hook
 */
export function useAttributeTemplateQuery(categoryId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: categoryKeys.attributeTemplates(categoryId || ''),
    queryFn: async () => {
      if (!categoryId) return null;
      const response = await attributeService.getAttributeTemplate(categoryId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '获取属性模板失败');
    },
    enabled: enabled && !!categoryId,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

/**
 * 保存属性模板 Mutation Hook
 */
export function useSaveAttributeTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      attributes,
    }: {
      categoryId: string;
      attributes: CategoryAttribute[];
    }) => {
      const response = await attributeService.saveAttributeTemplate(categoryId, attributes);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '保存属性模板失败');
    },
    onSuccess: (data, variables) => {
      message.success('属性模板保存成功');
      // 更新缓存
      queryClient.setQueryData(categoryKeys.attributeTemplates(variables.categoryId), data);
      // 使类目详情缓存失效，因为类目可能包含属性模板ID
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.categoryId) });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || '保存属性模板失败';
      message.error(errorMessage);
      console.error('Save attribute template error:', error);
    },
  });
}

/**
 * 添加属性到模板 Mutation Hook
 */
export function useAddAttributeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      attribute,
    }: {
      categoryId: string;
      attribute: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>;
    }) => {
      const response = await attributeService.addAttribute(
        categoryId,
        attribute as CategoryAttribute
      );
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '添加属性失败');
    },
    onSuccess: (data, variables) => {
      message.success('属性添加成功');
      // 更新缓存
      queryClient.setQueryData(categoryKeys.attributeTemplates(variables.categoryId), data);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || '添加属性失败';
      message.error(errorMessage);
      console.error('Add attribute error:', error);
    },
  });
}

/**
 * 更新属性 Mutation Hook
 */
export function useUpdateAttributeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      attributeId,
      attribute,
    }: {
      categoryId: string;
      attributeId: string;
      attribute: Partial<CategoryAttribute>;
    }) => {
      const response = await attributeService.updateAttribute(categoryId, attributeId, attribute);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '更新属性失败');
    },
    onSuccess: (data, variables) => {
      message.success('属性更新成功');
      // 更新缓存
      queryClient.setQueryData(categoryKeys.attributeTemplates(variables.categoryId), data);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || '更新属性失败';
      message.error(errorMessage);
      console.error('Update attribute error:', error);
    },
  });
}

/**
 * 删除属性 Mutation Hook
 */
export function useDeleteAttributeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      attributeId,
    }: {
      categoryId: string;
      attributeId: string;
    }) => {
      const response = await attributeService.deleteAttribute(categoryId, attributeId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || '删除属性失败');
    },
    onSuccess: (data, variables) => {
      message.success('属性删除成功');
      // 更新缓存
      queryClient.setQueryData(categoryKeys.attributeTemplates(variables.categoryId), data);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || '删除属性失败';
      message.error(errorMessage);
      console.error('Delete attribute error:', error);
    },
  });
}
