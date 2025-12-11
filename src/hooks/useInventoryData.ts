/**
 * 库存数据管理Hook
 * 提供库存台账数据的获取、筛选、排序和状态管理
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  InventoryLedger,
  InventoryLedgerFilters,
  SortParams,
  Pagination,
  QueryParams,
} from '@types/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';
import { inventoryMockService } from '@/services/inventoryMockData';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePermissions } from '@/hooks/usePermissions';

// 查询键常量
export const INVENTORY_QUERY_KEY = 'inventory-ledger';

// 默认分页配置
const DEFAULT_PAGINATION: Pagination = {
  current: 1,
  pageSize: 20,
  total: 0,
};

// 默认排序配置
const DEFAULT_SORT: SortParams = {
  sortBy: 'lastUpdated',
  sortOrder: 'desc',
};

export const useInventoryData = (initialFilters?: InventoryLedgerFilters) => {
  const queryClient = useQueryClient();
  const { withErrorHandling, handleNetworkError, handleBusinessError } = useErrorHandling();
  const { canRead } = usePermissions();

  // Zustand store
  const {
    data: storeData,
    filters: storeFilters,
    sort: storeSort,
    pagination: storePagination,
    loading: storeLoading,
    error: storeError,
    setData,
    setFilters,
    setSort,
    setPagination,
    setLoading,
    setError,
    clearError,
  } = useInventoryStore();

  // 本地状态
  const [filters, setFiltersState] = useState<InventoryLedgerFilters>(
    initialFilters || storeFilters || {}
  );
  const [sort, setSortState] = useState<SortParams>(storeSort || DEFAULT_SORT);
  const [pagination, setPaginationState] = useState<Pagination>(
    storePagination || DEFAULT_PAGINATION
  );

  // 构建查询参数
  const queryParams = useMemo((): QueryParams => {
    return {
      filters,
      sort,
      pagination,
    };
  }, [filters, sort, pagination]);

  // 获取库存数据
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [INVENTORY_QUERY_KEY, queryParams],
    queryFn: () => {
      if (!canRead) {
        throw new Error('没有查看库存数据的权限');
      }

      return inventoryMockService.getInventoryLedger(queryParams);
    },
    enabled: canRead,
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('权限')) {
        return false; // 权限错误不重试
      }
      return failureCount < 3;
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message.includes('权限')) {
          handleBusinessError('没有权限访问库存数据', { action: 'get_inventory' });
        } else if (error.message.includes('网络')) {
          handleNetworkError(error, { action: 'get_inventory' });
        } else {
          handleBusinessError('获取库存数据失败', { action: 'get_inventory', error });
        }
      }
    },
  });

  // 同步状态到store
  useEffect(() => {
    if (queryData) {
      setData(queryData.data, queryData.total);
      setPagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: queryData.total,
      });
    }
  }, [queryData, setData, setPagination, pagination.current, pagination.pageSize]);

  // 同步筛选条件到store
  useEffect(() => {
    setFilters(filters);
  }, [filters, setFilters]);

  // 同步排序到store
  useEffect(() => {
    setSort(sort);
  }, [sort, setSort]);

  // 更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<InventoryLedgerFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, current: 1 })); // 重置到第一页
  }, []);

  // 清除筛选条件
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPaginationState(prev => ({ ...prev, current: 1 }));
  }, []);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters || {});
    setSortState(DEFAULT_SORT);
    setPaginationState(DEFAULT_PAGINATION);
  }, [initialFilters]);

  // 更新排序
  const updateSort = useCallback((newSort: SortParams) => {
    setSortState(newSort);
  }, []);

  // 更新分页
  const updatePagination = useCallback((newPagination: Partial<Pagination>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }));
  }, []);

  // 刷新数据
  const refreshData = useCallback(async () => {
    try {
      await refetch();
      message.success('数据刷新成功');
    } catch (error) {
      message.error('数据刷新失败');
    }
  }, [refetch]);

  // 导出数据
  const exportData = useCallback(async () => {
    return withErrorHandling(
      async () => {
        // 获取所有数据用于导出
        const exportParams: QueryParams = {
          filters,
          sort,
          pagination: { current: 1, pageSize: 10000 }, // 导出大量数据
        };
        const response = await inventoryMockService.getInventoryLedger(exportParams);

        // 生成CSV内容
        const csvContent = inventoryMockService.generateInventoryCSV(response.data);

        // 下载文件
        const blob = new Blob(['\ufeff' + csvContent], {
          type: 'text/csv;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `库存台账_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        message.success('数据导出成功');
        return true;
      },
      'data',
      {
        loadingMessage: '正在导出数据...',
        errorType: 'business' as const,
        errorSeverity: 'medium' as const,
        context: { action: 'export_inventory' },
      }
    );
  }, [filters, sort, withErrorHandling]);

  // 获取统计信息
  const getStatistics = useCallback(() => {
    if (!queryData?.data) return null;

    const data = queryData.data;
    const totalItems = data.length;
    const lowStockItems = data.filter(item => item.stockStatus === 'low').length;
    const outOfStockItems = data.filter(item => item.stockStatus === 'out_of_stock').length;
    const totalQuantity = data.reduce((sum, item) => sum + item.physicalQuantity, 0);
    const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalQuantity,
      totalValue,
      lowStockRate: totalItems > 0 ? (lowStockItems / totalItems * 100).toFixed(1) : '0',
      outOfStockRate: totalItems > 0 ? (outOfStockItems / totalItems * 100).toFixed(1) : '0',
    };
  }, [queryData]);

  // 搜索建议
  const getSearchSuggestions = useCallback((keyword: string) => {
    if (!keyword || !queryData?.data) return [];

    const lowerKeyword = keyword.toLowerCase();
    return queryData.data
      .filter(item =>
        item.sku.toLowerCase().includes(lowerKeyword) ||
        item.productName.toLowerCase().includes(lowerKeyword)
      )
      .slice(0, 10)
      .map(item => ({
        sku: item.sku,
        productName: item.productName,
        categoryName: item.categoryName,
      }));
  }, [queryData]);

  // 预取下一页数据
  const prefetchNextPage = useCallback(async () => {
    if (!queryData?.total || pagination.current * pagination.pageSize >= queryData.total) {
      return;
    }

    const nextPageParams: QueryParams = {
      filters,
      sort,
      pagination: {
        ...pagination,
        current: pagination.current + 1,
      },
    };

    queryClient.prefetchQuery({
      queryKey: [INVENTORY_QUERY_KEY, nextPageParams],
      queryFn: () => inventoryMockService.getInventoryLedger(nextPageParams),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryData, pagination, filters, sort, queryClient]);

  // 获取详细信息
  const getDetailById = useCallback((id: string) => {
    return queryData?.data?.find(item => item.id === id) || null;
  }, [queryData]);

  // 数据变换：按分组统计
  const getDataByGroup = useCallback((groupBy: 'category' | 'location' | 'status') => {
    if (!queryData?.data) return [];

    const groups = queryData.data.reduce((acc, item) => {
      let key = '';
      let name = '';

      switch (groupBy) {
        case 'category':
          key = item.categoryId;
          name = item.categoryName;
          break;
        case 'location':
          key = item.locationId;
          name = item.locationName;
          break;
        case 'status':
          key = item.stockStatus;
          name = item.stockStatus === 'low' ? '库存不足' :
                 item.stockStatus === 'out_of_stock' ? '缺货' :
                 item.stockStatus === 'high' ? '库存积压' : '正常';
          break;
      }

      if (!acc[key]) {
        acc[key] = {
          key,
          name,
          count: 0,
          totalQuantity: 0,
          totalValue: 0,
          items: [],
        };
      }

      acc[key].count++;
      acc[key].totalQuantity += item.physicalQuantity;
      acc[key].totalValue += item.totalValue;
      acc[key].items.push(item);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups);
  }, [queryData]);

  return {
    // 数据状态
    data: queryData?.data || [],
    total: queryData?.total || 0,
    isLoading: isLoading || isFetching,
    error: queryError || storeError,
    statistics: getStatistics(),

    // 筛选和排序
    filters,
    sort,
    pagination,
    updateFilters,
    clearFilters,
    resetFilters,
    updateSort,
    updatePagination,

    // 数据操作
    refreshData,
    exportData,
    refetch,

    // 工具函数
    getSearchSuggestions,
    getDetailById,
    getDataByGroup,
    prefetchNextPage,

    // 状态标识
    isEmpty: !isLoading && (!queryData?.data || queryData.data.length === 0),
    hasData: !!queryData?.data && queryData.data.length > 0,
    hasError: !!queryError || !!storeError,
  };
};

export default useInventoryData;