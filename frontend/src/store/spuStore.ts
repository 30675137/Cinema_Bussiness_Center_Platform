import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SPUItem, SPUQueryParams, SPUCreationForm, SPUUpdateForm, LoadingState } from '@/types/spu';

interface SPUSlice {
  // 数据状态
  spus: SPUItem[];
  currentSPU: SPUItem | null;
  selectedSPUs: string[];

  // 查询状态
  queryParams: SPUQueryParams;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // UI 状态
  loadingState: LoadingState;
  createModalVisible: boolean;
  editModalVisible: boolean;
  detailModalVisible: boolean;

  // 错误状态
  error: string | null;

  // Actions
  setSPUs: (spus: SPUItem[]) => void;
  setCurrentSPU: (spu: SPUItem | null) => void;
  setSelectedSPUs: (ids: string[]) => void;
  setQueryParams: (params: Partial<SPUQueryParams>) => void;
  setPagination: (pagination: any) => void;
  setLoadingState: (state: LoadingState) => void;
  setCreateModalVisible: (visible: boolean) => void;
  setEditModalVisible: (visible: boolean) => void;
  setDetailModalVisible: (visible: boolean) => void;
  setError: (error: string | null) => void;

  // 复合操作
  addSPU: (spu: SPUItem) => void;
  updateSPU: (id: string, updates: Partial<SPUItem>) => void;
  removeSPU: (id: string) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const useSPUStore = create<SPUSlice>()(
  devtools(
    (set, get) => ({
      // 初始状态
      spus: [],
      currentSPU: null,
      selectedSPUs: [],
      queryParams: {
        page: 1,
        pageSize: 10,
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
      loadingState: 'idle',
      createModalVisible: false,
      editModalVisible: false,
      detailModalVisible: false,
      error: null,

      // 基础设置
      setSPUs: (spus) => set({ spus }),
      setCurrentSPU: (spu) => set({ currentSPU: spu }),
      setSelectedSPUs: (ids) => set({ selectedSPUs: ids }),
      setQueryParams: (params) =>
        set((state) => ({
          queryParams: { ...state.queryParams, ...params },
        })),
      setPagination: (pagination) => set({ pagination }),
      setLoadingState: (loadingState) => set({ loadingState }),
      setCreateModalVisible: (visible) => set({ createModalVisible: visible }),
      setEditModalVisible: (visible) => set({ editModalVisible: visible }),
      setDetailModalVisible: (visible) => set({ detailModalVisible: visible }),
      setError: (error) => set({ error }),

      // 复合操作
      addSPU: (spu) =>
        set((state) => ({
          spus: [spu, ...state.spus],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1,
          },
        })),

      updateSPU: (id, updates) =>
        set((state) => ({
          spus: state.spus.map((spu) =>
            spu.id === id ? { ...spu, ...updates, updatedAt: new Date().toISOString() } : spu
          ),
          currentSPU:
            state.currentSPU?.id === id
              ? { ...state.currentSPU, ...updates, updatedAt: new Date().toISOString() }
              : state.currentSPU,
        })),

      removeSPU: (id) =>
        set((state) => ({
          spus: state.spus.filter((spu) => spu.id !== id),
          selectedSPUs: state.selectedSPUs.filter((selectedId) => selectedId !== id),
          currentSPU: state.currentSPU?.id === id ? null : state.currentSPU,
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1),
          },
        })),

      clearSelection: () => set({ selectedSPUs: [] }),

      reset: () =>
        set({
          spus: [],
          currentSPU: null,
          selectedSPUs: [],
          queryParams: {
            page: 1,
            pageSize: 10,
          },
          pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          },
          loadingState: 'idle',
          createModalVisible: false,
          editModalVisible: false,
          detailModalVisible: false,
          error: null,
        }),
    }),
    {
      name: 'spu-store',
    }
  )
);
