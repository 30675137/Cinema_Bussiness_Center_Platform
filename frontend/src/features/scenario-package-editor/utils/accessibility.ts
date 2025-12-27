/**
 * 场景包编辑器可访问性工具
 * Feature: 001-scenario-package-tabs
 * T093: Accessibility improvements: ARIA labels, focus management, screen reader announcements
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * 焦点管理 Hook
 * 用于在模态框打开时管理焦点
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // 保存当前焦点元素
    previousActiveElement.current = document.activeElement;

    // 获取所有可聚焦元素
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 聚焦到第一个元素
    firstElement.focus();

    // 焦点循环处理
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 恢复之前的焦点
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * 屏幕阅读器通知 Hook
 * 用于向屏幕阅读器发送通知
 */
export function useAriaAnnounce() {
  const announce = useCallback((message: string, type: 'polite' | 'assertive' = 'polite') => {
    // 查找或创建 live region
    let liveRegion = document.getElementById('aria-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(liveRegion);
    }

    // 设置通知类型
    liveRegion.setAttribute('aria-live', type);

    // 清空再设置以确保触发通知
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);
  }, []);

  return { announce };
}

/**
 * 键盘快捷键 Hook
 * T092: Keyboard navigation support
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果在输入框中，不处理快捷键
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // 但允许 Escape 键
        if (event.key !== 'Escape') return;
      }

      const key = [
        event.ctrlKey || event.metaKey ? 'Ctrl+' : '',
        event.altKey ? 'Alt+' : '',
        event.shiftKey ? 'Shift+' : '',
        event.key,
      ].join('');

      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Escape 键关闭 Hook
 */
export function useEscapeClose(onClose: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isActive]);
}

/**
 * 焦点可见性 Hook
 * 用于判断是否应该显示焦点指示器
 */
export function useFocusVisible() {
  const ref = useRef<HTMLElement>(null);
  const isFocusVisibleRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => {
      // 判断是否通过键盘聚焦
      isFocusVisibleRef.current = true;
      element.classList.add('focus-visible');
    };

    const handleBlur = () => {
      isFocusVisibleRef.current = false;
      element.classList.remove('focus-visible');
    };

    const handleKeyDown = () => {
      isFocusVisibleRef.current = true;
    };

    const handleMouseDown = () => {
      isFocusVisibleRef.current = false;
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return ref;
}

/**
 * ARIA 属性生成器
 */
export const ariaProps = {
  /**
   * 生成标签页容器的 ARIA 属性
   */
  tabList: () => ({
    role: 'tablist' as const,
  }),

  /**
   * 生成标签页按钮的 ARIA 属性
   */
  tab: (id: string, isSelected: boolean, panelId: string) => ({
    role: 'tab' as const,
    id,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    tabIndex: isSelected ? 0 : -1,
  }),

  /**
   * 生成标签页面板的 ARIA 属性
   */
  tabPanel: (id: string, tabId: string, isHidden: boolean) => ({
    role: 'tabpanel' as const,
    id,
    'aria-labelledby': tabId,
    hidden: isHidden,
    tabIndex: 0,
  }),

  /**
   * 生成模态框的 ARIA 属性
   */
  dialog: (titleId: string) => ({
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': titleId,
  }),

  /**
   * 生成警告框的 ARIA 属性
   */
  alert: (type: 'success' | 'error' | 'warning' | 'info') => ({
    role: 'alert' as const,
    'aria-live': type === 'error' ? 'assertive' : 'polite' as const,
  }),

  /**
   * 生成表单字段的 ARIA 属性
   */
  formField: (id: string, errorId?: string, required?: boolean) => ({
    id,
    'aria-invalid': !!errorId,
    'aria-describedby': errorId,
    'aria-required': required,
  }),

  /**
   * 生成加载状态的 ARIA 属性
   */
  loading: (isLoading: boolean, loadingText: string = '加载中') => ({
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
    'aria-label': isLoading ? loadingText : undefined,
  }),
};

/**
 * 标签页键盘导航处理
 */
export function handleTabKeyNavigation(
  event: React.KeyboardEvent,
  tabs: string[],
  currentTabIndex: number,
  onTabChange: (tabKey: string) => void
): void {
  let newIndex = currentTabIndex;

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      newIndex = currentTabIndex === 0 ? tabs.length - 1 : currentTabIndex - 1;
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      newIndex = currentTabIndex === tabs.length - 1 ? 0 : currentTabIndex + 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  onTabChange(tabs[newIndex]);
}

export default {
  useFocusTrap,
  useAriaAnnounce,
  useKeyboardShortcuts,
  useEscapeClose,
  useFocusVisible,
  ariaProps,
  handleTabKeyNavigation,
};
