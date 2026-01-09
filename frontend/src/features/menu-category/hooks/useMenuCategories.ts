/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 TanStack Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMenuCategories,
  getMenuCategoryById,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  batchUpdateSortOrder,
  toggleCategoryVisibility,
} from '../services/menuCategoryService';
import type {
  MenuCategoryDTO,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  BatchUpdateSortOrderRequest,
  GetMenuCategoriesParams,
} from '../types';

// Query Keys
export const menuCategoryKeys = {
  all: ['menuCategories'] as const,
  lists: () => [...menuCategoryKeys.all, 'list'] as const,
  list: (params: GetMenuCategoriesParams) => [...menuCategoryKeys.lists(), params] as const,
  details: () => [...menuCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuCategoryKeys.details(), id] as const,
};

/**
 * 获取分类列表
 */
export function useMenuCategories(params: GetMenuCategoriesParams = {}) {
  return useQuery({
    queryKey: menuCategoryKeys.list(params),
    queryFn: () => getMenuCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

/**
 * 获取单个分类
 */
export function useMenuCategory(id: string) {
  return useQuery({
    queryKey: menuCategoryKeys.detail(id),
    queryFn: () => getMenuCategoryById(id),
    enabled: !!id,
  });
}

/**
 * 创建分类
 */
export function useCreateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMenuCategoryRequest) => createMenuCategory(request),
    onSuccess: () => {
      // 刷新分类列表
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.lists() });
    },
  });
}

/**
 * 更新分类
 */
export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateMenuCategoryRequest }) =>
      updateMenuCategory(id, request),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(menuCategoryKeys.detail(data.id), data);
      // 刷新分类列表
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.lists() });
    },
  });
}

/**
 * 删除分类
 */
export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, confirm }: { id: string; confirm: boolean }) =>
      deleteMenuCategory(id, confirm),
    onSuccess: (_, variables) => {
      // 移除缓存
      queryClient.removeQueries({
        queryKey: menuCategoryKeys.detail(variables.id),
      });
      // 刷新分类列表
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.lists() });
    },
  });
}

/**
 * 批量更新排序
 */
export function useBatchUpdateSortOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchUpdateSortOrderRequest) => batchUpdateSortOrder(request),
    onMutate: async (request) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: menuCategoryKeys.lists() });

      const previousData = queryClient.getQueryData<MenuCategoryDTO[]>(
        menuCategoryKeys.list({ includeHidden: true, includeProductCount: true })
      );

      if (previousData) {
        const newData = [...previousData];
        request.items.forEach((item) => {
          const index = newData.findIndex((c) => c.id === item.id);
          if (index !== -1) {
            newData[index] = { ...newData[index], sortOrder: item.sortOrder };
          }
        });
        // 按 sortOrder 排序
        newData.sort((a, b) => a.sortOrder - b.sortOrder);

        queryClient.setQueryData(
          menuCategoryKeys.list({ includeHidden: true, includeProductCount: true }),
          newData
        );
      }

      return { previousData };
    },
    onError: (_, __, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(
          menuCategoryKeys.list({ includeHidden: true, includeProductCount: true }),
          context.previousData
        );
      }
    },
    onSettled: () => {
      // 刷新分类列表
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.lists() });
    },
  });
}

/**
 * 切换可见性
 */
export function useToggleCategoryVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      toggleCategoryVisibility(id, isVisible),
    onMutate: async ({ id, isVisible }) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: menuCategoryKeys.lists() });

      const previousData = queryClient.getQueryData<MenuCategoryDTO[]>(
        menuCategoryKeys.list({ includeHidden: true, includeProductCount: true })
      );

      if (previousData) {
        const newData = previousData.map((category) =>
          category.id === id ? { ...category, isVisible } : category
        );
        queryClient.setQueryData(
          menuCategoryKeys.list({ includeHidden: true, includeProductCount: true }),
          newData
        );
      }

      return { previousData };
    },
    onError: (_, __, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(
          menuCategoryKeys.list({ includeHidden: true, includeProductCount: true }),
          context.previousData
        );
      }
    },
    onSettled: () => {
      // 刷新分类列表
      queryClient.invalidateQueries({ queryKey: menuCategoryKeys.lists() });
    },
  });
}
