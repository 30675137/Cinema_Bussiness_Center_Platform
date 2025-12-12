/**
 * SKU Store
 * 管理SKU列表的UI状态（筛选、分页、排序、抽屉状态）
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SkuQueryParams, SkuStatus } from '@/types/sku';

/**
 * SKU Store状态接口
 */
export interface SkuStoreState {
  // 筛选条件
  filters: Partial<SkuQueryParams>;
  
  // 分页信息
  pagination: {
    page: number;
    pageSize: number;
  };
  
  // 排序信息
  sorting: {
    field?: string;
    order?: 'asc' | 'desc';
  };
  
  // 选中的SKU ID列表
  selectedSkuIds: string[];
  
  // 抽屉状态
  formDrawerOpen: boolean;
  formDrawerMode: 'create' | 'edit';
  formDrawerSkuId: string | null;
  
  detailDrawerOpen: boolean;
  detailDrawerSkuId: string | null;
  
  selectorModalOpen: boolean;
}

/**
 * SKU Store动作接口
 */
export interface SkuStoreActions {
  // 筛选操作
  setFilters: (filters: Partial<SkuQueryParams>) => void;
  updateFilter: (key: keyof SkuQueryParams, value: any) => void;
  clearFilters: () => void;
  
  // 分页操作
  setPagination: (pagination: { page?: number; pageSize?: number }) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // 排序操作
  setSorting: (sorting: { field?: string; order?: 'asc' | 'desc' }) => void;
  
  // 选择操作
  setSelectedSkuIds: (ids: string[]) => void;
  toggleSkuSelection: (id: string) => void;
  clearSelection: () => void;
  
  // 表单抽屉操作
  openFormDrawer: (mode: 'create' | 'edit', skuId?: string) => void;
  closeFormDrawer: () => void;
  
  // 详情抽屉操作
  openDetailDrawer: (skuId: string) => void;
  closeDetailDrawer: () => void;
  
  // 选择器弹窗操作
  openSelectorModal: () => void;
  closeSelectorModal: () => void;
  
  // 重置状态
  reset: () => void;
}

/**
 * SKU Store类型
 */
export type SkuStore = SkuStoreState & SkuStoreActions;

/**
 * 初始状态
 */
const initialState: SkuStoreState = {
  filters: {
    status: 'all',
    manageInventory: undefined,
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
  sorting: {
    field: 'createdAt',
    order: 'desc',
  },
  selectedSkuIds: [],
  formDrawerOpen: false,
  formDrawerMode: 'create',
  formDrawerSkuId: null,
  detailDrawerOpen: false,
  detailDrawerSkuId: null,
  selectorModalOpen: false,
};

/**
 * 创建SKU Store
 */
export const useSkuStore = create<SkuStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      // 确保所有状态都有默认值
      filters: initialState.filters || { status: 'all' },
      pagination: initialState.pagination || { page: 1, pageSize: 20 },
      sorting: initialState.sorting || { field: 'createdAt', order: 'desc' },
      
      // 筛选操作
      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...(state.filters || {}), ...(filters || {}) },
            pagination: { ...(state.pagination || {}), page: 1 }, // 重置到第一页
          }),
          false,
          'setFilters'
        ),
      
      updateFilter: (key, value) =>
        set(
          (state) => ({
            filters: { ...(state.filters || {}), [key]: value },
            pagination: { ...(state.pagination || {}), page: 1 }, // 重置到第一页
          }),
          false,
          'updateFilter'
        ),
      
      clearFilters: () =>
        set(
          (state) => ({
            filters: {
              status: 'all',
              manageInventory: undefined,
            },
            pagination: { ...state.pagination, page: 1 },
          }),
          false,
          'clearFilters'
        ),
      
      // 分页操作
      setPagination: (pagination) =>
        set(
          (state) => ({
            pagination: { ...(state.pagination || {}), ...(pagination || {}) },
          }),
          false,
          'setPagination'
        ),
      
      setPage: (page) =>
        set(
          (state) => ({
            pagination: { ...(state.pagination || {}), page },
          }),
          false,
          'setPage'
        ),
      
      setPageSize: (pageSize) =>
        set(
          (state) => ({
            pagination: { ...(state.pagination || {}), pageSize, page: 1 },
          }),
          false,
          'setPageSize'
        ),
      
      // 排序操作
      setSorting: (sorting) =>
        set(
          (state) => ({
            sorting: { ...(state.sorting || {}), ...(sorting || {}) },
          }),
          false,
          'setSorting'
        ),
      
      // 选择操作
      setSelectedSkuIds: (ids) =>
        set({ selectedSkuIds: ids }, false, 'setSelectedSkuIds'),
      
      toggleSkuSelection: (id) =>
        set(
          (state) => ({
            selectedSkuIds: state.selectedSkuIds.includes(id)
              ? state.selectedSkuIds.filter((sid) => sid !== id)
              : [...state.selectedSkuIds, id],
          }),
          false,
          'toggleSkuSelection'
        ),
      
      clearSelection: () =>
        set({ selectedSkuIds: [] }, false, 'clearSelection'),
      
      // 表单抽屉操作
      openFormDrawer: (mode, skuId) =>
        set(
          {
            formDrawerOpen: true,
            formDrawerMode: mode,
            formDrawerSkuId: skuId || null,
          },
          false,
          'openFormDrawer'
        ),
      
      closeFormDrawer: () =>
        set(
          {
            formDrawerOpen: false,
            formDrawerMode: 'create',
            formDrawerSkuId: null,
          },
          false,
          'closeFormDrawer'
        ),
      
      // 详情抽屉操作
      openDetailDrawer: (skuId) =>
        set(
          {
            detailDrawerOpen: true,
            detailDrawerSkuId: skuId,
          },
          false,
          'openDetailDrawer'
        ),
      
      closeDetailDrawer: () =>
        set(
          {
            detailDrawerOpen: false,
            detailDrawerSkuId: null,
          },
          false,
          'closeDetailDrawer'
        ),
      
      // 选择器弹窗操作
      openSelectorModal: () =>
        set({ selectorModalOpen: true }, false, 'openSelectorModal'),
      
      closeSelectorModal: () =>
        set({ selectorModalOpen: false }, false, 'closeSelectorModal'),
      
      // 重置状态
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'SkuStore' }
  )
);

