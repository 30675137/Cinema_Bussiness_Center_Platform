/**
 * P003-inventory-query: 库存查询 React Hooks
 *
 * 使用 TanStack Query 封装库存相关的数据获取逻辑。
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import type { InventoryQueryParams } from '../types';

/** Query Keys */
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: InventoryQueryParams) => [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  categories: ['categories'] as const,
  stores: ['stores', 'accessible'] as const,
};

/**
 * 获取库存列表
 *
 * @param params 查询参数
 * @param enabled 是否启用查询
 */
export function useInventoryList(params: InventoryQueryParams, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryService.listInventory(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30秒内不重新获取
  });
}

/**
 * 获取库存详情
 *
 * @param id 库存记录ID
 * @param enabled 是否启用查询
 */
export function useInventoryDetail(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.detail(id!),
    queryFn: () => inventoryService.getInventoryDetail(id!),
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1分钟内不重新获取
  });
}

/**
 * 获取商品分类列表
 */
export function useCategories() {
  return useQuery({
    queryKey: inventoryKeys.categories,
    queryFn: () => inventoryService.listCategories(),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取（分类不常变化）
  });
}

/**
 * 获取可访问的门店列表
 */
export function useAccessibleStores() {
  return useQuery({
    queryKey: inventoryKeys.stores,
    queryFn: () => inventoryService.listAccessibleStores(),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  });
}
