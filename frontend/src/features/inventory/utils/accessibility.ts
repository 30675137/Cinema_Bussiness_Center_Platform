/**
 * P004-inventory-adjustment: 可访问性工具
 * 
 * 提供 ARIA 标签、键盘导航和屏幕阅读器支持。
 * 实现 T067 任务。
 * 
 * @since Phase 8 - Polish
 */

/**
 * ARIA 角色常量
 */
export const AriaRoles = {
  BUTTON: 'button',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  TABLE: 'table',
  GRID: 'grid',
  ROW: 'row',
  CELL: 'cell',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  REGION: 'region',
  FORM: 'form',
  SEARCH: 'searchbox',
  LIST: 'list',
  LISTITEM: 'listitem',
} as const;

/**
 * ARIA 标签生成器
 */
export const ariaLabels = {
  // 库存调整相关
  adjustment: {
    form: '库存调整录入表单',
    typeSelect: '选择调整类型：盘盈、盘亏或报损',
    quantityInput: '输入调整数量',
    reasonSelect: '选择调整原因',
    remarkInput: '输入备注信息',
    confirmButton: '确认提交库存调整',
    cancelButton: '取消库存调整',
  },

  // 审批相关
  approval: {
    list: '待审批库存调整列表',
    approveButton: '批准此调整申请',
    rejectButton: '驳回此调整申请',
    withdrawButton: '撤回调整申请',
    commentInput: '输入审批意见',
  },

  // 库存查询相关
  inventory: {
    table: '库存列表表格',
    searchInput: '搜索库存商品',
    categoryFilter: '按分类筛选库存',
    statusFilter: '按库存状态筛选',
    detailButton: '查看库存详情',
    safetyStockEdit: '编辑安全库存阈值',
  },

  // 流水记录相关
  transaction: {
    list: '库存流水记录列表',
    dateFilter: '按日期筛选流水记录',
    typeFilter: '按流水类型筛选',
  },

  // 通用
  common: {
    loading: '正在加载，请稍候',
    closeButton: '关闭',
    refreshButton: '刷新数据',
    exportButton: '导出数据',
    pagination: '分页导航',
    sortAscending: '升序排列',
    sortDescending: '降序排列',
  },
};

/**
 * 键盘按键常量
 */
export const KeyCodes = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * 键盘事件处理器工厂
 */
export const keyboardHandlers = {
  /**
   * 创建 Enter/Space 触发的点击处理器
   */
  createClickHandler(onClick: () => void) {
    return (event: React.KeyboardEvent) => {
      if (event.key === KeyCodes.ENTER || event.key === KeyCodes.SPACE) {
        event.preventDefault();
        onClick();
      }
    };
  },

  /**
   * 创建 Escape 关闭处理器
   */
  createEscapeHandler(onClose: () => void) {
    return (event: React.KeyboardEvent) => {
      if (event.key === KeyCodes.ESCAPE) {
        event.preventDefault();
        onClose();
      }
    };
  },

  /**
   * 创建列表导航处理器
   */
  createListNavigationHandler(options: {
    onUp?: () => void;
    onDown?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onSelect?: () => void;
  }) {
    return (event: React.KeyboardEvent) => {
      switch (event.key) {
        case KeyCodes.ARROW_UP:
          event.preventDefault();
          options.onUp?.();
          break;
        case KeyCodes.ARROW_DOWN:
          event.preventDefault();
          options.onDown?.();
          break;
        case KeyCodes.HOME:
          event.preventDefault();
          options.onHome?.();
          break;
        case KeyCodes.END:
          event.preventDefault();
          options.onEnd?.();
          break;
        case KeyCodes.ENTER:
        case KeyCodes.SPACE:
          event.preventDefault();
          options.onSelect?.();
          break;
      }
    };
  },
};

/**
 * 焦点管理工具
 */
export const focusUtils = {
  /**
   * 将焦点移动到指定元素
   */
  moveFocus(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  },

  /**
   * 获取可聚焦的子元素
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  },

  /**
   * 创建焦点陷阱（用于模态框）
   */
  createFocusTrap(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KeyCodes.TAB) return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 初始聚焦到第一个元素
    firstElement?.focus();

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
};

/**
 * 屏幕阅读器公告工具
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.cssText = `
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
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // 移除公告元素
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * 可访问性属性生成器
 */
export const a11yProps = {
  /**
   * 生成按钮的可访问性属性
   */
  button(label: string, options: { disabled?: boolean; loading?: boolean } = {}) {
    return {
      'aria-label': label,
      'aria-disabled': options.disabled || options.loading,
      'aria-busy': options.loading,
      role: AriaRoles.BUTTON,
    };
  },

  /**
   * 生成表格的可访问性属性
   */
  table(label: string, options: { sortable?: boolean; totalRows?: number } = {}) {
    return {
      'aria-label': label,
      'aria-rowcount': options.totalRows,
      role: AriaRoles.TABLE,
    };
  },

  /**
   * 生成表单的可访问性属性
   */
  form(label: string) {
    return {
      'aria-label': label,
      role: AriaRoles.FORM,
    };
  },

  /**
   * 生成对话框的可访问性属性
   */
  dialog(title: string, options: { describedBy?: string } = {}) {
    return {
      role: AriaRoles.DIALOG,
      'aria-modal': true,
      'aria-labelledby': title,
      'aria-describedby': options.describedBy,
    };
  },

  /**
   * 生成警告的可访问性属性
   */
  alert(options: { live?: 'polite' | 'assertive' } = {}) {
    return {
      role: AriaRoles.ALERT,
      'aria-live': options.live || 'assertive',
      'aria-atomic': true,
    };
  },

  /**
   * 生成状态的可访问性属性
   */
  status(options: { live?: 'polite' | 'assertive' } = {}) {
    return {
      role: AriaRoles.STATUS,
      'aria-live': options.live || 'polite',
      'aria-atomic': true,
    };
  },
};

export default {
  AriaRoles,
  ariaLabels,
  KeyCodes,
  keyboardHandlers,
  focusUtils,
  announceToScreenReader,
  a11yProps,
};
