/**
 * 测试工具函数
 * 提供通用的测试辅助功能和模拟数据生成
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { InventoryLedger, InventoryMovement, InventoryAdjustment } from '@types/inventory';

// Ant Design测试包装器
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ConfigProvider locale={zhCN}>
      {children}
    </ConfigProvider>
  );
};

// 自定义渲染函数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 重新暴露所有testing-library的工具
export * from '@testing-library/react';
export { customRender as render };

// 模拟数据生成器
export const createMockInventoryItem = (overrides: Partial<InventoryLedger> = {}): InventoryLedger => {
  const id = overrides.id || `inventory_${Math.random().toString(36).substr(2, 9)}`;
  const sku = overrides.sku || `SKU${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

  const warehouses = ['主仓库', '分仓A', '分仓B', '临时仓库', '残次品仓库'];
  const categories = ['爆米花', '饮料', '零食', '3D眼镜', '电影周边'];
  const stockStatuses = ['low', 'normal', 'high', 'out_of_stock'] as const;

  const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const stockStatus = stockStatuses[Math.floor(Math.random() * stockStatuses.length)];

  const physicalQuantity = Math.floor(Math.random() * 1000);
  const reservedQuantity = Math.floor(Math.random() * physicalQuantity * 0.3);
  const availableQuantity = physicalQuantity - reservedQuantity;
  const inTransitQuantity = Math.floor(Math.random() * 50);
  const safetyStock = Math.floor(Math.random() * 50) + 10;

  const costPrice = Math.round((Math.random() * 50 + 5) * 100) / 100;
  const sellingPrice = Math.round((costPrice * (Math.random() * 2 + 1.2)) * 100) / 100;

  return {
    id,
    sku,
    productName: `${category}${Math.floor(Math.random() * 100)}`,
    categoryId: `cat_${category}`,
    categoryName: category,
    locationId: `loc_${warehouse}`,
    locationName: warehouse,
    physicalQuantity,
    reservedQuantity,
    availableQuantity,
    inTransitQuantity,
    safetyStock,
    stockStatus,
    costPrice,
    sellingPrice,
    totalValue: Math.round((physicalQuantity * sellingPrice) * 100) / 100,
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
};

export const createMockMovementItem = (overrides: Partial<InventoryMovement> = {}): InventoryMovement => {
  const id = overrides.id || `movement_${Math.random().toString(36).substr(2, 9)}`;
  const sku = overrides.sku || `SKU${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

  const movementTypes = ['in', 'out', 'transfer_in', 'transfer_out', 'adjust_positive', 'adjust_negative'] as const;
  const movementSubtypes = ['采购入库', '销售出库', '调拨入库', '调拨出库', '盘盈', '盘亏', '报损', '过期'];
  const operators = ['张三', '李四', '王五', '赵六', '钱七'];

  const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
  const movementSubtype = movementSubtypes[Math.floor(Math.random() * movementSubtypes.length)];
  const operatorName = operators[Math.floor(Math.random() * operators.length)];

  const quantity = Math.floor(Math.random() * 100) + 1;
  const balanceAfter = Math.floor(Math.random() * 500) + quantity;

  return {
    id,
    sku,
    productName: `测试商品${Math.floor(Math.random() * 100)}`,
    locationId: `loc_${Math.floor(Math.random() * 5)}`,
    locationName: `仓库${Math.floor(Math.random() * 5)}`,
    movementType,
    movementSubtype,
    quantity: movementType.includes('out') || movementType === 'adjust_negative' ? -quantity : quantity,
    balanceAfter,
    referenceNo: Math.random() > 0.5 ? `REF${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` : undefined,
    operatorName,
    operationTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    batchNo: Math.random() > 0.7 ? `BATCH${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` : undefined,
    remarks: Math.random() > 0.8 ? '测试备注信息' : undefined,
    ...overrides,
  };
};

export const createMockAdjustmentItem = (overrides: Partial<InventoryAdjustment> = {}): InventoryAdjustment => {
  const id = overrides.id || `adjustment_${Math.random().toString(36).substr(2, 9)}`;
  const sku = overrides.sku || `SKU${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

  const adjustmentTypes = ['stocktaking_profit', 'stocktaking_loss', 'damage', 'expired', 'other'] as const;
  const statuses = ['pending', 'approved', 'rejected', 'completed'] as const;
  const approvers = ['张三', '李四', '王五'];

  const adjustmentType = adjustmentTypes[Math.floor(Math.random() * adjustmentTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const originalQuantity = Math.floor(Math.random() * 200) + 50;
  const adjustedQuantity = adjustmentType === 'stocktaking_profit'
    ? originalQuantity + Math.floor(Math.random() * 20) + 1
    : originalQuantity - Math.floor(Math.random() * 20) - 1;

  return {
    id,
    sku,
    productName: `测试商品${Math.floor(Math.random() * 100)}`,
    locationId: `loc_${Math.floor(Math.random() * 5)}`,
    locationName: `仓库${Math.floor(Math.random() * 5)}`,
    adjustmentType,
    reason: `调整原因${Math.floor(Math.random() * 100)}`,
    originalQuantity,
    adjustedQuantity,
    adjustmentQuantity: adjustedQuantity - originalQuantity,
    status,
    requestedBy: `操作员${Math.floor(Math.random() * 10)}`,
    requestedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: status !== 'pending' ? approvers[Math.floor(Math.random() * approvers.length)] : undefined,
    approvedAt: status !== 'pending' ? new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    completedAt: status === 'completed' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    remarks: Math.random() > 0.7 ? '调整备注信息' : undefined,
    ...overrides,
  };
};

// 批量生成模拟数据
export const createMockInventoryData = (count: number = 50): InventoryLedger[] => {
  return Array.from({ length: count }, () => createMockInventoryItem());
};

export const createMockMovementData = (count: number = 100): InventoryMovement[] => {
  return Array.from({ length: count }, () => createMockMovementItem());
};

export const createMockAdjustmentData = (count: number = 30): InventoryAdjustment[] => {
  return Array.from({ length: count }, () => createMockAdjustmentItem());
};

// 等待异步操作完成的工具函数
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 模拟用户交互
export const mockUserInteraction = {
  // 模拟键盘事件
  pressKey: (key: string) => {
    const event = new KeyboardEvent('keydown', { key });
    document.dispatchEvent(event);
  },

  // 模拟鼠标点击
  click: (element: HTMLElement) => {
    element.click();
  },

  // 模拟输入
  type: (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
};

// 测试断言助手
export const expect = {
  // 断言元素可见
  toBeVisible: (element: HTMLElement | null) => {
    if (!element) {
      throw new Error('Element not found');
    }
    if (element.offsetParent === null) {
      throw new Error('Element is not visible');
    }
  },

  // 断言元素存在
  toExist: (element: HTMLElement | null) => {
    if (!element) {
      throw new Error('Element does not exist');
    }
  },

  // 断言文本包含
  toContainText: (element: HTMLElement | null, text: string) => {
    if (!element) {
      throw new Error('Element not found');
    }
    if (!element.textContent?.includes(text)) {
      throw new Error(`Element text "${element.textContent}" does not contain "${text}"`);
    }
  },

  // 断言元素有指定类名
  toHaveClass: (element: HTMLElement | null, className: string) => {
    if (!element) {
      throw new Error('Element not found');
    }
    if (!element.classList.contains(className)) {
      throw new Error(`Element does not have class "${className}"`);
    }
  },
};

// 模拟store状态
export const createMockStoreState = (overrides: any = {}) => {
  return {
    data: [],
    total: 0,
    currentData: null,
    filters: {},
    sort: { sortBy: 'lastUpdated', sortOrder: 'desc' },
    pagination: { current: 1, pageSize: 20, total: 0 },
    loading: { data: false, creating: false, updating: false, deleting: false },
    error: { hasError: false, message: '', code: '' },
    selectedRows: [],
    selectedRowKeys: [],
    isEditing: false,
    isDetailsVisible: false,
    ...overrides,
  };
};

// 模拟API响应
export const createMockApiResponse = <T>(data: T, delay: number = 100) => {
  return new Promise<{ data: T; total: number }>((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        total: Array.isArray(data) ? data.length : 1,
      });
    }, delay);
  });
};

// 模拟API错误
export const createMockApiError = (message: string = 'API Error', code: string = 'ERROR', delay: number = 100) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error = new Error(message);
      reject(error);
    }, delay);
  });
};

// 清理函数
export const cleanup = () => {
  // 清理DOM
  document.body.innerHTML = '';

  // 清理定时器
  jest.clearAllTimers();

  // 清理模拟函数
  jest.clearAllMocks();
};

export default {
  render: customRender,
  createMockInventoryItem,
  createMockMovementItem,
  createMockAdjustmentItem,
  createMockInventoryData,
  createMockMovementData,
  createMockAdjustmentData,
  waitForAsync,
  mockUserInteraction,
  expect,
  createMockStoreState,
  createMockApiResponse,
  createMockApiError,
  cleanup,
};