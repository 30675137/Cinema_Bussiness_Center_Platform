import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BrandItem, BrandStatus, LoadingState } from '@/types/brand';

interface BrandSlice {
  // 数据状态
  brands: BrandItem[];
  currentBrand: BrandItem | null;

  // 查询状态
  selectedStatus?: BrandStatus;
  keyword?: string;

  // UI 状态
  loadingState: LoadingState;
  createModalVisible: boolean;
  editModalVisible: boolean;

  // 错误状态
  error: string | null;

  // Actions
  setBrands: (brands: BrandItem[]) => void;
  setCurrentBrand: (brand: BrandItem | null) => void;
  setSelectedStatus: (status?: BrandStatus) => void;
  setKeyword: (keyword?: string) => void;
  setLoadingState: (state: LoadingState) => void;
  setCreateModalVisible: (visible: boolean) => void;
  setEditModalVisible: (visible: boolean) => void;
  setError: (error: string | null) => void;

  // 复合操作
  addBrand: (brand: BrandItem) => void;
  updateBrand: (id: string, updates: Partial<BrandItem>) => void;
  removeBrand: (id: string) => void;
  reset: () => void;
}

export const useBrandStore = create<BrandSlice>()(
  devtools(
    (set, get) => ({
      // 初始状态
      brands: [],
      currentBrand: null,
      selectedStatus: undefined,
      keyword: undefined,
      loadingState: 'idle',
      createModalVisible: false,
      editModalVisible: false,
      error: null,

      // 基础设置
      setBrands: (brands) => set({ brands }),
      setCurrentBrand: (brand) => set({ currentBrand: brand }),
      setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
      setKeyword: (keyword) => set({ keyword }),
      setLoadingState: (loadingState) => set({ loadingState }),
      setCreateModalVisible: (visible) => set({ createModalVisible: visible }),
      setEditModalVisible: (visible) => set({ editModalVisible: visible }),
      setError: (error) => set({ error }),

      // 复合操作
      addBrand: (brand) =>
        set((state) => ({
          brands: [brand, ...state.brands],
        })),

      updateBrand: (id, updates) =>
        set((state) => ({
          brands: state.brands.map((brand) =>
            brand.id === id ? { ...brand, ...updates, updatedAt: new Date().toISOString() } : brand
          ),
          currentBrand:
            state.currentBrand?.id === id
              ? { ...state.currentBrand, ...updates, updatedAt: new Date().toISOString() }
              : state.currentBrand,
        })),

      removeBrand: (id) =>
        set((state) => ({
          brands: state.brands.filter((brand) => brand.id !== id),
          currentBrand: state.currentBrand?.id === id ? null : state.currentBrand,
        })),

      reset: () =>
        set({
          brands: [],
          currentBrand: null,
          selectedStatus: undefined,
          keyword: undefined,
          loadingState: 'idle',
          createModalVisible: false,
          editModalVisible: false,
          error: null,
        }),
    }),
    {
      name: 'brand-store',
    }
  )
);
