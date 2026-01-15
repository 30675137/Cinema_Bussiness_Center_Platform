/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * Zustand store for Channel Product Configuration UI state
 */

import { create } from 'zustand';
import { ChannelType } from '../types';
import type { ChannelProductConfig, ChannelProductStatus } from '../types';

interface ChannelProductState {
  // ========================================
  // Filters
  // ========================================
  filters: {
    channelType: ChannelType;
    categoryId?: string; // UUID，关联 menu_category.id
    status?: ChannelProductStatus;
    keyword?: string;
  };

  // ========================================
  // Modal States
  // ========================================
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isSpecModalOpen: boolean;
  editingProduct: ChannelProductConfig | null;

  // ========================================
  // Actions - Filters
  // ========================================
  setFilters: (filters: Partial<ChannelProductState['filters']>) => void;
  resetFilters: () => void;

  // ========================================
  // Actions - Modals
  // ========================================
  openCreateModal: () => void;
  openEditModal: (product: ChannelProductConfig) => void;
  openSpecModal: (product: ChannelProductConfig) => void;
  closeAllModals: () => void;
}

/**
 * Channel Product Configuration Store
 * Manages UI state for filters, modals, and editing context
 */
export const useChannelProductStore = create<ChannelProductState>((set) => ({
  // ========================================
  // Initial State
  // ========================================
  filters: {
    channelType: ChannelType.MINI_PROGRAM,
    categoryId: undefined,
    status: undefined,
    keyword: '',
  },

  isCreateModalOpen: false,
  isEditModalOpen: false,
  isSpecModalOpen: false,
  editingProduct: null,

  // ========================================
  // Filter Actions
  // ========================================
  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    })),

  resetFilters: () =>
    set({
      filters: {
        channelType: ChannelType.MINI_PROGRAM,
        categoryId: undefined,
        status: undefined,
        keyword: '',
      },
    }),

  // ========================================
  // Modal Actions
  // ========================================
  openCreateModal: () =>
    set({
      isCreateModalOpen: true,
      isEditModalOpen: false,
      isSpecModalOpen: false,
      editingProduct: null,
    }),

  openEditModal: (product) =>
    set({
      isCreateModalOpen: false,
      isEditModalOpen: true,
      isSpecModalOpen: false,
      editingProduct: product,
    }),

  openSpecModal: (product) =>
    set({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isSpecModalOpen: true,
      editingProduct: product,
    }),

  closeAllModals: () =>
    set({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isSpecModalOpen: false,
      editingProduct: null,
    }),
}));
