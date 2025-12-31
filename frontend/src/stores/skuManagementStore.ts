/**
 * @spec O004-beverage-sku-reuse
 * SKU Management Zustand Store
 *
 * 管理 SKU 管理页面的客户端状态(UI 状态、表单草稿、模态框显示等)
 * 注意: 服务器状态(SKU 数据)由 TanStack Query 管理,本 Store 仅管理客户端 UI 状态
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SKU, SkuQueryParams, SkuFormData } from '@/types/sku';

/**
 * SKU Management Store State
 */
interface SkuManagementState {
  // === 表格状态 ===
  /** 查询参数(关键字、状态、分页等) */
  queryParams: SkuQueryParams;

  /** 表格选中的 SKU ID 列表 */
  selectedSkuIds: string[];

  // === 模态框状态 ===
  /** SKU 创建模态框是否显示 */
  isCreateModalVisible: boolean;

  /** SKU 编辑模态框是否显示 */
  isEditModalVisible: boolean;

  /** 当前编辑的 SKU ID */
  editingSkuId: string | null;

  // === 表单草稿 ===
  /** SKU 创建表单草稿数据 */
  createFormDraft: Partial<SkuFormData> | null;

  /** SKU 编辑表单草稿数据 */
  editFormDraft: Partial<SkuFormData> | null;

  // === 高级筛选状态 ===
  /** 高级筛选面板是否展开 */
  isAdvancedFilterExpanded: boolean;

  // === Actions ===
  /** 设置查询参数 */
  setQueryParams: (params: Partial<SkuQueryParams>) => void;

  /** 重置查询参数 */
  resetQueryParams: () => void;

  /** 设置选中的 SKU IDs */
  setSelectedSkuIds: (ids: string[]) => void;

  /** 清空选中 */
  clearSelection: () => void;

  /** 打开 SKU 创建模态框 */
  openCreateModal: () => void;

  /** 关闭 SKU 创建模态框 */
  closeCreateModal: () => void;

  /** 打开 SKU 编辑模态框 */
  openEditModal: (skuId: string) => void;

  /** 关闭 SKU 编辑模态框 */
  closeEditModal: () => void;

  /** 保存创建表单草稿 */
  saveCreateFormDraft: (draft: Partial<SkuFormData>) => void;

  /** 清空创建表单草稿 */
  clearCreateFormDraft: () => void;

  /** 保存编辑表单草稿 */
  saveEditFormDraft: (draft: Partial<SkuFormData>) => void;

  /** 清空编辑表单草稿 */
  clearEditFormDraft: () => void;

  /** 切换高级筛选面板展开状态 */
  toggleAdvancedFilter: () => void;

  /** 完全重置 Store(清空所有状态) */
  reset: () => void;
}

/**
 * 初始查询参数
 */
const initialQueryParams: SkuQueryParams = {
  keyword: undefined,
  status: 'all', // 默认查询所有状态
  page: 1,
  pageSize: 20,
};

/**
 * SKU Management Zustand Store
 *
 * 使用 persist middleware 持久化部分状态到 localStorage
 * 仅持久化用户偏好设置(查询参数、筛选面板展开状态),不持久化模态框和表单草稿
 */
export const useSkuManagementStore = create<SkuManagementState>()(
  persist(
    (set) => ({
      // === 初始状态 ===
      queryParams: initialQueryParams,
      selectedSkuIds: [],
      isCreateModalVisible: false,
      isEditModalVisible: false,
      editingSkuId: null,
      createFormDraft: null,
      editFormDraft: null,
      isAdvancedFilterExpanded: false,

      // === Actions ===
      setQueryParams: (params) =>
        set((state) => ({
          queryParams: {
            ...state.queryParams,
            ...params,
            // 如果关键字或状态变化,重置到第 1 页
            page: params.keyword !== undefined || params.status !== undefined
              ? 1
              : params.page ?? state.queryParams.page,
          },
        })),

      resetQueryParams: () =>
        set({
          queryParams: initialQueryParams,
        }),

      setSelectedSkuIds: (ids) =>
        set({
          selectedSkuIds: ids,
        }),

      clearSelection: () =>
        set({
          selectedSkuIds: [],
        }),

      openCreateModal: () =>
        set({
          isCreateModalVisible: true,
        }),

      closeCreateModal: () =>
        set({
          isCreateModalVisible: false,
          createFormDraft: null, // 关闭模态框时清空草稿
        }),

      openEditModal: (skuId) =>
        set({
          isEditModalVisible: true,
          editingSkuId: skuId,
        }),

      closeEditModal: () =>
        set({
          isEditModalVisible: false,
          editingSkuId: null,
          editFormDraft: null, // 关闭模态框时清空草稿
        }),

      saveCreateFormDraft: (draft) =>
        set({
          createFormDraft: draft,
        }),

      clearCreateFormDraft: () =>
        set({
          createFormDraft: null,
        }),

      saveEditFormDraft: (draft) =>
        set({
          editFormDraft: draft,
        }),

      clearEditFormDraft: () =>
        set({
          editFormDraft: null,
        }),

      toggleAdvancedFilter: () =>
        set((state) => ({
          isAdvancedFilterExpanded: !state.isAdvancedFilterExpanded,
        })),

      reset: () =>
        set({
          queryParams: initialQueryParams,
          selectedSkuIds: [],
          isCreateModalVisible: false,
          isEditModalVisible: false,
          editingSkuId: null,
          createFormDraft: null,
          editFormDraft: null,
          isAdvancedFilterExpanded: false,
        }),
    }),
    {
      name: 'sku-management-store', // localStorage key
      // 仅持久化查询参数和筛选面板状态,不持久化模态框和草稿
      partialize: (state) => ({
        queryParams: state.queryParams,
        isAdvancedFilterExpanded: state.isAdvancedFilterExpanded,
      }),
    }
  )
);

/**
 * Selector Hooks (性能优化)
 *
 * 使用 selector 避免不必要的重渲染,只订阅需要的状态切片
 */

/** 获取查询参数 */
export const useQueryParams = () =>
  useSkuManagementStore((state) => state.queryParams);

/** 获取选中的 SKU IDs */
export const useSelectedSkuIds = () =>
  useSkuManagementStore((state) => state.selectedSkuIds);

/** 获取创建模态框显示状态 */
export const useCreateModalVisible = () =>
  useSkuManagementStore((state) => state.isCreateModalVisible);

/** 获取编辑模态框显示状态和编辑的 SKU ID */
export const useEditModal = () =>
  useSkuManagementStore((state) => ({
    isVisible: state.isEditModalVisible,
    editingSkuId: state.editingSkuId,
  }));

/** 获取高级筛选面板展开状态 */
export const useAdvancedFilterExpanded = () =>
  useSkuManagementStore((state) => state.isAdvancedFilterExpanded);
