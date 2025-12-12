/**
 * Zustand基础Store
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 通用状态接口
export interface BaseState {
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// 分页状态接口
export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 搜索状态接口
export interface SearchState {
  keyword: string;
  filters: Record<string, any>;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

// CRUD状态接口
export interface CrudState<T> extends BaseState {
  items: T[];
  selectedItem: T | null;
  pagination: PaginationState;
  search: SearchState;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// 模态框状态接口
export interface ModalState {
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
  title: string;
  data: any;
}

// 基础Store动作
export interface BaseActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// 分页动作
export interface PaginationActions {
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
}

// 搜索动作
export interface SearchActions {
  setKeyword: (keyword: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  setSort: (field?: string, order?: 'ascend' | 'descend') => void;
  resetSearch: () => void;
}

// CRUD动作
export interface CrudActions<T> extends BaseActions, PaginationActions, SearchActions {
  setItems: (items: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  removeItem: (id: string) => void;
  setSelectedItem: (item: T | null) => void;
  setCreating: (isCreating: boolean) => void;
  setUpdating: (isUpdating: boolean) => void;
  setDeleting: (isDeleting: boolean) => void;
}

// 模态框动作
export interface ModalActions {
  openModal: (mode: 'create' | 'edit' | 'view', title?: string, data?: any) => void;
  closeModal: () => void;
  setModalData: (data: any) => void;
}

/**
 * 创建基础Store的工厂函数
 */
export function createStore<T>(
  name: string,
  initialData?: Partial<CrudState<T>>
) {
  // 初始状态
  const initialState: CrudState<T> = {
    // 基础状态
    loading: false,
    error: null,
    initialized: false,

    // 数据状态
    items: [],
    selectedItem: null,

    // 分页状态
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },

    // 搜索状态
    search: {
      keyword: '',
      filters: {},
      sortField: undefined,
      sortOrder: undefined,
    },

    // CRUD操作状态
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    ...initialData,
  };

  // 基础动作
  const baseActions: BaseActions = (set, get) => ({
    setLoading: (loading: boolean) => set({ loading }, false, 'setLoading'),
    setError: (error: string | null) => set({ error }, false, 'setError'),
    clearError: () => set({ error: null }, false, 'clearError'),
    reset: () => set(initialState, false, 'reset'),
  });

  // 分页动作
  const paginationActions: PaginationActions = (set, get) => ({
    setCurrentPage: (current: number) =>
      set((state) => ({
        pagination: { ...state.pagination, current }
      }), false, 'setCurrentPage'),

    setPageSize: (pageSize: number) =>
      set((state) => ({
        pagination: { ...state.pagination, pageSize, current: 1 }
      }), false, 'setPageSize'),

    setPagination: (pagination: Partial<PaginationState>) =>
      set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      }), false, 'setPagination'),
  });

  // 搜索动作
  const searchActions: SearchActions = (set, get) => ({
    setKeyword: (keyword: string) =>
      set((state) => ({
        search: { ...state.search, keyword }
      }), false, 'setKeyword'),

    setFilters: (filters: Record<string, any>) =>
      set((state) => ({
        search: { ...state.search, filters }
      }), false, 'setFilters'),

    updateFilter: (key: string, value: any) =>
      set((state) => ({
        search: {
          ...state.search,
          filters: { ...state.search.filters, [key]: value }
        }
      }), false, 'updateFilter'),

    clearFilters: () =>
      set((state) => ({
        search: { ...state.search, filters: {} }
      }), false, 'clearFilters'),

    setSort: (sortField?: string, sortOrder?: 'ascend' | 'descend') =>
      set((state) => ({
        search: { ...state.search, sortField, sortOrder }
      }), false, 'setSort'),

    resetSearch: () =>
      set((state) => ({
        search: {
          keyword: '',
          filters: {},
          sortField: undefined,
          sortOrder: undefined,
        }
      }), false, 'resetSearch'),
  });

  // CRUD动作
  const crudActions: CrudActions<T> = (set, get) => ({
    // 继承基础动作
    ...baseActions(set, get),
    ...paginationActions(set, get),
    ...searchActions(set, get),

    setItems: (items: T[]) =>
      set({ items }, false, 'setItems'),

    addItem: (item: T) =>
      set((state) => ({
        items: [...state.items, item]
      }), false, 'addItem'),

    updateItem: (id: string, updates: Partial<T>) =>
      set((state) => ({
        items: state.items.map((item: any) =>
          item.id === id ? { ...item, ...updates } : item
        )
      }), false, 'updateItem'),

    removeItem: (id: string) =>
      set((state) => ({
        items: state.items.filter((item: any) => item.id !== id),
        selectedItem: state.selectedItem && (state.selectedItem as any).id === id
          ? null
          : state.selectedItem
      }), false, 'removeItem'),

    setSelectedItem: (selectedItem: T | null) =>
      set({ selectedItem }, false, 'setSelectedItem'),

    setCreating: (isCreating: boolean) =>
      set({ isCreating }, false, 'setCreating'),

    setUpdating: (isUpdating: boolean) =>
      set({ isUpdating }, false, 'setUpdating'),

    setDeleting: (isDeleting: boolean) =>
      set({ isDeleting }, false, 'setDeleting'),
  });

  // 创建Store
  return create<CrudState<T> & CrudActions<T>>()(
    devtools(
      persist(
        (set, get) => ({
          ...initialState,
          ...crudActions(set, get),
          initialized: true,
        }),
        {
          name: `${name}-store`,
          partialize: (state) => ({
            // 只持久化部分状态
            search: state.search,
            pagination: state.pagination,
          }),
        }
      ),
      {
        name: `${name}-store`,
      }
    )
  );
}

/**
 * 创建模态框Store
 */
export function createModalStore(name: string, initialState?: Partial<ModalState>) {
  const initialModalState: ModalState = {
    visible: false,
    mode: 'create',
    title: '',
    data: null,
    ...initialState,
  };

  return create<ModalState & ModalActions>()(
    devtools(
      (set, get) => ({
        ...initialModalState,

        openModal: (mode: 'create' | 'edit' | 'view', title?: string, data?: any) =>
          set({
            visible: true,
            mode,
            title: title || getDefaultTitle(mode),
            data: data || null,
          }, false, 'openModal'),

        closeModal: () =>
          set({
            visible: false,
            mode: 'create',
            title: '',
            data: null,
          }, false, 'closeModal'),

        setModalData: (data: any) =>
          set({ data }, false, 'setModalData'),
      }),
      {
        name: `${name}-modal-store`,
      }
    )
  );
}

/**
 * 获取默认模态框标题
 */
function getDefaultTitle(mode: 'create' | 'edit' | 'view'): string {
  const titles = {
    create: '新建',
    edit: '编辑',
    view: '查看详情',
  };
  return titles[mode];
}

/**
 * 异步操作辅助函数
 */
export const createAsyncAction = async <T>(
  action: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<T | null> => {
  try {
    setLoading(true);
    setError(null);
    const result = await action();
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '操作失败';
    setError(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * 搜索防抖Hook
 */
export const createSearchDebounce = (
  setKeyword: (keyword: string) => void,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;

  return (keyword: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setKeyword(keyword);
    }, delay);
  };
};

/**
 * 创建带有乐观更新的CRUD动作
 */
export const createOptimisticActions = <T>(
  set: any,
  get: any
) => ({
  optimisticUpdate: (id: string, updates: Partial<T>, action: () => Promise<void>) => {
    // 保存原始状态
    const originalItem = get().items.find((item: any) => item.id === id);

    // 乐观更新
    set((state: any) => ({
      items: state.items.map((item: any) =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));

    // 执行实际更新
    return action().catch((error) => {
      // 回滚更新
      if (originalItem) {
        set((state: any) => ({
          items: state.items.map((item: any) =>
            item.id === id ? originalItem : item
          ),
          error: error.message || '更新失败',
        }));
      }
      throw error;
    });
  },

  optimisticDelete: (id: string, action: () => Promise<void>) => {
    // 保存原始状态
    const originalItems = get().items;

    // 乐观删除
    set((state: any) => ({
      items: state.items.filter((item: any) => item.id !== id)
    }));

    // 执行实际删除
    return action().catch((error) => {
      // 回滚删除
      set((state: any) => ({
        items: originalItems,
        error: error.message || '删除失败',
      }));
      throw error;
    });
  },
});

export default {
  createStore,
  createModalStore,
  createAsyncAction,
  createSearchDebounce,
  createOptimisticActions,
};