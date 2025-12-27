/**
 * 单位换算 UI 状态管理 (Zustand)
 * P002-unit-conversion
 */

import { create } from 'zustand';
import type { UnitConversion, DbUnitCategory } from '../types';

interface ConversionUIState {
  // 搜索过滤
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // 类别过滤
  categoryFilter: DbUnitCategory | null;
  setCategoryFilter: (category: DbUnitCategory | null) => void;

  // 模态框状态
  isModalOpen: boolean;
  editingRule: Partial<UnitConversion> | null;
  openCreateModal: () => void;
  openEditModal: (rule: UnitConversion) => void;
  closeModal: () => void;

  // 删除确认
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;

  // 重置所有状态
  reset: () => void;
}

const initialState = {
  searchTerm: '',
  categoryFilter: null,
  isModalOpen: false,
  editingRule: null,
  deleteConfirmId: null,
};

export const useConversionUIStore = create<ConversionUIState>((set) => ({
  ...initialState,

  // 搜索过滤
  setSearchTerm: (term) => set({ searchTerm: term }),

  // 类别过滤
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  // 模态框状态
  openCreateModal: () =>
    set({
      isModalOpen: true,
      editingRule: { category: 'volume' } as Partial<UnitConversion>,
    }),

  openEditModal: (rule) =>
    set({
      isModalOpen: true,
      editingRule: { ...rule },
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      editingRule: null,
    }),

  // 删除确认
  setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),

  // 重置
  reset: () => set(initialState),
}));

/**
 * 选择器：获取是否处于编辑模式
 */
export const selectIsEditing = (state: ConversionUIState) =>
  state.editingRule?.id !== undefined;

/**
 * 选择器：获取编辑中的规则 ID
 */
export const selectEditingId = (state: ConversionUIState) =>
  state.editingRule?.id;
