/**
 * 类目管理功能TanStack Query Hooks
 * 提供所有类目相关的查询hooks，遵循TanStack Query v5使用规范
 * 严格遵循项目宪章中的数据获取和缓存策略
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { categoryKeys } from '../queryKeys';
import { categoryService } from './categoryService';
import type {
  Category,
  CategoryTreeNode,
  AttributeTemplate,
  CategoryQueryParams,
  CategoryTreeResponse,
  CategoryListResponse,
  AttributeTemplateResponse
} from '../../../pages/mdm-pim/category/types/category.types';

// 默认查询配置
const DEFAULT_QUERY_OPTIONS: Partial<UseQueryOptions> = {
  staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
  gcTime: 10 * 60 * 1000,   // 10分钟后从内存中清理
  retry: 2,                 // 失败后重试2次
  refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
};

// 类目树查询配置
const TREE_QUERY_OPTIONS: UseQueryOptions<CategoryTreeResponse> = {
  ...DEFAULT_QUERY_OPTIONS,
  staleTime: 2 * 60 * 1000, // 类目树2分钟内被认为是新鲜的
  gcTime: 5 * 60 * 1000,    // 5分钟后从内存中清理
};

// 属性模板查询配置
const ATTRIBUTE_TEMPLATE_QUERY_OPTIONS: UseQueryOptions<AttributeTemplateResponse> = {
  ...DEFAULT_QUERY_OPTIONS,
  staleTime: 10 * 60 * 1000, // 属性模板10分钟内被认为是新鲜的
  gcTime: 15 * 60 * 1000,    // 15分钟后从内存中清理
};

/**
 * 获取类目树结构的Hook
 * @param keyword 搜索关键词（可选）
 * @param options 额外的查询选项
 */
export const useCategoryTreeQuery = (
  keyword?: string,
  options: Omit<UseQueryOptions<CategoryTreeResponse>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: keyword ? categoryKeys.search(keyword) : categoryKeys.tree(),
    queryFn: () => categoryService.getCategoryTree(keyword),
    ...TREE_QUERY_OPTIONS,
    ...options,
    enabled: options.enabled !== false, // 默认启用查询
  });
};

/**
 * 获取类目列表的Hook（支持分页和筛选）
 * @param params 查询参数
 * @param options 额外的查询选项
 */
export const useCategoriesQuery = (
  params: CategoryQueryParams = {},
  options: Omit<UseQueryOptions<CategoryListResponse>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getCategories(params),
    placeholderData: keepPreviousData, // 分页时保持上一页数据
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

/**
 * 获取类目详情的Hook
 * @param id 类目ID
 * @param options 额外的查询选项
 */
export const useCategoryQuery = (
  id: string,
  options: Omit<UseQueryOptions<Category>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await categoryService.getCategoryById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || '获取类目详情失败');
      }
      return response.data;
    },
    enabled: !!id && (options.enabled !== false), // 只有当ID存在时才启用查询
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

/**
 * 获取子类目列表的Hook
 * @param parentId 父类目ID
 * @param options 额外的查询选项
 */
export const useChildrenCategoriesQuery = (
  parentId: string,
  options: Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: categoryKeys.children(parentId),
    queryFn: async () => {
      const response = await categoryService.getChildrenCategories(parentId);
      if (!response.success) {
        throw new Error(response.message || '获取子类目失败');
      }
      return response.data;
    },
    enabled: !!parentId && (options.enabled !== false), // 只有当父类目ID存在时才启用查询
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

/**
 * 获取类目属性模板的Hook
 * @param categoryId 类目ID
 * @param options 额外的查询选项
 */
export const useAttributeTemplateQuery = (
  categoryId: string,
  options: Omit<UseQueryOptions<AttributeTemplate>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: async () => {
      const response = await categoryService.getAttributeTemplate(categoryId);
      if (!response.success || !response.data) {
        // 如果属性模板不存在，返回空模板而不是抛出错误
        return {
          id: '',
          categoryId,
          attributes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as AttributeTemplate;
      }
      return response.data;
    },
    enabled: !!categoryId && (options.enabled !== false), // 只有当类目ID存在时才启用查询
    ...ATTRIBUTE_TEMPLATE_QUERY_OPTIONS,
    ...options,
  });
};

/**
 * 搜索类目的Hook
 * @param keyword 搜索关键词
 * @param options 额外的查询选项
 */
export const useSearchCategoriesQuery = (
  keyword: string,
  options: Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: categoryKeys.search(keyword),
    queryFn: async () => {
      const response = await categoryService.searchCategories(keyword);
      if (!response.success || !response.data) {
        throw new Error(response.message || '搜索类目失败');
      }
      return response.data;
    },
    enabled: !!keyword && keyword.trim().length > 0 && (options.enabled !== false), // 只有当关键词不为空时才启用查询
    staleTime: 1 * 60 * 1000, // 搜索结果1分钟内被认为是新鲜的
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

/**
 * 获取类目树层级数据的Hook（支持无限滚动）
 * @param params 查询参数
 * @param options 额外的查询选项
 */
export const useCategoriesInfiniteQuery = (
  params: CategoryQueryParams = {},
  options: Omit<UseInfiniteQueryOptions<CategoryListResponse>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: categoryKeys.paginated(params.page || 1, params.pageSize || 20),
    queryFn: () => categoryService.getCategories(params),
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

// 预获取函数，用于数据预加载
export const categoryQueries = {
  // 预获取类目树
  prefetchCategoryTree: async (
    queryClient: any,
    keyword?: string,
    options?: any
  ) => {
    return queryClient.prefetchQuery({
      queryKey: keyword ? categoryKeys.search(keyword) : categoryKeys.tree(),
      queryFn: () => categoryService.getCategoryTree(keyword),
      ...TREE_QUERY_OPTIONS,
      ...options,
    });
  },

  // 预获取类目详情
  prefetchCategory: async (queryClient: any, id: string, options?: any) => {
    if (!id) return;

    return queryClient.prefetchQuery({
      queryKey: categoryKeys.detail(id),
      queryFn: async () => {
        const response = await categoryService.getCategoryById(id);
        if (!response.success || !response.data) {
          throw new Error(response.message || '获取类目详情失败');
        }
        return response.data;
      },
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    });
  },

  // 预获取属性模板
  prefetchAttributeTemplate: async (
    queryClient: any,
    categoryId: string,
    options?: any
  ) => {
    if (!categoryId) return;

    return queryClient.prefetchQuery({
      queryKey: categoryKeys.detail(categoryId),
      queryFn: async () => {
        const response = await categoryService.getAttributeTemplate(categoryId);
        if (!response.success || !response.data) {
          return {
            id: '',
            categoryId,
            attributes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as AttributeTemplate;
        }
        return response.data;
      },
      ...ATTRIBUTE_TEMPLATE_QUERY_OPTIONS,
      ...options,
    });
  },

  // 使类目树数据失效
  invalidateCategoryTree: (queryClient: any, options?: any) => {
    return queryClient.invalidateQueries({
      queryKey: categoryKeys.tree(),
      ...options,
    });
  },

  // 使特定类目数据失效
  invalidateCategory: (queryClient: any, categoryId: string, options?: any) => {
    return queryClient.invalidateQueries({
      queryKey: categoryKeys.detail(categoryId),
      ...options,
    });
  },

  // 使属性模板数据失效
  invalidateAttributeTemplate: (queryClient: any, categoryId: string, options?: any) => {
    return queryClient.invalidateQueries({
      queryKey: categoryKeys.detail(categoryId),
      ...options,
    });
  },

  // 使所有类目相关查询失效
  invalidateAllCategories: (queryClient: any, options?: any) => {
    return queryClient.invalidateQueries({
      queryKey: categoryKeys.all(),
      ...options,
    });
  },
};

export default categoryQueries;