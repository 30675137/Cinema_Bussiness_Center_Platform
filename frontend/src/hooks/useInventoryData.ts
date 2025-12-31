import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';
import type { CurrentInventory, InventoryQueryParams } from '@/types/inventory';
import { message } from 'antd';

/**
 * 库存台账数据钩子
 * 用于获取和管理库存台账数据
 */
export const useInventoryLedger = (params?: Partial<InventoryQueryParams>) => {
  return useQuery({
    queryKey: ['inventory-ledger', params],
    queryFn: () => inventoryService.getCurrentInventory(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

/**
 * 按SKU获取库存数据钩子
 */
export const useInventoryBySKU = (skuId?: string, storeId?: string) => {
  return useQuery({
    queryKey: ['inventory-by-sku', skuId, storeId],
    queryFn: () => inventoryService.getInventoryBySKU(skuId!, storeId),
    enabled: !!skuId,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

/**
 * 按门店获取库存数据钩子
 */
export const useInventoryByStore = (storeId: string, params?: Partial<InventoryQueryParams>) => {
  return useQuery({
    queryKey: ['inventory-by-store', storeId, params],
    queryFn: () => inventoryService.getInventoryByStore(storeId, params),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 库存统计数据钩子
 */
export const useInventoryStatistics = (params?: {
  storeIds?: string[];
  skuIds?: string[];
  dateRange?: [string, string];
}) => {
  return useQuery({
    queryKey: ['inventory-statistics', params],
    queryFn: () => inventoryService.getInventoryStatistics(params),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

/**
 * 批量获取库存数据钩子
 */
export const useBatchInventory = (skuIds: string[], storeIds?: string[]) => {
  return useQuery({
    queryKey: ['batch-inventory', skuIds, storeIds],
    queryFn: () => inventoryService.batchGetInventory(skuIds, storeIds),
    enabled: skuIds.length > 0,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * 更新库存钩子
 */
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CurrentInventory> }) =>
      inventoryService.updateInventory(id, data),
    onSuccess: () => {
      message.success('库存更新成功');
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-sku'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-store'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-statistics'] });
    },
    onError: (error: Error) => {
      message.error(`库存更新失败: ${error.message}`);
    },
  });
};

/**
 * 导出库存数据钩子
 */
export const useExportInventory = () => {
  return useMutation({
    mutationFn: (params: {
      format: 'excel' | 'csv';
      reportType: string;
      dateRange?: [string, string];
      storeIds?: string[];
      skuIds?: string[];
      categoryIds?: string[];
      includeZeroStock?: boolean;
      fields?: string[];
    }) => inventoryService.exportInventoryData(params),
    onMutate: () => {
      message.loading({ content: '正在导出数据...', key: 'export', duration: 0 });
    },
    onSuccess: (blob, variables) => {
      message.success({ content: '导出成功', key: 'export' });

      // 处理文件下载
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${new Date().toISOString().split('T')[0]}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: Error) => {
      message.error({ content: `导出失败: ${error.message}`, key: 'export' });
    },
  });
};

/**
 * 库存预警钩子
 */
export const useInventoryAlerts = (params?: {
  storeId?: string;
  skuId?: string;
  alertType?: string[];
  isEnabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['inventory-alerts', params],
    queryFn: () => inventoryService.getInventoryAlerts(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 库存趋势数据钩子
 */
export const useInventoryTrends = (params?: {
  dateRange: [string, string];
  storeIds?: string[];
  skuIds?: string[];
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['inventory-trends', params],
    queryFn: () => inventoryService.getInventoryTrends(params),
    enabled: !!params?.dateRange,
    staleTime: 30 * 60 * 1000, // 30分钟
  });
};
