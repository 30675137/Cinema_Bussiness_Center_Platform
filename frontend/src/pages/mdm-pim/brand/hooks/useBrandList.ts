import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '../services/brandService';
import type {
  Brand,
  BrandFilters,
  BrandPaginationResponse,
} from '../types/brand.types';
import { BrandStatus, BRAND_CONSTANTS } from '../types/brand.types';

// 临时定义ApiResponse类型以避免循环导入问题
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message: string;
  timestamp: string;
}

interface UseBrandListOptions {
  initialFilters?: BrandFilters;
  initialPageSize?: number;
  cacheTime?: number;
  staleTime?: number;
}

/**
 * 品牌列表管理Hook
 * 提供品牌列表的数据获取、筛选、分页、状态管理等功能
 */
export const useBrandList = (options: UseBrandListOptions = {}) => {
  const {
    initialFilters = {},
    initialPageSize = BRAND_CONSTANTS.DEFAULT_PAGE_SIZE,
    cacheTime = 5 * 60 * 1000, // 5分钟
    staleTime = 1 * 60 * 1000, // 1分钟
  } = options;

  // 状态管理
  const [filters, setFilters] = useState<BrandFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    current: BRAND_CONSTANTS.DEFAULT_PAGE,
    pageSize: initialPageSize,
  });

  const queryClient = useQueryClient();

  // 获取品牌列表
  const {
    data: brandListData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['brands', filters, pagination],
    queryFn: () => brandService.getBrands({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    }),
    staleTime,
    gcTime: cacheTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // 获取品牌列表数据 - brandService.getBrands直接返回后端响应
  const brands = brandListData?.data || [];
  const paginationData = brandListData?.pagination || {
    current: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  } as BrandPaginationResponse;

  // 更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<BrandFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
  }, []);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [initialFilters]);

  // 清除单个筛选条件
  const clearFilter = useCallback((filterKey: keyof BrandFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // 更新分页
  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // 跳转到指定页
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  // 更改每页大小
  const changePageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, current: 1 }));
  }, []);

  // 刷新数据
  const refresh = useCallback(() => {
    return refetch();
  }, [refetch]);

  // 品牌状态变更mutation
  const statusChangeMutation = useMutation({
    mutationFn: ({ id, status, reason }: {
      id: string;
      status: BrandStatus;
      reason?: string;
    }) => brandService.updateBrandStatus(id, { status, reason }),
    onSuccess: () => {
      // 刷新品牌列表数据
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('品牌状态变更失败:', error);
    },
  });

  // 批量操作mutation
  const batchOperationMutation = useMutation({
    mutationFn: ({ operation, brandIds }: {
      operation: 'enable' | 'disable' | 'delete';
      brandIds: string[];
    }) => brandService.batchOperate(operation, brandIds),
    onSuccess: () => {
      // 刷新品牌列表数据
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('批量操作失败:', error);
    },
  });

  // 执行品牌状态变更
  const changeBrandStatus = useCallback(async (
    brandId: string,
    newStatus: BrandStatus,
    reason?: string
  ) => {
    return statusChangeMutation.mutateAsync({ id: brandId, status: newStatus, reason });
  }, [statusChangeMutation]);

  // 执行批量启用
  const batchEnable = useCallback(async (brandIds: string[]) => {
    return batchOperationMutation.mutateAsync({ operation: 'enable', brandIds });
  }, [batchOperationMutation]);

  // 执行批量停用
  const batchDisable = useCallback(async (brandIds: string[]) => {
    return batchOperationMutation.mutateAsync({ operation: 'disable', brandIds });
  }, [batchOperationMutation]);

  // 执行批量删除
  const batchDelete = useCallback(async (brandIds: string[]) => {
    return batchOperationMutation.mutateAsync({ operation: 'delete', brandIds });
  }, [batchOperationMutation]);

  // 预加载下一页数据（可选的性能优化）
  const prefetchNextPage = useCallback(() => {
    if (paginationData.hasNext && !isFetching) {
      queryClient.prefetchQuery({
        queryKey: ['brands', filters, { ...pagination, current: pagination.current + 1 }],
        queryFn: () => brandService.getBrands({
          page: pagination.current + 1,
          pageSize: pagination.pageSize,
          ...filters,
        }),
        staleTime,
      });
    }
  }, [pagination, filters, isFetching, queryClient, staleTime, paginationData.hasNext]);

  // 获取统计信息
  const getStatistics = useCallback(() => {
    const total = brands.length;
    const enabled = brands.filter(brand => brand.status === 'enabled').length;
    const disabled = brands.filter(brand => brand.status === 'disabled').length;
    const draft = brands.filter(brand => brand.status === 'draft').length;

    return {
      total,
      enabled,
      disabled,
      draft,
      paginationTotal: paginationData.total,
    };
  }, [brands, paginationData.total]);

  return {
    // 数据
    brands,
    isLoading,
    error,
    isFetching,
    pagination: paginationData,
    statistics: getStatistics(),

    // 筛选相关
    filters,
    updateFilters,
    resetFilters,
    clearFilter,

    // 分页相关
    updatePagination,
    goToPage,
    changePageSize,

    // 操作相关
    refresh,
    refetch,
    prefetchNextPage,

    // 状态变更
    changeBrandStatus,
    isChangingStatus: statusChangeMutation.isPending,

    // 批量操作
    batchEnable,
    batchDisable,
    batchDelete,
    isBatchOperating: batchOperationMutation.isPending,

    // 其他状态
    hasFilters: Object.keys(filters).length > 0,
    isEmpty: brands.length === 0 && !isLoading,
    hasData: brands.length > 0,
  };
};

export default useBrandList;