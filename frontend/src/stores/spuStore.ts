import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SPUItem, SPUFilters, PaginationInfo, SPUStatus } from '../types/spu';

interface SPUState {
  // 数据状态
  items: SPUItem[];
  selectedItem: SPUItem | null;

  // 加载状态
  loading: {
    list: boolean;
    detail: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  // 错误状态
  errors: {
    list?: string;
    detail?: string;
    create?: string;
    update?: string;
    delete?: string;
  };

  // 分页和筛选
  filters: SPUFilters;
  pagination: PaginationInfo;
  selectedRowKeys: string[];

  // 操作方法
  setItems: (items: SPUItem[]) => void;
  setSelectedItem: (item: SPUItem | null) => void;
  setLoading: (key: keyof typeof loading, value: boolean) => void;
  setError: (key: keyof typeof errors, error?: string) => void;
  setFilters: (filters: Partial<SPUFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<PaginationInfo>) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  clearSelectedRowKeys: () => void;

  // 数据操作
  addItem: (item: SPUItem) => void;
  updateItem: (id: string, updates: Partial<SPUItem>) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;

  // 重置状态
  reset: () => void;
}

const initialState = {
  items: [],
  selectedItem: null,
  loading: {
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false
  },
  errors: {},
  filters: {},
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  },
  selectedRowKeys: []
};

export const useSPUStore = create<SPUState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setItems: (items) => set({ items }),

      setSelectedItem: (selectedItem) => set({ selectedItem }),

      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value }
        })),

      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      clearFilters: () => set({ filters: {} }),

      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination }
        })),

      setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),

      clearSelectedRowKeys: () => set({ selectedRowKeys: [] }),

      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1
          }
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
          selectedItem:
            state.selectedItem?.id === id
              ? { ...state.selectedItem, ...updates }
              : state.selectedItem
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
          selectedItem:
            state.selectedItem?.id === id ? null : state.selectedItem,
          selectedRowKeys: state.selectedRowKeys.filter(key => key !== id),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1)
          }
        })),

      removeItems: (ids) =>
        set((state) => {
          const filteredItems = state.items.filter(item => !ids.includes(item.id));
          return {
            items: filteredItems,
            selectedItem:
              state.selectedItem && ids.includes(state.selectedItem.id)
                ? null
                : state.selectedItem,
            selectedRowKeys: state.selectedRowKeys.filter(key => !ids.includes(key)),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - ids.length)
            }
          };
        }),

      reset: () => set(initialState)
    }),
    {
      name: 'spu-store'
    }
  )
);