/**
 * TanStack Query mutation hooks for Dictionary Type and Item operations
 *
 * Provides hooks for:
 * - Creating/updating/deleting dictionary types
 * - Creating/updating/deleting dictionary items
 * - Batch updating dictionary item sort order
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { attributeService } from '../services/attributeService';
import { dictionaryKeys } from '../types/attribute.types';
import type {
  DictionaryType,
  DictionaryItem,
  CreateDictionaryTypeRequest,
  UpdateDictionaryTypeRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
  BatchUpdateSortRequest,
} from '@/features/attribute-dictionary/types';

// ============================================================================
// Dictionary Type Mutations
// ============================================================================

/**
 * Hook to create a new dictionary type
 */
export function useCreateDictionaryTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation<DictionaryType, Error, CreateDictionaryTypeRequest>({
    mutationFn: async (data) => {
      const response = await attributeService.createDictionaryType(data);
      if (!response.success) {
        throw new Error(response.message || '创建字典类型失败');
      }
      return response.data;
    },
    onSuccess: () => {
      message.success('字典类型创建成功');
      // Invalidate dictionary types list to refetch
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.types() });
    },
    onError: (error) => {
      message.error(error.message || '创建字典类型失败');
    },
  });
}

/**
 * Hook to update an existing dictionary type
 */
export function useUpdateDictionaryTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DictionaryType,
    Error,
    { id: string; data: UpdateDictionaryTypeRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await attributeService.updateDictionaryType(id, data);
      if (!response.success) {
        throw new Error(response.message || '更新字典类型失败');
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      message.success('字典类型更新成功');
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.types() });
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.typeDetail(id) });
    },
    onError: (error) => {
      message.error(error.message || '更新字典类型失败');
    },
  });
}

/**
 * Hook to delete a dictionary type
 */
export function useDeleteDictionaryTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await attributeService.deleteDictionaryType(id);
      if (!response.success) {
        throw new Error(response.message || '删除字典类型失败');
      }
    },
    onSuccess: () => {
      message.success('字典类型删除成功');
      // Invalidate dictionary types list
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.types() });
    },
    onError: (error) => {
      message.error(error.message || '删除字典类型失败');
    },
  });
}

// ============================================================================
// Dictionary Item Mutations
// ============================================================================

/**
 * Hook to create a new dictionary item
 */
export function useCreateDictionaryItemMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DictionaryItem,
    Error,
    { typeId: string; data: Omit<CreateDictionaryItemRequest, 'typeId'> }
  >({
    mutationFn: async ({ typeId, data }) => {
      const response = await attributeService.createDictionaryItem(typeId, data);
      if (!response.success) {
        throw new Error(response.message || '创建字典项失败');
      }
      return response.data;
    },
    onSuccess: (_, { typeId }) => {
      message.success('字典项创建成功');
      // Invalidate items list for the type
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.items(typeId) });
      // Also invalidate type list to update itemCount
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.types() });
    },
    onError: (error) => {
      message.error(error.message || '创建字典项失败');
    },
  });
}

/**
 * Hook to update an existing dictionary item
 */
export function useUpdateDictionaryItemMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DictionaryItem,
    Error,
    { id: string; typeId: string; data: UpdateDictionaryItemRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await attributeService.updateDictionaryItem(id, data);
      if (!response.success) {
        throw new Error(response.message || '更新字典项失败');
      }
      return response.data;
    },
    onSuccess: (_, { typeId }) => {
      message.success('字典项更新成功');
      // Invalidate items list for the type
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.items(typeId) });
    },
    onError: (error) => {
      message.error(error.message || '更新字典项失败');
    },
  });
}

/**
 * Hook to delete a dictionary item
 */
export function useDeleteDictionaryItemMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; typeId: string }>({
    mutationFn: async ({ id }) => {
      const response = await attributeService.deleteDictionaryItem(id);
      if (!response.success) {
        throw new Error(response.message || '删除字典项失败');
      }
    },
    onSuccess: (_, { typeId }) => {
      message.success('字典项删除成功');
      // Invalidate items list for the type
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.items(typeId) });
      // Also invalidate type list to update itemCount
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.types() });
    },
    onError: (error) => {
      message.error(error.message || '删除字典项失败');
    },
  });
}

/**
 * Hook to batch update dictionary item sort order
 */
export function useBatchUpdateDictionaryItemSortMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { typeId: string; data: BatchUpdateSortRequest }>({
    mutationFn: async ({ data }) => {
      const response = await attributeService.batchUpdateDictionaryItemSort(data);
      if (!response.success) {
        throw new Error(response.message || '更新排序失败');
      }
    },
    onSuccess: (_, { typeId }) => {
      message.success('排序更新成功');
      // Invalidate items list for the type
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.items(typeId) });
    },
    onError: (error) => {
      message.error(error.message || '更新排序失败');
    },
  });
}

/**
 * Hook to toggle dictionary item status (enable/disable)
 */
export function useToggleDictionaryItemStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DictionaryItem,
    Error,
    { id: string; typeId: string; newStatus: 'active' | 'inactive' }
  >({
    mutationFn: async ({ id, newStatus }) => {
      const response = await attributeService.updateDictionaryItem(id, {
        status: newStatus,
      });
      if (!response.success) {
        throw new Error(response.message || '更新状态失败');
      }
      return response.data;
    },
    onSuccess: (_, { typeId, newStatus }) => {
      const statusText = newStatus === 'active' ? '启用' : '停用';
      message.success(`字典项${statusText}成功`);
      // Invalidate items list for the type
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.items(typeId) });
    },
    onError: (error) => {
      message.error(error.message || '更新状态失败');
    },
  });
}
