import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CategoryStore {
  // 服务器状态（由 TanStack Query 管理，这里不存储）
  // items: CategoryItem[]; // 已移除，由 TanStack Query 管理
  
  // UI 状态（客户端状态，由 Zustand 管理）
  expandedKeys: string[];           // 树节点展开状态
  selectedCategoryId: string | null; // 当前选中的类目ID
  searchKeyword: string;            // 搜索关键词
  isEditing: boolean;               // 是否处于编辑模式
  
  // Actions
  setExpandedKeys: (keys: string[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setEditing: (editing: boolean) => void;
  
  // 工具方法
  toggleExpand: (key: string) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set) => ({
      // UI 状态初始化
      expandedKeys: [],
      selectedCategoryId: null,
      searchKeyword: '',
      isEditing: false,
      
      // Actions
      setExpandedKeys: (keys) => set({ expandedKeys: keys }),
      setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
      setEditing: (editing) => set({ isEditing: editing }),
      
      // 工具方法
      toggleExpand: (key) => set((state) => ({
        expandedKeys: state.expandedKeys.includes(key)
          ? state.expandedKeys.filter(k => k !== key)
          : [...state.expandedKeys, key]
      })),
      
      reset: () => set({
        expandedKeys: [],
        selectedCategoryId: null,
        searchKeyword: '',
        isEditing: false,
      })
    }),
    {
      name: 'category-store'
    }
  )
);