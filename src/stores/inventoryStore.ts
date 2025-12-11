/**
 * 库存管理状态管理
 * 使用Zustand进行轻量级状态管理
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  InventoryLedger,
  InventoryLedgerFilters,
  SortParams,
  Pagination,
  LoadingState,
  ErrorState,
} from '@types/inventory';

// 库存台账状态接口
interface InventoryLedgerState {
  // 数据状态
  data: InventoryLedger[];
  total: number;
  currentData: InventoryLedger | null;

  // 查询状态
  filters: InventoryLedgerFilters;
  sort: SortParams;
  pagination: Pagination;

  // UI状态
  loading: LoadingState;
  error: ErrorState;

  // 选中状态
  selectedRows: string[];
  selectedRowKeys: React.Key[];

  // 操作状态
  isEditing: boolean;
  isDetailsVisible: boolean;

  // Actions
  setData: (data: InventoryLedger[], total?: number) => void;
  setCurrentData: (item: InventoryLedger | null) => void;
  updateFilters: (filters: Partial<InventoryLedgerFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: SortParams) => void;
  setPagination: (pagination: Partial<Pagination>) => void;
  setLoading: (loading: Partial<LoadingState>) => void;
  setError: (error: ErrorState) => void;
  clearError: () => void;
  setSelectedRows: (rows: string[], keys: React.Key[]) => void;
  clearSelection: () => void;
  setEditing: (editing: boolean) => void;
  setDetailsVisible: (visible: boolean) => void;
  reset: () => void;

  // 批量操作
  selectAll: () => void;
  selectNone: () => void;
  selectInvert: () => void;

  // 数据操作
  updateItem: (id: string, updates: Partial<InventoryLedger>) => void;
  removeItem: (id: string) => void;
  addItem: (item: InventoryLedger) => void;
}

// 初始状态
const initialState = {
  // 数据状态
  data: [],
  total: 0,
  currentData: null,

  // 查询状态
  filters: {},
  sort: {
    sortBy: 'lastUpdated',
    sortOrder: 'desc',
  },
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },

  // UI状态
  loading: {
    data: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: {
    hasError: false,
    message: '',
    code: '',
  },

  // 选中状态
  selectedRows: [],
  selectedRowKeys: [],

  // 操作状态
  isEditing: false,
  isDetailsVisible: false,
};

// 创建库存台账store
export const useInventoryStore = create<InventoryLedgerState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 设置数据
      setData: (data: InventoryLedger[], total?: number) => {
        set(
          (state) => ({
            data,
            total: total ?? data.length,
            pagination: {
              ...state.pagination,
              total: total ?? data.length,
            },
          }),
          false,
          'setData'
        );
      },

      // 设置当前数据
      setCurrentData: (item: InventoryLedger | null) => {
        set({ currentData: item }, false, 'setCurrentData');
      },

      // 更新筛选条件
      updateFilters: (filters: Partial<InventoryLedgerFilters>) => {
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, current: 1 }, // 重置到第一页
          }),
          false,
          'updateFilters'
        );
      },

      // 清除筛选条件
      clearFilters: () => {
        set(
          (state) => ({
            filters: {},
            pagination: { ...state.pagination, current: 1 },
          }),
          false,
          'clearFilters'
        );
      },

      // 设置排序
      setSort: (sort: SortParams) => {
        set({ sort }, false, 'setSort');
      },

      // 设置分页
      setPagination: (pagination: Partial<Pagination>) => {
        set(
          (state) => ({
            pagination: { ...state.pagination, ...pagination },
          }),
          false,
          'setPagination'
        );
      },

      // 设置加载状态
      setLoading: (loading: Partial<LoadingState>) => {
        set(
          (state) => ({
            loading: { ...state.loading, ...loading },
          }),
          false,
          'setLoading'
        );
      },

      // 设置错误状态
      setError: (error: ErrorState) => {
        set(
          (state) => ({
            error: { ...state.error, ...error },
            loading: { ...state.loading, data: false }, // 清除加载状态
          }),
          false,
          'setError'
        );
      },

      // 清除错误
      clearError: () => {
        set(
          (state) => ({
            error: { hasError: false, message: '', code: '' },
          }),
          false,
          'clearError'
        );
      },

      // 设置选中行
      setSelectedRows: (rows: string[], keys: React.Key[]) => {
        set(
          {
            selectedRows: rows,
            selectedRowKeys: keys,
          },
          false,
          'setSelectedRows'
        );
      },

      // 清除选中
      clearSelection: () => {
        set(
          {
            selectedRows: [],
            selectedRowKeys: [],
          },
          false,
          'clearSelection'
        );
      },

      // 设置编辑状态
      setEditing: (editing: boolean) => {
        set({ isEditing: editing }, false, 'setEditing');
      },

      // 设置详情显示状态
      setDetailsVisible: (visible: boolean) => {
        set({ isDetailsVisible: visible }, false, 'setDetailsVisible');
      },

      // 重置所有状态
      reset: () => {
        set(initialState, false, 'reset');
      },

      // 全选
      selectAll: () => {
        const { data } = get();
        const selectedRows = data.map(item => item.id);
        const selectedRowKeys = data.map(item => item.id);
        set(
          {
            selectedRows,
            selectedRowKeys,
          },
          false,
          'selectAll'
        );
      },

      // 全不选
      selectNone: () => {
        set(
          {
            selectedRows: [],
            selectedRowKeys: [],
          },
          false,
          'selectNone'
        );
      },

      // 反选
      selectInvert: () => {
        const { data, selectedRows } = get();
        const allIds = data.map(item => item.id);
        const newSelectedRows = allIds.filter(id => !selectedRows.includes(id));
        const selectedRowKeys = newSelectedRows;
        set(
          {
            selectedRows: newSelectedRows,
            selectedRowKeys,
          },
          false,
          'selectInvert'
        );
      },

      // 更新项目
      updateItem: (id: string, updates: Partial<InventoryLedger>) => {
        set(
          (state) => ({
            data: state.data.map(item =>
              item.id === id ? { ...item, ...updates } : item
            ),
            currentData:
              state.currentData?.id === id
                ? { ...state.currentData, ...updates }
                : state.currentData,
          }),
          false,
          'updateItem'
        );
      },

      // 删除项目
      removeItem: (id: string) => {
        set(
          (state) => ({
            data: state.data.filter(item => item.id !== id),
            total: state.total - 1,
            currentData: state.currentData?.id === id ? null : state.currentData,
            selectedRows: state.selectedRows.filter(rowId => rowId !== id),
            selectedRowKeys: state.selectedRowKeys.filter(key => key !== id),
          }),
          false,
          'removeItem'
        );
      },

      // 添加项目
      addItem: (item: InventoryLedger) => {
        set(
          (state) => ({
            data: [item, ...state.data],
            total: state.total + 1,
          }),
          false,
          'addItem'
        );
      },
    }),
    {
      name: 'inventory-store',
    }
  )
);

// 选择器hooks
export const useInventoryData = () => {
  return useInventoryStore(state => state.data);
};

export const useInventoryCurrentData = () => {
  return useInventoryStore(state => state.currentData);
};

export const useInventoryFilters = () => {
  return useInventoryStore(state => state.filters);
};

export const useInventorySort = () => {
  return useInventoryStore(state => state.sort);
};

export const useInventoryPagination = () => {
  return useInventoryStore(state => state.pagination);
};

export const useInventoryLoading = () => {
  return useInventoryStore(state => state.loading);
};

export const useInventoryError = () => {
  return useInventoryStore(state => state.error);
};

export const useInventorySelection = () => {
  return useInventoryStore(state => ({
    selectedRows: state.selectedRows,
    selectedRowKeys: state.selectedRowKeys,
    setSelectedRows: state.setSelectedRows,
    clearSelection: state.clearSelection,
    selectAll: state.selectAll,
    selectNone: state.selectNone,
    selectInvert: state.selectInvert,
  }));
};

export const useInventoryUIState = () => {
  return useInventoryStore(state => ({
    isEditing: state.isEditing,
    isDetailsVisible: state.isDetailsVisible,
    setEditing: state.setEditing,
    setDetailsVisible: state.setDetailsVisible,
  }));
};

export const useInventoryActions = () => {
  return useInventoryStore(state => ({
    setData: state.setData,
    setCurrentData: state.setCurrentData,
    updateFilters: state.updateFilters,
    clearFilters: state.clearFilters,
    setSort: state.setSort,
    setPagination: state.setPagination,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    updateItem: state.updateItem,
    removeItem: state.removeItem,
    addItem: state.addItem,
    reset: state.reset,
  }));
};

// 组合hooks
export const useInventoryTableState = () => {
  const data = useInventoryData();
  const loading = useInventoryLoading();
  const error = useInventoryError();
  const filters = useInventoryFilters();
  const sort = useInventorySort();
  const pagination = useInventoryPagination();
  const selection = useInventorySelection();
  const actions = useInventoryActions();

  return {
    data,
    loading,
    error,
    filters,
    sort,
    pagination,
    selection,
    actions,
  };
};

export const useInventoryDetailsState = () => {
  const currentData = useInventoryCurrentData();
  const uiState = useInventoryUIState();
  const loading = useInventoryLoading();
  const error = useInventoryError();

  return {
    currentData,
    isDetailsVisible: uiState.isDetailsVisible,
    isEditing: uiState.isEditing,
    loading,
    error,
    setDetailsVisible: uiState.setDetailsVisible,
    setEditing: uiState.setEditing,
  };
};

export default useInventoryStore;