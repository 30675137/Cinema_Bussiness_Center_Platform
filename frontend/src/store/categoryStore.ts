import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CategoryItem, CategoryTree, CategoryStatus, LoadingState } from '@/types/category';

interface CategorySlice {
  // 数据状态
  categories: CategoryItem[];
  categoryTree: CategoryTree[];
  currentCategory: CategoryItem | null;

  // 查询状态
  selectedLevel?: 1 | 2 | 3;
  selectedParentId?: string;
  statusFilter?: CategoryStatus;

  // UI 状态
  loadingState: LoadingState;
  createModalVisible: boolean;
  editModalVisible: boolean;

  // 错误状态
  error: string | null;

  // Actions
  setCategories: (categories: CategoryItem[]) => void;
  setCategoryTree: (tree: CategoryTree[]) => void;
  setCurrentCategory: (category: CategoryItem | null) => void;
  setSelectedLevel: (level?: 1 | 2 | 3) => void;
  setSelectedParentId: (parentId?: string) => void;
  setStatusFilter: (status?: CategoryStatus) => void;
  setLoadingState: (state: LoadingState) => void;
  setCreateModalVisible: (visible: boolean) => void;
  setEditModalVisible: (visible: boolean) => void;
  setError: (error: string | null) => void;

  // 复合操作
  addCategory: (category: CategoryItem) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  removeCategory: (id: string) => void;
  refreshTree: () => void;
  reset: () => void;
}

export const useCategoryStore = create<CategorySlice>()(
  devtools(
    (set, get) => ({
      // 初始状态
      categories: [],
      categoryTree: [],
      currentCategory: null,
      selectedLevel: undefined,
      selectedParentId: undefined,
      statusFilter: undefined,
      loadingState: 'idle',
      createModalVisible: false,
      editModalVisible: false,
      error: null,

      // 基础设置
      setCategories: (categories) => set({ categories }),
      setCategoryTree: (categoryTree) => set({ categoryTree }),
      setCurrentCategory: (category) => set({ currentCategory: category }),
      setSelectedLevel: (selectedLevel) => set({ selectedLevel }),
      setSelectedParentId: (selectedParentId) => set({ selectedParentId }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setLoadingState: (loadingState) => set({ loadingState }),
      setCreateModalVisible: (visible) => set({ createModalVisible: visible }),
      setEditModalVisible: (visible) => set({ editModalVisible: visible }),
      setError: (error) => set({ error }),

      // 复合操作
      addCategory: (category) =>
        set((state) => ({
          categories: [category, ...state.categories],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? { ...category, ...updates, updatedAt: new Date().toISOString() }
              : category
          ),
          currentCategory:
            state.currentCategory?.id === id
              ? { ...state.currentCategory, ...updates, updatedAt: new Date().toISOString() }
              : state.currentCategory,
        })),

      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          currentCategory: state.currentCategory?.id === id ? null : state.currentCategory,
        })),

      refreshTree: () => {
        const { categories } = get();
        // 构建树形结构的逻辑
        const buildTree = (items: CategoryItem[], parentId?: string): CategoryTree[] => {
          return items
            .filter((item) => item.parentId === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => ({
              ...item,
              children: buildTree(items, item.id),
            }));
        };

        const tree = buildTree(categories);
        set({ categoryTree: tree });
      },

      reset: () =>
        set({
          categories: [],
          categoryTree: [],
          currentCategory: null,
          selectedLevel: undefined,
          selectedParentId: undefined,
          statusFilter: undefined,
          loadingState: 'idle',
          createModalVisible: false,
          editModalVisible: false,
          error: null,
        }),
    }),
    {
      name: 'category-store',
    }
  )
);
