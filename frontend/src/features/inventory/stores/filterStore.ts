import { create } from 'zustand';
import type { InventoryStatus } from '../types';

/**
 * 库存筛选状态接口
 */
export interface InventoryFilterState {
  /** 门店ID */
  storeId: string | undefined;
  /** 库存状态列表 (多选) */
  statuses: InventoryStatus[];
  /** 分类ID */
  categoryId: string | undefined;
  /** 设置门店ID */
  setStoreId: (storeId: string | undefined) => void;
  /** 设置库存状态 */
  setStatuses: (statuses: InventoryStatus[]) => void;
  /** 设置分类ID */
  setCategoryId: (categoryId: string | undefined) => void;
  /** 重置所有筛选条件 */
  resetFilters: () => void;
}

/**
 * 库存筛选状态 Zustand Store
 *
 * 用于管理库存查询页面的筛选条件状态。
 *
 * @example
 * ```tsx
 * const { storeId, statuses, setStoreId, resetFilters } = useFilterStore();
 * ```
 *
 * @since P003-inventory-query
 */
export const useFilterStore = create<InventoryFilterState>((set) => ({
  // 初始状态
  storeId: undefined,
  statuses: [],
  categoryId: undefined,

  // Actions
  setStoreId: (storeId) => set({ storeId }),

  setStatuses: (statuses) => set({ statuses }),

  setCategoryId: (categoryId) => set({ categoryId }),

  resetFilters: () =>
    set({
      storeId: undefined,
      statuses: [],
      categoryId: undefined,
    }),
}));

export default useFilterStore;
