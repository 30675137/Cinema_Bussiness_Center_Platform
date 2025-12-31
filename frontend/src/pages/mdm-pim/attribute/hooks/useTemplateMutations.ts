/**
 * TanStack Query mutation hooks for Attribute Template and Attribute operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { attributeService } from '../services/attributeService';
import { attributeTemplateKeys } from '../types/attribute.types';
import type {
  AttributeTemplate,
  Attribute,
  CreateAttributeTemplateRequest,
  UpdateAttributeTemplateRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
} from '@/features/attribute-dictionary/types';

/**
 * Hook to create a new attribute template
 */
export function useCreateAttributeTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<AttributeTemplate, Error, CreateAttributeTemplateRequest>({
    mutationFn: async (data) => {
      const response = await attributeService.createAttributeTemplate(data);
      if (!response.success) {
        throw new Error(response.message || '创建属性模板失败');
      }
      return response.data;
    },
    onSuccess: () => {
      message.success('属性模板创建成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.lists() });
    },
    onError: (error) => {
      message.error(error.message || '创建属性模板失败');
    },
  });
}

/**
 * Hook to update an existing attribute template
 */
export function useUpdateAttributeTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    AttributeTemplate,
    Error,
    { id: string; data: UpdateAttributeTemplateRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await attributeService.updateAttributeTemplate(id, data);
      if (!response.success) {
        throw new Error(response.message || '更新属性模板失败');
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      message.success('属性模板更新成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.detail(id) });
    },
    onError: (error) => {
      message.error(error.message || '更新属性模板失败');
    },
  });
}

/**
 * Hook to delete an attribute template
 */
export function useDeleteAttributeTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await attributeService.deleteAttributeTemplate(id);
      if (!response.success) {
        throw new Error(response.message || '删除属性模板失败');
      }
    },
    onSuccess: () => {
      message.success('属性模板删除成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.lists() });
    },
    onError: (error) => {
      message.error(error.message || '删除属性模板失败');
    },
  });
}

/**
 * Hook to copy an attribute template
 */
export function useCopyAttributeTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    AttributeTemplate,
    Error,
    { sourceTemplateId: string; targetCategoryId: string; name?: string }
  >({
    mutationFn: async ({ sourceTemplateId, targetCategoryId, name }) => {
      const response = await attributeService.copyAttributeTemplate(sourceTemplateId, {
        targetCategoryId,
        name,
      });
      if (!response.success) {
        throw new Error(response.message || '复制属性模板失败');
      }
      return response.data;
    },
    onSuccess: () => {
      message.success('属性模板复制成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.lists() });
    },
    onError: (error) => {
      message.error(error.message || '复制属性模板失败');
    },
  });
}

/**
 * Hook to create a new attribute
 */
export function useCreateAttributeMutation() {
  const queryClient = useQueryClient();

  return useMutation<Attribute, Error, { templateId: string; data: CreateAttributeRequest }>({
    mutationFn: async ({ templateId, data }) => {
      const response = await attributeService.createAttribute(templateId, data);
      if (!response.success) {
        throw new Error(response.message || '创建属性失败');
      }
      return response.data;
    },
    onSuccess: (_, { templateId }) => {
      message.success('属性创建成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.attributes(templateId) });
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.detail(templateId) });
    },
    onError: (error) => {
      message.error(error.message || '创建属性失败');
    },
  });
}

/**
 * Hook to update an existing attribute
 */
export function useUpdateAttributeMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Attribute,
    Error,
    { id: string; templateId: string; data: UpdateAttributeRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await attributeService.updateAttribute(id, data);
      if (!response.success) {
        throw new Error(response.message || '更新属性失败');
      }
      return response.data;
    },
    onSuccess: (_, { templateId }) => {
      message.success('属性更新成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.attributes(templateId) });
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.detail(templateId) });
    },
    onError: (error) => {
      message.error(error.message || '更新属性失败');
    },
  });
}

/**
 * Hook to delete an attribute
 */
export function useDeleteAttributeMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; templateId: string }>({
    mutationFn: async ({ id }) => {
      const response = await attributeService.deleteAttribute(id);
      if (!response.success) {
        throw new Error(response.message || '删除属性失败');
      }
    },
    onSuccess: (_, { templateId }) => {
      message.success('属性删除成功');
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.attributes(templateId) });
      queryClient.invalidateQueries({ queryKey: attributeTemplateKeys.detail(templateId) });
    },
    onError: (error) => {
      message.error(error.message || '删除属性失败');
    },
  });
}
