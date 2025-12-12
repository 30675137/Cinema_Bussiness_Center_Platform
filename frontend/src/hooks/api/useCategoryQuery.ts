import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { categoryKeys } from '@/services/queryKeys';
import type { Category, CategoryTree } from '@/types/category';

/**
 * 获取类目树（支持懒加载）
 * @param lazy 是否懒加载，默认 true（只返回一级类目）
 */
export function useCategoryTreeQuery(lazy: boolean = true) {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryService.getCategoryTree(lazy),
    staleTime: 5 * 60 * 1000, // 5分钟
    select: (response) => {
      if (response.success) {
        return response.data as CategoryTree[];
      }
      throw new Error(response.message);
    },
  });
}

/**
 * 获取类目详情
 * @param id 类目ID
 * @param enabled 是否启用查询
 */
export function useCategoryDetailQuery(id: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Category ID is required');
      return categoryService.getCategoryDetail(id);
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2分钟
    select: (response) => {
      if (response.success) {
        return response.data as Category;
      }
      throw new Error(response.message);
    },
  });
}

/**
 * 获取子类目列表（懒加载）
 * @param parentId 父类目ID
 * @param enabled 是否启用查询
 */
export function useCategoryChildrenQuery(parentId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: categoryKeys.children(parentId || ''),
    queryFn: () => {
      if (!parentId) throw new Error('Parent ID is required');
      return categoryService.getCategoryChildren(parentId);
    },
    enabled: enabled && !!parentId,
    staleTime: 5 * 60 * 1000, // 5分钟
    select: (response) => {
      if (response.success) {
        return response.data as Category[];
      }
      throw new Error(response.message);
    },
  });
}

/**
 * 搜索类目
 * @param keyword 搜索关键词
 * @param enabled 是否启用查询
 */
export function useCategorySearchQuery(keyword: string, enabled: boolean = true) {
  return useQuery({
    queryKey: categoryKeys.search(keyword),
    queryFn: () => categoryService.searchCategories(keyword),
    enabled: enabled && keyword.trim().length > 0,
    staleTime: 1 * 60 * 1000, // 1分钟
    select: (response) => {
      if (response.success) {
        return response.data as Category[];
      }
      throw new Error(response.message);
    },
  });
}

