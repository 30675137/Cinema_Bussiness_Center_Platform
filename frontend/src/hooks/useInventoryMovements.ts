import { useQuery } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';
import type { InventoryQueryParams } from '@/types/inventory';

/**
 * 库存流水数据钩子
 * 用于获取和管理库存流水（交易历史）数据
 */
export const useInventoryMovements = (params?: Partial<InventoryQueryParams>) => {
  return useQuery({
    queryKey: ['inventory-movements', params],
    queryFn: () => inventoryService.getInventoryTransactions(params),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

/**
 * 单个流水详情钩子
 */
export const useMovementDetail = (transactionId?: string) => {
  return useQuery({
    queryKey: ['movement-detail', transactionId],
    queryFn: () => inventoryService.getInventoryTransaction(transactionId!),
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 按SKU获取流水记录
 */
export const useMovementsBySKU = (
  skuId: string,
  storeId?: string,
  params?: Partial<InventoryQueryParams>
) => {
  return useQuery({
    queryKey: ['movements-by-sku', skuId, storeId, params],
    queryFn: () =>
      inventoryService.getInventoryTransactions({
        ...params,
        skuId,
        storeId,
      }),
    enabled: !!skuId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * 按门店获取流水记录
 */
export const useMovementsByStore = (
  storeId: string,
  params?: Partial<InventoryQueryParams>
) => {
  return useQuery({
    queryKey: ['movements-by-store', storeId, params],
    queryFn: () =>
      inventoryService.getInventoryTransactions({
        ...params,
        storeId,
      }),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  });
};
