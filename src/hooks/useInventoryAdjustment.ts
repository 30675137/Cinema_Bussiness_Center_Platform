/**
 * 库存调整数据管理Hook
 * 提供库存调整的申请、审批、执行和查询功能
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  InventoryAdjustment,
  InventoryAdjustmentFilters,
  SortParams,
  Pagination,
  QueryParams,
} from '@/types/inventory';
import { inventoryMockService } from '@/services/inventoryMockData';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePermissions } from '@/hooks/usePermissions';

// 查询键常量
export const ADJUSTMENT_QUERY_KEY = 'inventory-adjustments';

// 默认分页配置
const DEFAULT_PAGINATION: Pagination = {
  current: 1,
  pageSize: 20,
  total: 0,
};

// 默认排序配置
const DEFAULT_SORT: SortParams = {
  sortBy: 'requestedAt',
  sortOrder: 'desc',
};

export const useInventoryAdjustment = (initialFilters?: InventoryAdjustmentFilters) => {
  const queryClient = useQueryClient();
  const { withErrorHandling, handleNetworkError, handleBusinessError } = useErrorHandling();
  const { canRead, canAdjust, canAdmin } = usePermissions();

  // 本地状态
  const [filters, setFilters] = useState<InventoryAdjustmentFilters>(
    initialFilters || {}
  );
  const [sort, setSort] = useState<SortParams>(DEFAULT_SORT);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

  // 构建查询参数
  const queryParams = useMemo((): QueryParams => {
    return {
      filters,
      sort,
      pagination,
    };
  }, [filters, sort, pagination]);

  // 获取调整数据
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [ADJUSTMENT_QUERY_KEY, queryParams],
    queryFn: () => {
      if (!canRead) {
        throw new Error('没有权限查看库存调整数据');
      }

      return inventoryMockService.getInventoryAdjustments(queryParams);
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
          handleBusinessError('没有权限访问库存调整数据', { action: 'get_adjustments' });
        } else if (error.message.includes('网络')) {
          handleNetworkError(error, { action: 'get_adjustments' });
        } else {
          handleBusinessError('获取库存调整数据失败', { action: 'get_adjustments', error });
        }
      }
    },
  });

  // 创建调整申请
  const createAdjustmentMutation = useMutation({
    mutationFn: async (adjustmentData: Omit<InventoryAdjustment,
      'id' | 'adjustmentNo' | 'requestedAt' | 'approvedAt' | 'completedAt' | 'approvedBy' | 'status'
    >) => {
      if (!canAdjust) {
        throw new Error('没有权限提交库存调整申请');
      }

      // 设置申请时间和状态
      const fullAdjustmentData: Omit<InventoryAdjustment,
        'id' | 'adjustmentNo' | 'approvedAt' | 'completedAt' | 'approvedBy'
      > = {
        ...adjustmentData,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      };

      return inventoryMockService.createAdjustment(fullAdjustmentData);
    },
    onSuccess: (data) => {
      message.success('调整申请提交成功');
      // 使查询失效，重新获取数据
      queryClient.invalidateQueries({ queryKey: [ADJUSTMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message.includes('权限')) {
          handleBusinessError('没有权限提交调整申请', { action: 'create_adjustment' });
        } else {
          handleBusinessError('提交调整申请失败', { action: 'create_adjustment', error });
        }
      }
    },
  });

  // 审批调整申请
  const approveAdjustmentMutation = useMutation({
    mutationFn: async ({
      id,
      approved,
      remark
    }: {
      id: string;
      approved: boolean;
      remark?: string
    }) => {
      if (!canAdmin) {
        throw new Error('没有权限审批库存调整申请');
      }

      return inventoryMockService.approveAdjustment(id, approved, remark);
    },
    onSuccess: (data, variables) => {
      const action = variables.approved ? '批准' : '拒绝';
      message.success(`调整申请${action}成功`);
      // 使查询失效，重新获取数据
      queryClient.invalidateQueries({ queryKey: [ADJUSTMENT_QUERY_KEY] });

      // 如果批准了调整，更新库存数据
      if (variables.approved) {
        queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message.includes('权限')) {
          handleBusinessError('没有权限审批调整申请', { action: 'approve_adjustment' });
        } else {
          handleBusinessError('审批调整申请失败', { action: 'approve_adjustment', error });
        }
      }
    },
  });

  // 执行调整
  const executeAdjustmentMutation = useMutation({
    mutationFn: async ({
      id,
      executedBy
    }: {
      id: string;
      executedBy: string;
    }) => {
      if (!canAdmin) {
        throw new Error('没有权限执行库存调整');
      }

      // 模拟执行调整
      return inventoryMockService.adjustStock(id, 0, '执行调整');
    },
    onSuccess: (data, variables) => {
      message.success('库存调整执行成功');
      // 更新调整状态
      queryClient.setQueriesData(
        { queryKey: [ADJUSTMENT_QUERY_KEY] },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((item: InventoryAdjustment) =>
                item.id === variables.id
                  ? { ...item, status: 'completed' as any, completedAt: new Date().toISOString() }
                  : item
              ),
            })),
          };
        }
      );

      // 更新库存数据
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message.includes('权限')) {
          handleBusinessError('没有权限执行库存调整', { action: 'execute_adjustment' });
        } else {
          handleBusinessError('执行库存调整失败', { action: 'execute_adjustment', error });
        }
      }
    },
  });

  // 更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<InventoryAdjustmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // 清除筛选条件
  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setFilters(initialFilters || {});
    setSort(DEFAULT_SORT);
    setPagination(DEFAULT_PAGINATION);
  }, [initialFilters]);

  // 更新排序
  const updateSort = useCallback((newSort: SortParams) => {
    setSort(newSort);
  }, []);

  // 更新分页
  const updatePagination = useCallback((newPagination: Partial<Pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
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
          pagination: { current: 1, pageSize: 10000 },
        };
        const response = await inventoryMockService.getInventoryAdjustments(exportParams);

        // 生成CSV内容
        const csvContent = inventoryMockService.generateCSV(
          ['ID', 'SKU', '商品名称', '仓库', '调整类型', '原始数量', '调整后数量', '调整数量', '申请时间', '申请状态', '申请人', '审批人', '完成时间', '原因'],
          response.data.map(item => [
            item.adjustmentNo || item.id,
            item.sku,
            item.productName,
            item.locationName,
            item.adjustmentType,
            item.originalQuantity.toString(),
            item.adjustedQuantity.toString(),
            item.adjustmentQuantity.toString(),
            item.requestedAt,
            item.status === 'pending' ? '待审批' :
            item.status === 'approved' ? '已批准' :
            item.status === 'rejected' ? '已拒绝' : '已完成',
            item.requestedBy,
            item.approvedBy || '',
            item.completedAt || '',
            item.reason || '',
          ])
        );

        // 下载文件
        const blob = new Blob(['\ufeff' + csvContent], {
          type: 'text/csv;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `库存调整记录_${new Date().toISOString().split('T')[0]}.csv`;
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
        context: { action: 'export_adjustments' },
      }
    );
  }, [filters, sort, withErrorHandling]);

  // 创建调整申请
  const createAdjustment = useCallback(async (
    adjustmentData: Omit<InventoryAdjustment,
      'id' | 'adjustmentNo' | 'requestedAt' | 'approvedAt' | 'completedAt' | 'approvedBy' | 'status'
    >
  ) => {
    return createAdjustmentMutation.mutateAsync(adjustmentData);
  }, [createAdjustmentMutation]);

  // 审批调整申请
  const approveAdjustment = useCallback(async (
    id: string,
    approved: boolean,
    remark?: string
  ) => {
    return approveAdjustmentMutation.mutateAsync({ id, approved, remark });
  }, [approveAdjustmentMutation]);

  // 执行调整
  const executeAdjustment = useCallback(async (
    id: string,
    executedBy: string
  ) => {
    return executeAdjustmentMutation.mutateAsync({ id, executedBy });
  }, [executeAdjustmentMutation]);

  // 获取统计信息
  const getStatistics = useCallback(() => {
    if (!queryData?.data) return null;

    const data = queryData.data;
    const totalApplications = data.length;
    const pendingApplications = data.filter(item => item.status === 'pending').length;
    const approvedApplications = data.filter(item => item.status === 'approved').length;
    const rejectedApplications = data.filter(item => item.status === 'rejected').length;
    const completedApplications = data.filter(item => item.status === 'completed').length;

    const totalAdjustmentQuantity = data.reduce((sum, item) => sum + Math.abs(item.adjustmentQuantity), 0);
    const positiveAdjustments = data.filter(item => item.adjustmentQuantity > 0).length;
    const negativeAdjustments = data.filter(item => item.adjustmentQuantity < 0).length;

    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      completedApplications,
      totalAdjustmentQuantity,
      positiveAdjustments,
      negativeAdjustments,
      pendingRate: totalApplications > 0 ? (pendingApplications / totalApplications * 100).toFixed(1) : '0',
      approvedRate: totalApplications > 0 ? (approvedApplications / totalApplications * 100).toFixed(1) : '0',
    };
  }, [queryData]);

  return {
    // 数据状态
    data: queryData?.data || [],
    total: queryData?.total || 0,
    isLoading: isLoading || isFetching,
    error: queryError,
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

    // 调整操作
    createAdjustment,
    approveAdjustment,
    executeAdjustment,

    // 操作状态
    isCreating: createAdjustmentMutation.isPending,
    isApproving: approveAdjustmentMutation.isPending,
    isExecuting: executeAdjustmentMutation.isPending,

    // 状态标识
    isEmpty: !isLoading && (!queryData?.data || queryData.data.length === 0),
    hasData: !!queryData?.data && queryData.data.length > 0,
    hasError: !!queryError,
  };
};

export default useInventoryAdjustment;