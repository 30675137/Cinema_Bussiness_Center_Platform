/**
 * 场景包编辑器 Zustand Store
 * Feature: 001-scenario-package-tabs
 * 管理跨标签页的全局状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ========== Types ==========

type TabKey = 'basic' | 'packages' | 'addons' | 'timeslots' | 'publish';

interface ScenarioPackageEditorState {
  // 当前编辑的场景包ID
  packageId: string | null;

  // 当前激活的标签页
  activeTab: TabKey;

  // 各标签页的未保存状态
  dirtyTabs: Record<TabKey, boolean>;

  // 是否正在保存
  isSaving: boolean;

  // 是否显示离开确认弹窗
  showLeaveConfirm: boolean;

  // 待切换的目标标签页（用于确认后跳转）
  pendingTab: TabKey | null;
}

interface ScenarioPackageEditorActions {
  // 设置当前编辑的场景包ID
  setPackageId: (id: string | null) => void;

  // 设置当前激活的标签页
  setActiveTab: (tab: TabKey) => void;

  // 设置某个标签页的未保存状态
  setDirty: (tab: TabKey, dirty: boolean) => void;

  // 检查是否有未保存的修改
  hasUnsavedChanges: () => boolean;

  // 清除所有未保存状态
  clearAllDirty: () => void;

  // 设置保存状态
  setIsSaving: (saving: boolean) => void;

  // 显示离开确认弹窗
  showLeaveConfirmModal: (pendingTab: TabKey) => void;

  // 隐藏离开确认弹窗
  hideLeaveConfirmModal: () => void;

  // 确认离开（不保存）
  confirmLeave: () => void;

  // 重置整个store
  reset: () => void;
}

type ScenarioPackageEditorStore = ScenarioPackageEditorState & ScenarioPackageEditorActions;

// ========== Initial State ==========

const initialState: ScenarioPackageEditorState = {
  packageId: null,
  activeTab: 'basic',
  dirtyTabs: {
    basic: false,
    packages: false,
    addons: false,
    timeslots: false,
    publish: false,
  },
  isSaving: false,
  showLeaveConfirm: false,
  pendingTab: null,
};

// ========== Store ==========

export const useScenarioPackageStore = create<ScenarioPackageEditorStore>()(
  immer((set, get) => ({
    ...initialState,

    setPackageId: (id) => {
      set((state) => {
        state.packageId = id;
      });
    },

    setActiveTab: (tab) => {
      const state = get();
      const currentTab = state.activeTab;

      // 如果当前标签页有未保存的修改，显示确认弹窗
      if (state.dirtyTabs[currentTab] && tab !== currentTab) {
        get().showLeaveConfirmModal(tab);
        return;
      }

      set((s) => {
        s.activeTab = tab;
      });
    },

    setDirty: (tab, dirty) => {
      set((state) => {
        state.dirtyTabs[tab] = dirty;
      });
    },

    hasUnsavedChanges: () => {
      const state = get();
      return Object.values(state.dirtyTabs).some((dirty) => dirty);
    },

    clearAllDirty: () => {
      set((state) => {
        state.dirtyTabs = {
          basic: false,
          packages: false,
          addons: false,
          timeslots: false,
          publish: false,
        };
      });
    },

    setIsSaving: (saving) => {
      set((state) => {
        state.isSaving = saving;
      });
    },

    showLeaveConfirmModal: (pendingTab) => {
      set((state) => {
        state.showLeaveConfirm = true;
        state.pendingTab = pendingTab;
      });
    },

    hideLeaveConfirmModal: () => {
      set((state) => {
        state.showLeaveConfirm = false;
        state.pendingTab = null;
      });
    },

    confirmLeave: () => {
      const state = get();
      const currentTab = state.activeTab;
      const pendingTab = state.pendingTab;

      if (pendingTab) {
        set((s) => {
          // 清除当前标签页的未保存状态
          s.dirtyTabs[currentTab] = false;
          // 切换到目标标签页
          s.activeTab = pendingTab;
          // 隐藏弹窗
          s.showLeaveConfirm = false;
          s.pendingTab = null;
        });
      }
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// ========== Selectors ==========

export const selectPackageId = (state: ScenarioPackageEditorStore) => state.packageId;
export const selectActiveTab = (state: ScenarioPackageEditorStore) => state.activeTab;
export const selectIsDirty = (tab: TabKey) => (state: ScenarioPackageEditorStore) => state.dirtyTabs[tab];
export const selectIsSaving = (state: ScenarioPackageEditorStore) => state.isSaving;
export const selectShowLeaveConfirm = (state: ScenarioPackageEditorStore) => state.showLeaveConfirm;

// ========== Export Types ==========

export type { TabKey, ScenarioPackageEditorState, ScenarioPackageEditorActions };
