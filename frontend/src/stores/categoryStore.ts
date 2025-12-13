/**
 * 类目管理功能的UI状态管理
 * 使用Zustand管理客户端状态，与TanStack Query分离
 * 负责管理UI交互状态，不包含服务器状态
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
// 临时定义以避免模块导入问题
interface CategoryStore {
  // UI状态
  expandedKeys: string[];
  selectedCategoryId: string | null;
  searchKeyword: string;
  isEditing: boolean;
  editingCategoryId: string | null;

  // Actions
  setExpandedKeys: (keys: string[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setEditing: (editing: boolean) => void;
  setEditingCategoryId: (id: string | null) => void;

  // 工具方法
  toggleExpand: (key: string) => void;
  reset: () => void;
}
// import type { CategoryStore } from '../pages/mdm-pim/category/types/category.types';

// 初始状态
const initialState: Omit<CategoryStore, 'setExpandedKeys' | 'setSelectedCategoryId' | 'setSearchKeyword' | 'setEditing' | 'setEditingCategoryId' | 'toggleExpand' | 'reset'> = {
  // UI状态
  expandedKeys: [],
  selectedCategoryId: null,
  searchKeyword: '',
  isEditing: false,
  editingCategoryId: null,
};

// 创建store
export const useCategoryStore = create<CategoryStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Actions
        setExpandedKeys: (keys) => {
          set({ expandedKeys: keys });
        },

        setSelectedCategoryId: (id) => {
          set({ selectedCategoryId: id });
          // 当选择类目时，清除编辑状态
          if (id) {
            set({ isEditing: false, editingCategoryId: null });
          }
        },

        setSearchKeyword: (keyword) => {
          set({ searchKeyword: keyword });
        },

        setEditing: (editing) => {
          set({ isEditing: editing });
        },

        setEditingCategoryId: (id) => {
          set({ editingCategoryId: id });
        },

        // 工具方法
        toggleExpand: (key) => {
          const { expandedKeys } = get();
          const newKeys = expandedKeys.includes(key)
            ? expandedKeys.filter(k => k !== key)
            : [...expandedKeys, key];
          set({ expandedKeys: newKeys });
        },

        expandAll: (keys: string[]) => {
          set({ expandedKeys: keys });
        },

        collapseAll: () => {
          set({ expandedKeys: [] });
        },

        selectCategory: (categoryId: string) => {
          set({
            selectedCategoryId: categoryId,
            isEditing: false,
            editingCategoryId: null
          });
        },

        startEditing: (categoryId: string) => {
          set({
            isEditing: true,
            editingCategoryId: categoryId,
            selectedCategoryId: categoryId
          });
        },

        cancelEditing: () => {
          set({
            isEditing: false,
            editingCategoryId: null
          });
        },

        reset: () => {
          set(initialState);
        },

        // 高级状态操作
        expandPath: (categoryIds: string[]) => {
          const { expandedKeys } = get();
          const newKeys = Array.from(new Set([...expandedKeys, ...categoryIds]));
          set({ expandedKeys: newKeys });
        },

        clearSelection: () => {
          set({
            selectedCategoryId: null,
            isEditing: false,
            editingCategoryId: null
          });
        },

        // 状态查询方法
        isSelected: (categoryId: string) => {
          return get().selectedCategoryId === categoryId;
        },

        isExpanded: (categoryId: string) => {
          return get().expandedKeys.includes(categoryId);
        },

        isEditingCategory: (categoryId: string) => {
          const { isEditing, editingCategoryId } = get();
          return isEditing && editingCategoryId === categoryId;
        },

        // 搜索相关方法
        performSearch: (keyword: string) => {
          set({ searchKeyword: keyword });
          // 搜索时自动展开匹配的类目路径
          if (keyword.trim()) {
            // 这里可以添加搜索逻辑，比如自动展开匹配的路径
            // 实际的搜索展开逻辑会在CategoryTree组件中处理
          }
        },

        clearSearch: () => {
          set({ searchKeyword: '' });
        },

        // 批量操作方法
        batchUpdate: (updates: Partial<CategoryStore>) => {
          set(updates);
        },

        // 状态快照
        getSnapshot: () => {
          return { ...get() };
        },

        // 状态恢复
        restoreSnapshot: (snapshot: Partial<CategoryStore>) => {
          set(snapshot);
        },

        // 调试方法
        logState: () => {
          console.log('CategoryStore State:', get());
        },
      }),
      {
        name: 'category-store',
        // 只持久化必要的状态字段
        partialize: (state) => ({
          expandedKeys: state.expandedKeys,
          selectedCategoryId: state.selectedCategoryId,
        }),
      }
    ),
    {
      name: 'category-store',
    }
  )
);

// 选择器hooks，用于在组件中订阅特定状态
export const useCategoryStoreSelector = <T>(
  selector: (state: CategoryStore) => T
) => useCategoryStore(selector);

// 常用选择器
export const useCategoryExpandedKeys = () => useCategoryStore((state) => state.expandedKeys);
export const useCategorySelectedId = () => useCategoryStore((state) => state.selectedCategoryId);
export const useCategorySearchKeyword = () => useCategoryStore((state) => state.searchKeyword);
export const useCategoryEditingState = () => useCategoryStore((state) => ({
  isEditing: state.isEditing,
  editingCategoryId: state.editingCategoryId,
}));

// 动作hooks，用于在组件中触发状态更新
export const useCategoryActions = () => {
  const store = useCategoryStore();

  return {
    setExpandedKeys: store.setExpandedKeys,
    setSelectedCategoryId: store.setSelectedCategoryId,
    setSearchKeyword: store.setSearchKeyword,
    setEditing: store.setEditing,
    setEditingCategoryId: store.setEditingCategoryId,
    toggleExpand: store.toggleExpand,
    expandAll: store.expandAll,
    collapseAll: store.collapseAll,
    selectCategory: store.selectCategory,
    startEditing: store.startEditing,
    cancelEditing: store.cancelEditing,
    reset: store.reset,
    expandPath: store.expandPath,
    clearSelection: store.clearSelection,
    performSearch: store.performSearch,
    clearSearch: store.clearSearch,
    batchUpdate: store.batchUpdate,
    getSnapshot: store.getSnapshot,
    restoreSnapshot: store.restoreSnapshot,
    logState: store.logState,
  };
};

// 计算属性hooks
export const useCategoryComputed = () => {
  const { selectedCategoryId, isEditing, searchKeyword, expandedKeys } = useCategoryStore();

  return {
    hasSelection: !!selectedCategoryId,
    isEditMode: !!isEditing,
    isSearching: !!searchKeyword.trim(),
    expandedCount: expandedKeys.length,
    canEdit: !!selectedCategoryId && !isEditing,
  };
};

export default useCategoryStore;