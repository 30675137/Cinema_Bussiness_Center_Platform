/**
 * 库存管理状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  InventoryItem,
  InventoryStatus,
  InventoryOperation,
  InventoryOperationType,
  Location,
  InventoryQueryParams,
  InventoryFilter,
  InventoryStatistics,
  InventoryAlert,
  InventoryCheck,
  InventoryCheckItem,
  CreateInventoryItemParams,
  UpdateInventoryItemParams,
  InventoryOperationParams,
  InventoryTransferParams,
  InventoryAdjustmentParams
} from '@/types/inventory';
import { generateId, generateOrderNumber, formatDate } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';

// ===== Mock Data Generation =====

/**
 * 生成mock位置数据
 */
const generateMockLocations = (): Location[] => [
  {
    id: 'loc-001',
    name: '主仓库-A区',
    code: 'WH-A-001',
    type: 'warehouse',
    capacity: 1000,
    description: '主仓库A区，存放日常用品',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'loc-002',
    name: '主仓库-B区',
    code: 'WH-B-001',
    type: 'warehouse',
    capacity: 800,
    description: '主仓库B区，存放食品饮料',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'loc-003',
    name: '冷库',
    code: 'WH-COLD-001',
    type: 'warehouse',
    capacity: 200,
    description: '冷藏库，存放生鲜食品',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'loc-004',
    name: '货架A-1层',
    code: 'SHELF-A1-L1',
    type: 'shelf',
    capacity: 100,
    description: '货架A第1层',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'loc-005',
    name: '货架B-2层',
    code: 'SHELF-B2-L2',
    type: 'shelf',
    capacity: 80,
    description: '货架B第2层',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * 生成mock库存数据
 */
const generateMockInventoryItems = (): InventoryItem[] => {
  const items: InventoryItem[] = [];
  const categories = ['食品饮料', '日常用品', '清洁用品', '办公用品', '设备耗材'];
  const units = ['个', '箱', '瓶', '包', '盒', '卷'];
  const locations = generateMockLocations();

  for (let i = 1; i <= 50; i++) {
    const currentStock = Math.floor(Math.random() * 1000);
    const minStock = Math.floor(Math.random() * 50) + 10;
    const maxStock = Math.floor(Math.random() * 200) + 100;
    const safeStock = Math.floor(Math.random() * 80) + 20;
    const location = locations[Math.floor(Math.random() * locations.length)];

    let status: InventoryStatus;
    if (currentStock === 0) {
      status = InventoryStatus.OUT_OF_STOCK;
    } else if (currentStock <= minStock) {
      status = InventoryStatus.LOW_STOCK;
    } else {
      status = InventoryStatus.IN_STOCK;
    }

    items.push({
      id: `inv-${String(i).padStart(3, '0')}`,
      productId: `prod-${String(i).padStart(3, '0')}`,
      productCode: `P${String(i).padStart(5, '0')}`,
      productName: `商品${i}`,
      productCategory: categories[Math.floor(Math.random() * categories.length)],
      productSpec: `规格${i}`,
      unit: units[Math.floor(Math.random() * units.length)],
      locationId: location.id,
      locationName: location.name,
      currentStock,
      minStock,
      maxStock,
      safeStock,
      averageCost: Math.floor(Math.random() * 100) + 10,
      totalValue: currentStock * (Math.floor(Math.random() * 100) + 10),
      status,
      lastInboundDate: '2024-01-15T10:30:00Z',
      lastOutboundDate: '2024-01-10T14:20:00Z',
      lastUpdated: new Date().toISOString(),
      remark: i % 5 === 0 ? `备注信息${i}` : undefined
    });
  }

  return items;
};

/**
 * 生成mock操作记录
 */
const generateMockOperations = (): InventoryOperation[] => {
  const operations: InventoryOperation[] = [];
  const operationTypes = Object.values(InventoryOperationType);
  const reasons = [
    '采购入库',
    '销售出库',
    '调拨入库',
    '调拨出库',
    '盘点调整',
    '损坏报废',
    '客户退货'
  ];

  for (let i = 1; i <= 100; i++) {
    const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const beforeStock = Math.floor(Math.random() * 500);
    const afterStock = operationType.includes('IN') || operationType === 'stock_in'
      ? beforeStock + quantity
      : beforeStock - quantity;

    operations.push({
      id: `op-${String(i).padStart(4, '0')}`,
      inventoryItemId: `inv-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
      operationType,
      quantity: operationType.includes('OUT') || operationType === 'stock_out' ? -quantity : quantity,
      unit: '个',
      unitPrice: Math.floor(Math.random() * 100) + 10,
      totalPrice: quantity * (Math.floor(Math.random() * 100) + 10),
      beforeStock,
      afterStock,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      referenceId: Math.random() > 0.5 ? `REF-${String(i).padStart(6, '0')}` : undefined,
      referenceType: Math.random() > 0.5 ? 'purchase_order' : undefined,
      operatorId: 'user-001',
      operatorName: '操作员',
      operationDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      remark: Math.random() > 0.7 ? `操作备注${i}` : undefined
    });
  }

  return operations.sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime());
};

/**
 * 生成mock统计数据
 */
const generateMockStatistics = (): InventoryStatistics => {
  const inventoryItems = generateMockInventoryItems();

  return {
    totalItems: inventoryItems.length,
    totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
    totalCategories: 5,
    totalLocations: 5,
    inStockCount: inventoryItems.filter(item => item.status === InventoryStatus.IN_STOCK).length,
    lowStockCount: inventoryItems.filter(item => item.status === InventoryStatus.LOW_STOCK).length,
    outOfStockCount: inventoryItems.filter(item => item.status === InventoryStatus.OUT_OF_STOCK).length,
    lowStockRate: Math.floor(Math.random() * 20) + 5,
    stockTurnoverRate: Math.floor(Math.random() * 8) + 2,
    averageInventoryDays: Math.floor(Math.random() * 60) + 30,
    categoryStats: [
      {
        categoryId: 'cat-001',
        categoryName: '食品饮料',
        itemCount: 15,
        totalValue: 150000,
        lowStockCount: 3
      },
      {
        categoryId: 'cat-002',
        categoryName: '日常用品',
        itemCount: 12,
        totalValue: 120000,
        lowStockCount: 2
      },
      {
        categoryId: 'cat-003',
        categoryName: '清洁用品',
        itemCount: 10,
        totalValue: 80000,
        lowStockCount: 1
      },
      {
        categoryId: 'cat-004',
        categoryName: '办公用品',
        itemCount: 8,
        totalValue: 60000,
        lowStockCount: 0
      },
      {
        categoryId: 'cat-005',
        categoryName: '设备耗材',
        itemCount: 5,
        totalValue: 40000,
        lowStockCount: 1
      }
    ],
    locationStats: [
      {
        locationId: 'loc-001',
        locationName: '主仓库-A区',
        itemCount: 20,
        totalValue: 200000,
        utilizationRate: 75
      },
      {
        locationId: 'loc-002',
        locationName: '主仓库-B区',
        itemCount: 15,
        totalValue: 150000,
        utilizationRate: 60
      },
      {
        locationId: 'loc-003',
        locationName: '冷库',
        itemCount: 8,
        totalValue: 80000,
        utilizationRate: 85
      },
      {
        locationId: 'loc-004',
        locationName: '货架A-1层',
        itemCount: 5,
        totalValue: 50000,
        utilizationRate: 40
      },
      {
        locationId: 'loc-005',
        locationName: '货架B-2层',
        itemCount: 2,
        totalValue: 20000,
        utilizationRate: 30
      }
    ],
    recentTrends: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: formatDate(date, 'YYYY-MM-DD'),
        inboundCount: Math.floor(Math.random() * 100) + 50,
        outboundCount: Math.floor(Math.random() * 80) + 30,
        netChange: Math.floor(Math.random() * 40) - 20
      };
    })
  };
};

// ===== State Management =====

interface InventoryState {
  // 数据状态
  inventoryItems: InventoryItem[];
  currentInventoryItem: InventoryItem | null;
  locations: Location[];
  operations: InventoryOperation[];
  statistics: InventoryStatistics | null;
  alerts: InventoryAlert[];
  checks: InventoryCheck[];

  // 查询状态
  queryParams: InventoryQueryParams;
  filter: InventoryFilter;

  // UI状态
  loading: boolean;
  error: string | null;

  // 选中状态
  selectedItems: string[];
  selectedOperations: string[];

  // 编辑状态
  isEditing: boolean;
  isCreating: boolean;
  showDetail: boolean;
  showOperationHistory: boolean;

  // 表单状态
  formMode: 'create' | 'edit' | 'adjustment' | 'transfer';
  formInitialData: InventoryItem | null;

  // 分页状态
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

interface InventoryActions {
  // 基础CRUD操作
  fetchInventoryItems: () => Promise<void>;
  fetchInventoryItemById: (id: string) => Promise<void>;
  createInventoryItem: (params: CreateInventoryItemParams) => Promise<string>;
  updateInventoryItem: (id: string, params: UpdateInventoryItemParams) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  batchDeleteInventoryItems: (ids: string[]) => Promise<void>;

  // 库存操作
  performInventoryOperation: (params: InventoryOperationParams) => Promise<void>;
  batchInventoryOperation: (operations: InventoryOperationParams[]) => Promise<void>;

  // 库存调整
  performInventoryAdjustment: (params: InventoryAdjustmentParams) => Promise<void>;

  // 库存转移
  transferInventory: (params: InventoryTransferParams) => Promise<void>;

  // 位置管理
  fetchLocations: () => Promise<void>;
  createLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLocation: (id: string, location: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;

  // 操作记录
  fetchOperations: (inventoryItemId?: string) => Promise<void>;

  // 统计数据
  fetchStatistics: () => Promise<void>;
  refreshStatistics: () => Promise<void>;

  // 预警管理
  fetchAlerts: () => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;

  // 盘点管理
  fetchChecks: () => Promise<void>;
  createCheck: (check: Omit<InventoryCheck, 'id' | 'checkNumber' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCheck: (id: string, check: Partial<InventoryCheck>) => Promise<void>;
  deleteCheck: (id: string) => Promise<void>;

  // 查询和筛选
  setQueryParams: (params: Partial<InventoryQueryParams>) => void;
  setFilter: (filter: Partial<InventoryFilter>) => void;
  resetFilters: () => void;

  // 选中和编辑状态
  setSelectedItems: (ids: string[]) => void;
  toggleItemSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  showEditForm: (item: InventoryItem) => void;
  showCreateForm: () => void;
  showDetail: (item: InventoryItem) => void;
  hideForm: () => void;
  hideDetail: () => void;

  // 数据同步（与采购、收货、调拨模块联动）
  syncWithReceipt: (receiptId: string) => Promise<void>;
  syncWithTransfer: (transferId: string) => Promise<void>;

  // 工具方法
  exportInventoryData: (format: 'excel' | 'csv') => Promise<void>;
  importInventoryData: (file: File) => Promise<void>;
  generateInventoryReport: () => Promise<void>;
}

// ===== Store Definition =====

export const useInventoryStore = create<InventoryState & InventoryActions>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      inventoryItems: [],
      currentInventoryItem: null,
      locations: [],
      operations: [],
      statistics: null,
      alerts: [],
      checks: [],

      queryParams: {
        page: 1,
        pageSize: 20,
        sortBy: 'lastUpdated',
        sortOrder: 'desc'
      },

      filter: {},

      loading: false,
      error: null,

      selectedItems: [],
      selectedOperations: [],

      isEditing: false,
      isCreating: false,
      showDetail: false,
      showOperationHistory: false,

      formMode: 'create',
      formInitialData: null,

      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },

      // ===== Actions Implementation =====

      /**
       * 获取库存列表
       */
      fetchInventoryItems: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          const items = generateMockInventoryItems();
          const filteredItems = get().applyFilters(items);

          set(state => {
            state.inventoryItems = filteredItems;
            state.pagination.total = filteredItems.length;
            state.loading = false;
          });

          // 刷新统计数据
          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '获取库存列表失败';
            state.loading = false;
          });
        }
      },

      /**
       * 根据ID获取库存项
       */
      fetchInventoryItemById: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 200));

          const item = get().inventoryItems.find(item => item.id === id);

          set(state => {
            state.currentInventoryItem = item || null;
            state.loading = false;
          });

          if (!item) {
            throw new Error('库存项不存在');
          }
        } catch (error) {
          set(state => {
            state.error = '获取库存项失败';
            state.loading = false;
          });
        }
      },

      /**
       * 创建库存项
       */
      createInventoryItem: async (params: CreateInventoryItemParams) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));

          const location = get().locations.find(loc => loc.id === params.locationId);

          const newItem: InventoryItem = {
            id: generateId(),
            productId: params.productId,
            productCode: `P${String(get().inventoryItems.length + 1).padStart(5, '0')}`,
            productName: `商品${get().inventoryItems.length + 1}`,
            productCategory: '未分类',
            productSpec: '默认规格',
            unit: '个',
            locationId: params.locationId,
            locationName: location?.name || '',
            currentStock: params.initialStock,
            minStock: params.minStock,
            maxStock: params.maxStock,
            safeStock: params.safeStock,
            averageCost: params.averageCost,
            totalValue: params.initialStock * params.averageCost,
            status: params.initialStock === 0 ? InventoryStatus.OUT_OF_STOCK : InventoryStatus.IN_STOCK,
            lastInboundDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            remark: params.remark
          };

          // 创建初始入库操作记录
          const operation: InventoryOperation = {
            id: generateId(),
            inventoryItemId: newItem.id,
            operationType: InventoryOperationType.STOCK_IN,
            quantity: params.initialStock,
            unit: newItem.unit,
            unitPrice: params.averageCost,
            totalPrice: newItem.totalValue,
            beforeStock: 0,
            afterStock: params.initialStock,
            reason: '初始化库存',
            operatorId: 'user-001',
            operatorName: '系统管理员',
            operationDate: new Date().toISOString()
          };

          set(state => {
            state.inventoryItems.unshift(newItem);
            state.operations.unshift(operation);
            state.loading = false;
          });

          await get().refreshStatistics();

          return newItem.id;
        } catch (error) {
          set(state => {
            state.error = '创建库存项失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 更新库存项
       */
      updateInventoryItem: async (id: string, params: UpdateInventoryItemParams) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 400));

          set(state => {
            const itemIndex = state.inventoryItems.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
              const item = state.inventoryItems[itemIndex];
              const updatedItem = {
                ...item,
                ...params,
                totalValue: item.currentStock * (params.averageCost || item.averageCost),
                locationName: params.locationId
                  ? state.locations.find(loc => loc.id === params.locationId)?.name || item.locationName
                  : item.locationName,
                lastUpdated: new Date().toISOString()
              };

              // 更新状态
              if (params.minStock !== undefined || params.maxStock !== undefined) {
                const minStock = params.minStock ?? item.minStock;
                const maxStock = params.maxStock ?? item.maxStock;

                if (updatedItem.currentStock === 0) {
                  updatedItem.status = InventoryStatus.OUT_OF_STOCK;
                } else if (updatedItem.currentStock <= minStock) {
                  updatedItem.status = InventoryStatus.LOW_STOCK;
                } else {
                  updatedItem.status = InventoryStatus.IN_STOCK;
                }
              }

              state.inventoryItems[itemIndex] = updatedItem;
              if (state.currentInventoryItem?.id === id) {
                state.currentInventoryItem = updatedItem;
              }
            }

            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '更新库存项失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 删除库存项
       */
      deleteInventoryItem: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => {
            state.inventoryItems = state.inventoryItems.filter(item => item.id !== id);
            state.operations = state.operations.filter(op => op.inventoryItemId !== id);
            state.selectedItems = state.selectedItems.filter(selectedId => selectedId !== id);
            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '删除库存项失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 批量删除库存项
       */
      batchDeleteInventoryItems: async (ids: string[]) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            state.inventoryItems = state.inventoryItems.filter(item => !ids.includes(item.id));
            state.operations = state.operations.filter(op => !ids.includes(op.inventoryItemId));
            state.selectedItems = [];
            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '批量删除失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 执行库存操作
       */
      performInventoryOperation: async (params: InventoryOperationParams) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 400));

          set(state => {
            const itemIndex = state.inventoryItems.findIndex(item => item.id === params.inventoryItemId);
            if (itemIndex !== -1) {
              const item = state.inventoryItems[itemIndex];
              const beforeStock = item.currentStock;
              const afterStock = beforeStock + params.quantity;

              // 更新库存数量和状态
              let newStatus: InventoryStatus;
              if (afterStock === 0) {
                newStatus = InventoryStatus.OUT_OF_STOCK;
              } else if (afterStock <= item.minStock) {
                newStatus = InventoryStatus.LOW_STOCK;
              } else {
                newStatus = InventoryStatus.IN_STOCK;
              }

              state.inventoryItems[itemIndex] = {
                ...item,
                currentStock: afterStock,
                totalValue: afterStock * item.averageCost,
                status: newStatus,
                lastOutboundDate: params.quantity < 0 ? new Date().toISOString() : item.lastOutboundDate,
                lastInboundDate: params.quantity > 0 ? new Date().toISOString() : item.lastInboundDate,
                lastUpdated: new Date().toISOString()
              };

              // 创建操作记录
              const operation: InventoryOperation = {
                id: generateId(),
                inventoryItemId: params.inventoryItemId,
                operationType: params.operationType,
                quantity: params.quantity,
                unit: item.unit,
                unitPrice: params.unitPrice,
                totalPrice: Math.abs(params.quantity) * params.unitPrice,
                beforeStock,
                afterStock,
                reason: params.reason,
                referenceId: params.referenceId,
                referenceType: params.referenceType,
                operatorId: 'user-001',
                operatorName: '操作员',
                operationDate: new Date().toISOString(),
                remark: params.remark,
                attachments: params.attachments
              };

              state.operations.unshift(operation);

              // 更新当前选中项
              if (state.currentInventoryItem?.id === params.inventoryItemId) {
                state.currentInventoryItem = state.inventoryItems[itemIndex];
              }
            }

            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '库存操作失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 批量库存操作
       */
      batchInventoryOperation: async (operations: InventoryOperationParams[]) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 800));

          set(state => {
            operations.forEach(params => {
              const itemIndex = state.inventoryItems.findIndex(item => item.id === params.inventoryItemId);
              if (itemIndex !== -1) {
                const item = state.inventoryItems[itemIndex];
                const beforeStock = item.currentStock;
                const afterStock = beforeStock + params.quantity;

                // 更新库存数量和状态
                let newStatus: InventoryStatus;
                if (afterStock === 0) {
                  newStatus = InventoryStatus.OUT_OF_STOCK;
                } else if (afterStock <= item.minStock) {
                  newStatus = InventoryStatus.LOW_STOCK;
                } else {
                  newStatus = InventoryStatus.IN_STOCK;
                }

                state.inventoryItems[itemIndex] = {
                  ...item,
                  currentStock: afterStock,
                  totalValue: afterStock * item.averageCost,
                  status: newStatus,
                  lastUpdated: new Date().toISOString()
                };

                // 创建操作记录
                const operation: InventoryOperation = {
                  id: generateId(),
                  inventoryItemId: params.inventoryItemId,
                  operationType: params.operationType,
                  quantity: params.quantity,
                  unit: item.unit,
                  unitPrice: params.unitPrice,
                  totalPrice: Math.abs(params.quantity) * params.unitPrice,
                  beforeStock,
                  afterStock,
                  reason: params.reason,
                  operatorId: 'user-001',
                  operatorName: '操作员',
                  operationDate: new Date().toISOString(),
                  remark: params.remark
                };

                state.operations.unshift(operation);
              }
            });

            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '批量操作失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 库存调整
       */
      performInventoryAdjustment: async (params: InventoryAdjustmentParams) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 600));

          set(state => {
            params.adjustmentItems.forEach(adjustmentItem => {
              const itemIndex = state.inventoryItems.findIndex(item => item.id === adjustmentItem.inventoryItemId);
              if (itemIndex !== -1) {
                const item = state.inventoryItems[itemIndex];
                const systemStock = adjustmentItem.systemStock;
                const actualStock = adjustmentItem.actualStock;
                const discrepancy = actualStock - systemStock;

                // 更新库存数量
                let newStatus: InventoryStatus;
                if (actualStock === 0) {
                  newStatus = InventoryStatus.OUT_OF_STOCK;
                } else if (actualStock <= item.minStock) {
                  newStatus = InventoryStatus.LOW_STOCK;
                } else {
                  newStatus = InventoryStatus.IN_STOCK;
                }

                state.inventoryItems[itemIndex] = {
                  ...item,
                  currentStock: actualStock,
                  totalValue: actualStock * item.averageCost,
                  status: newStatus,
                  lastUpdated: new Date().toISOString()
                };

                // 创建盘点调整操作记录
                const operation: InventoryOperation = {
                  id: generateId(),
                  inventoryItemId: adjustmentItem.inventoryItemId,
                  operationType: InventoryOperationType.ADJUSTMENT,
                  quantity: discrepancy,
                  unit: item.unit,
                  unitPrice: adjustmentItem.unitPrice || item.averageCost,
                  totalPrice: Math.abs(discrepancy) * (adjustmentItem.unitPrice || item.averageCost),
                  beforeStock: systemStock,
                  afterStock: actualStock,
                  reason: `盘点调整: ${adjustmentItem.adjustmentReason}`,
                  operatorId: 'user-001',
                  operatorName: '盘点员',
                  operationDate: new Date().toISOString(),
                  remark: adjustmentItem.notes
                };

                state.operations.unshift(operation);
              }
            });

            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '库存调整失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 库存转移
       */
      transferInventory: async (params: InventoryTransferParams) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 700));

          set(state => {
            const fromLocation = state.locations.find(loc => loc.id === params.fromLocationId);
            const toLocation = state.locations.find(loc => loc.id === params.toLocationId);

            params.transferItems.forEach(transferItem => {
              const itemIndex = state.inventoryItems.findIndex(item => item.id === transferItem.inventoryItemId);
              if (itemIndex !== -1) {
                const item = state.inventoryItems[itemIndex];

                // 调拨出库
                const outOperation: InventoryOperation = {
                  id: generateId(),
                  inventoryItemId: transferItem.inventoryItemId,
                  operationType: InventoryOperationType.TRANSFER_OUT,
                  quantity: -transferItem.quantity,
                  unit: item.unit,
                  unitPrice: item.averageCost,
                  totalPrice: transferItem.quantity * item.averageCost,
                  beforeStock: item.currentStock,
                  afterStock: item.currentStock - transferItem.quantity,
                  reason: `调拨至${toLocation?.name || '目标位置'}: ${params.reason}`,
                  referenceId: generateId(),
                  referenceType: 'transfer',
                  operatorId: 'user-001',
                  operatorName: '操作员',
                  operationDate: new Date().toISOString(),
                  remark: transferItem.remark
                };

                state.operations.unshift(outOperation);

                // 更新库存
                const afterStock = item.currentStock - transferItem.quantity;
                let newStatus: InventoryStatus;
                if (afterStock === 0) {
                  newStatus = InventoryStatus.OUT_OF_STOCK;
                } else if (afterStock <= item.minStock) {
                  newStatus = InventoryStatus.LOW_STOCK;
                } else {
                  newStatus = InventoryStatus.IN_STOCK;
                }

                state.inventoryItems[itemIndex] = {
                  ...item,
                  currentStock: afterStock,
                  totalValue: afterStock * item.averageCost,
                  status: newStatus,
                  lastUpdated: new Date().toISOString()
                };

                // 如果目标位置不同且库存项需要迁移，创建新的库存项
                if (item.locationId !== params.toLocationId) {
                  const newInventoryItem: InventoryItem = {
                    ...item,
                    id: generateId(),
                    locationId: params.toLocationId,
                    locationName: toLocation?.name || '',
                    currentStock: transferItem.quantity,
                    status: transferItem.quantity <= (item.minStock / 2) ? InventoryStatus.LOW_STOCK : InventoryStatus.IN_STOCK,
                    totalValue: transferItem.quantity * item.averageCost,
                    lastInboundDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                  };

                  state.inventoryItems.push(newInventoryItem);

                  // 调拨入库操作记录
                  const inOperation: InventoryOperation = {
                    id: generateId(),
                    inventoryItemId: newInventoryItem.id,
                    operationType: InventoryOperationType.TRANSFER_IN,
                    quantity: transferItem.quantity,
                    unit: item.unit,
                    unitPrice: item.averageCost,
                    totalPrice: transferItem.quantity * item.averageCost,
                    beforeStock: 0,
                    afterStock: transferItem.quantity,
                    reason: `从${fromLocation?.name || '源位置'}调拨: ${params.reason}`,
                    referenceId: outOperation.referenceId,
                    referenceType: 'transfer',
                    operatorId: 'user-001',
                    operatorName: '操作员',
                    operationDate: new Date().toISOString(),
                    remark: transferItem.remark
                  };

                  state.operations.unshift(inOperation);
                }
              }
            });

            state.loading = false;
          });

          await get().refreshStatistics();
        } catch (error) {
          set(state => {
            state.error = '库存转移失败';
            state.loading = false;
          });
          throw error;
        }
      },

      /**
       * 获取位置列表
       */
      fetchLocations: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 200));

          const locations = generateMockLocations();

          set(state => {
            state.locations = locations;
          });
        } catch (error) {
          set(state => {
            state.error = '获取位置列表失败';
          });
        }
      },

      /**
       * 创建位置
       */
      createLocation: async (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          const newLocation: Location = {
            ...location,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set(state => {
            state.locations.push(newLocation);
          });

          return newLocation.id;
        } catch (error) {
          set(state => {
            state.error = '创建位置失败';
          });
          throw error;
        }
      },

      /**
       * 更新位置
       */
      updateLocation: async (id: string, location: Partial<Location>) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => {
            const index = state.locations.findIndex(loc => loc.id === id);
            if (index !== -1) {
              state.locations[index] = {
                ...state.locations[index],
                ...location,
                updatedAt: new Date().toISOString()
              };
            }
          });
        } catch (error) {
          set(state => {
            state.error = '更新位置失败';
          });
          throw error;
        }
      },

      /**
       * 删除位置
       */
      deleteLocation: async (id: string) => {
        try {
          // 检查是否有库存项使用该位置
          const hasInventory = get().inventoryItems.some(item => item.locationId === id);
          if (hasInventory) {
            throw new Error('该位置下还有库存项，无法删除');
          }

          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => {
            state.locations = state.locations.filter(loc => loc.id !== id);
          });
        } catch (error) {
          set(state => {
            state.error = '删除位置失败';
          });
          throw error;
        }
      },

      /**
       * 获取操作记录
       */
      fetchOperations: async (inventoryItemId?: string) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 200));

          let operations = generateMockOperations();

          if (inventoryItemId) {
            operations = operations.filter(op => op.inventoryItemId === inventoryItemId);
          }

          set(state => {
            state.operations = operations;
          });
        } catch (error) {
          set(state => {
            state.error = '获取操作记录失败';
          });
        }
      },

      /**
       * 获取统计数据
       */
      fetchStatistics: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          const statistics = generateMockStatistics();

          set(state => {
            state.statistics = statistics;
          });
        } catch (error) {
          set(state => {
            state.error = '获取统计数据失败';
          });
        }
      },

      /**
       * 刷新统计数据
       */
      refreshStatistics: async () => {
        await get().fetchStatistics();
      },

      /**
       * 获取预警信息
       */
      fetchAlerts: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 200));

          const items = get().inventoryItems;
          const alerts: InventoryAlert[] = [];

          // 生成低库存预警
          items.filter(item => item.status === InventoryStatus.LOW_STOCK).forEach(item => {
            alerts.push({
              id: generateId(),
              inventoryItemId: item.id,
              alertType: 'low_stock',
              severity: item.currentStock === 0 ? 'critical' : item.currentStock <= item.minStock / 2 ? 'high' : 'medium',
              message: `${item.productName} 库存不足，当前库存: ${item.currentStock}，最小库存: ${item.minStock}`,
              currentValue: item.currentStock,
              thresholdValue: item.minStock,
              createdAt: new Date().toISOString(),
              isRead: false
            });
          });

          // 生成无库存预警
          items.filter(item => item.status === InventoryStatus.OUT_OF_STOCK).forEach(item => {
            alerts.push({
              id: generateId(),
              inventoryItemId: item.id,
              alertType: 'out_of_stock',
              severity: 'critical',
              message: `${item.productName} 已无库存`,
              currentValue: 0,
              thresholdValue: item.minStock,
              createdAt: new Date().toISOString(),
              isRead: false
            });
          });

          set(state => {
            state.alerts = alerts.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        } catch (error) {
          set(state => {
            state.error = '获取预警信息失败';
          });
        }
      },

      /**
       * 标记预警为已读
       */
      markAlertAsRead: async (id: string) => {
        set(state => {
          const alert = state.alerts.find(a => a.id === id);
          if (alert) {
            alert.isRead = true;
            alert.resolvedAt = new Date().toISOString();
          }
        });
      },

      /**
       * 标记所有预警为已读
       */
      markAllAlertsAsRead: async () => {
        set(state => {
          state.alerts.forEach(alert => {
            if (!alert.isRead) {
              alert.isRead = true;
              alert.resolvedAt = new Date().toISOString();
            }
          });
        });
      },

      /**
       * 获取盘点记录
       */
      fetchChecks: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 200));

          const checks: InventoryCheck[] = [
            {
              id: 'check-001',
              checkNumber: generateOrderNumber('CHK'),
              title: '2024年第一季度盘点',
              description: '对主仓库进行全面盘点',
              locationIds: ['loc-001', 'loc-002'],
              checkType: 'full',
              status: 'completed',
              planDate: '2024-01-15T00:00:00Z',
              actualDate: '2024-01-20T00:00:00Z',
              checkerId: 'user-001',
              checkerName: '张三',
              supervisorId: 'user-002',
              supervisorName: '李四',
              checkItems: [],
              totalItems: 50,
              checkedItems: 50,
              discrepancyCount: 3,
              totalDiscrepancyValue: 1500,
              createdAt: '2024-01-15T00:00:00Z',
              updatedAt: '2024-01-20T00:00:00Z',
              completedAt: '2024-01-20T00:00:00Z',
              remark: '盘点完成，发现3个差异'
            },
            {
              id: 'check-002',
              checkNumber: generateOrderNumber('CHK'),
              title: '冷库专项盘点',
              description: '对冷藏库进行专项盘点',
              locationIds: ['loc-003'],
              checkType: 'partial',
              status: 'checking',
              planDate: '2024-01-25T00:00:00Z',
              checkerId: 'user-003',
              checkerName: '王五',
              checkItems: [],
              totalItems: 20,
              checkedItems: 12,
              discrepancyCount: 0,
              totalDiscrepancyValue: 0,
              createdAt: '2024-01-25T00:00:00Z',
              updatedAt: '2024-01-26T10:30:00Z',
              remark: '正在进行中'
            }
          ];

          set(state => {
            state.checks = checks;
          });
        } catch (error) {
          set(state => {
            state.error = '获取盘点记录失败';
          });
        }
      },

      /**
       * 创建盘点记录
       */
      createCheck: async (check: Omit<InventoryCheck, 'id' | 'checkNumber' | 'status' | 'createdAt' | 'updatedAt'>) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));

          const newCheck: InventoryCheck = {
            ...check,
            id: generateId(),
            checkNumber: generateOrderNumber('CHK'),
            status: 'draft',
            checkItems: [],
            totalItems: 0,
            checkedItems: 0,
            discrepancyCount: 0,
            totalDiscrepancyValue: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set(state => {
            state.checks.unshift(newCheck);
          });

          return newCheck.id;
        } catch (error) {
          set(state => {
            state.error = '创建盘点记录失败';
          });
          throw error;
        }
      },

      /**
       * 更新盘点记录
       */
      updateCheck: async (id: string, check: Partial<InventoryCheck>) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 400));

          set(state => {
            const index = state.checks.findIndex(c => c.id === id);
            if (index !== -1) {
              state.checks[index] = {
                ...state.checks[index],
                ...check,
                updatedAt: new Date().toISOString()
              };
            }
          });
        } catch (error) {
          set(state => {
            state.error = '更新盘点记录失败';
          });
          throw error;
        }
      },

      /**
       * 删除盘点记录
       */
      deleteCheck: async (id: string) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 300));

          set(state => {
            state.checks = state.checks.filter(check => check.id !== id);
          });
        } catch (error) {
          set(state => {
            state.error = '删除盘点记录失败';
          });
          throw error;
        }
      },

      /**
       * 设置查询参数
       */
      setQueryParams: (params: Partial<InventoryQueryParams>) => {
        set(state => {
          state.queryParams = { ...state.queryParams, ...params };
          state.pagination.current = params.page || 1;
        });
      },

      /**
       * 设置筛选条件
       */
      setFilter: (filter: Partial<InventoryFilter>) => {
        set(state => {
          state.filter = { ...state.filter, ...filter };
        });
      },

      /**
       * 重置筛选条件
       */
      resetFilters: () => {
        set(state => {
          state.filter = {};
          state.queryParams = {
            page: 1,
            pageSize: 20,
            sortBy: 'lastUpdated',
            sortOrder: 'desc'
          };
        });
      },

      /**
       * 设置选中项
       */
      setSelectedItems: (ids: string[]) => {
        set(state => {
          state.selectedItems = ids;
        });
      },

      /**
       * 切换选中状态
       */
      toggleItemSelection: (id: string) => {
        set(state => {
          const index = state.selectedItems.indexOf(id);
          if (index === -1) {
            state.selectedItems.push(id);
          } else {
            state.selectedItems.splice(index, 1);
          }
        });
      },

      /**
       * 全选
       */
      selectAll: () => {
        set(state => {
          state.selectedItems = get().applyFilters(state.inventoryItems).map(item => item.id);
        });
      },

      /**
       * 清除选择
       */
      clearSelection: () => {
        set(state => {
          state.selectedItems = [];
          state.selectedOperations = [];
        });
      },

      /**
       * 显示编辑表单
       */
      showEditForm: (item: InventoryItem) => {
        set(state => {
          state.formMode = 'edit';
          state.formInitialData = item;
          state.isEditing = true;
          state.isCreating = false;
          state.showDetail = false;
        });
      },

      /**
       * 显示创建表单
       */
      showCreateForm: () => {
        set(state => {
          state.formMode = 'create';
          state.formInitialData = null;
          state.isEditing = false;
          state.isCreating = true;
          state.showDetail = false;
        });
      },

      /**
       * 显示详情
       */
      showDetail: (item: InventoryItem) => {
        set(state => {
          state.currentInventoryItem = item;
          state.showDetail = true;
          state.showOperationHistory = false;
          state.isEditing = false;
          state.isCreating = false;
        });
      },

      /**
       * 隐藏表单
       */
      hideForm: () => {
        set(state => {
          state.isEditing = false;
          state.isCreating = false;
          state.formInitialData = null;
        });
      },

      /**
       * 隐藏详情
       */
      hideDetail: () => {
        set(state => {
          state.showDetail = false;
          state.showOperationHistory = false;
          state.currentInventoryItem = null;
        });
      },

      /**
       * 与收货管理同步
       */
      syncWithReceipt: async (receiptId: string) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));

          // 根据收货单更新库存
          const receiptOperations = [
            {
              inventoryItemId: 'inv-001',
              operationType: InventoryOperationType.STOCK_IN,
              quantity: 50,
              unitPrice: 25.5,
              reason: '采购入库',
              referenceId: receiptId,
              referenceType: 'receipt'
            }
          ];

          await get().batchInventoryOperation(receiptOperations);
        } catch (error) {
          set(state => {
            state.error = '同步收货数据失败';
          });
          throw error;
        }
      },

      /**
       * 与调拨管理同步
       */
      syncWithTransfer: async (transferId: string) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));

          // 根据调拨单更新库存
          const transferParams: InventoryTransferParams = {
            fromLocationId: 'loc-001',
            toLocationId: 'loc-002',
            transferItems: [
              {
                inventoryItemId: 'inv-001',
                quantity: 30,
                remark: '调拨到B区'
              }
            ],
            reason: '位置调整',
            expectedDate: new Date().toISOString(),
            remark: '常规调拨'
          };

          await get().transferInventory(transferParams);
        } catch (error) {
          set(state => {
            state.error = '同步调拨数据失败';
          });
          throw error;
        }
      },

      /**
       * 导出库存数据
       */
      exportInventoryData: async (format: 'excel' | 'csv') => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));

          const data = get().applyFilters(get().inventoryItems);
          const csvContent = data.map(item => [
            item.productCode,
            item.productName,
            item.productCategory,
            item.productSpec,
            item.unit,
            item.locationName,
            item.currentStock.toString(),
            item.minStock.toString(),
            item.maxStock.toString(),
            formatCurrency(item.totalValue),
            item.status,
            formatDate(item.lastUpdated)
          ]).join(',');

          // 创建下载链接
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `inventory_${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          link.click();
          URL.revokeObjectURL(url);

          console.log(`导出库存数据成功，格式: ${format}`);
        } catch (error) {
          set(state => {
            state.error = '导出数据失败';
          });
          throw error;
        }
      },

      /**
       * 导入库存数据
       */
      importInventoryData: async (file: File) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 这里应该解析CSV/Excel文件并导入数据
          console.log('导入库存数据:', file.name);

          await get().fetchInventoryItems();
        } catch (error) {
          set(state => {
            state.error = '导入数据失败';
          });
          throw error;
        }
      },

      /**
       * 生成库存报表
       */
      generateInventoryReport: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1500));

          const statistics = get().statistics;

          // 生成报表内容
          const reportContent = `
库存统计报表
生成时间: ${formatDate(new Date())}

总商品数: ${statistics?.totalItems || 0}
总库存价值: ${formatCurrency(statistics?.totalValue || 0)}
有库存商品: ${statistics?.inStockCount || 0}
库存不足商品: ${statistics?.lowStockCount || 0}
无库存商品: ${statistics?.outOfStockCount || 0}
库存不足率: ${statistics?.lowStockRate || 0}%
库存周转率: ${statistics?.stockTurnoverRate || 0}
平均库存天数: ${statistics?.averageInventoryDays || 0}天

分类统计:
${statistics?.categoryStats?.map(cat =>
  `${cat.categoryName}: ${cat.itemCount}项，价值${formatCurrency(cat.totalValue)}，预警${cat.lowStockCount}项`
).join('\n') || ''}

位置统计:
${statistics?.locationStats?.map(loc =>
  `${loc.locationName}: ${loc.itemCount}项，价值${formatCurrency(loc.totalValue)}，利用率${loc.utilizationRate}%`
).join('\n') || ''}
          `;

          console.log('生成库存报表:', reportContent);

          // 创建下载
          const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `inventory_report_${formatDate(new Date(), 'YYYY-MM-DD')}.txt`;
          link.click();
          URL.revokeObjectURL(url);

          console.log('库存报表生成成功');
        } catch (error) {
          set(state => {
            state.error = '生成报表失败';
          });
          throw error;
        }
      },

      /**
       * 应用筛选条件
       */
      applyFilters: (items: InventoryItem[]) => {
        const { filter } = get();

        return items.filter(item => {
          // 关键词搜索
          if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            if (
              !item.productCode.toLowerCase().includes(keyword) &&
              !item.productName.toLowerCase().includes(keyword) &&
              !item.productCategory.toLowerCase().includes(keyword)
            ) {
              return false;
            }
          }

          // 分类筛选
          if (filter.categoryId && item.productCategory !== filter.categoryId) {
            return false;
          }

          // 位置筛选
          if (filter.locationId && item.locationId !== filter.locationId) {
            return false;
          }

          // 状态筛选
          if (filter.status && item.status !== filter.status) {
            return false;
          }

          // 库存不足筛选
          if (filter.lowStock && item.status !== InventoryStatus.LOW_STOCK && item.status !== InventoryStatus.OUT_OF_STOCK) {
            return false;
          }

          // 时间范围筛选
          if (filter.dateRange) {
            const itemDate = new Date(item.lastUpdated);
            const startDate = new Date(filter.dateRange[0]);
            const endDate = new Date(filter.dateRange[1]);
            if (itemDate < startDate || itemDate > endDate) {
              return false;
            }
          }

          return true;
        });
      }
    })),
    {
      name: 'inventory-store',
      version: 1,
      partialize: (state) => ({
        inventoryItems: state.inventoryItems.slice(0, 100),
        operations: state.operations.slice(0, 100),
        alerts: state.alerts.slice(0, 50),
        checks: state.checks.slice(0, 20),
        locations: state.locations,
        statistics: state.statistics
      })
    }
  )
);

// ===== Selectors =====

export const useInventorySelectors = {
  // 基础数据选择器
  getInventoryItems: (state: InventoryState) => state.inventoryItems,
  getLocations: (state: InventoryState) => state.locations,
  getOperations: (state: InventoryState) => state.operations,
  getStatistics: (state: InventoryState) => state.statistics,
  getAlerts: (state: InventoryState) => state.alerts,
  getChecks: (state: InventoryState) => state.checks,

  // UI状态选择器
  getLoading: (state: InventoryState) => state.loading,
  getError: (state: InventoryState) => state.error,
  getSelectedItems: (state: InventoryState) => state.selectedItems,
  getSelectedCount: (state: InventoryState) => state.selectedItems.length,

  // 表单状态选择器
  getFormMode: (state: InventoryState) => state.formMode,
  getFormInitialData: (state: InventoryState) => state.formInitialData,
  getIsEditing: (state: InventoryState) => state.isEditing,
  getIsCreating: (state: InventoryState) => state.isCreating,

  // 分页选择器
  getPagination: (state: InventoryState) => state.pagination,
  getCurrentPage: (state: InventoryState) => state.pagination.current,
  getPageSize: (state: State) => state.pagination.pageSize,

  // 详情状态选择器
  getCurrentInventoryItem: (state: InventoryState) => state.currentInventoryItem,
  getShowDetail: (state: InventoryState) => state.showDetail,
  getShowOperationHistory: (state: InventoryState) => state.showOperationHistory,

  // 筛选选择器
  getFilter: (state: InventoryState) => state.filter,
  getQueryParams: (state: InventoryState) => state.queryParams,

  // 计算属性选择器
  getFilteredItems: (state: InventoryState) => {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.applyFilters(state.inventoryItems);
  },

  getLowStockItems: (state: InventoryState) => {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.applyFilters(state.inventoryItems).filter(
      item => item.status === InventoryStatus.LOW_STOCK || item.status === InventoryStatus.OUT_OF_STOCK
    );
  },

  getInStockItems: (state: InventoryState) => {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.applyFilters(state.inventoryItems).filter(
      item => item.status === InventoryStatus.IN_STOCK
    );
  },

  getUnreadAlerts: (state: InventoryState) => state.alerts.filter(alert => !alert.isRead),
  getUnreadAlertsCount: (state: InventoryState) => state.alerts.filter(alert => !alert.isRead).length,

  getCriticalAlerts: (state: InventoryState) => state.alerts.filter(alert =>
    alert.severity === 'critical' && !alert.isRead
  ),
  getCriticalAlertsCount: (state: InventoryState) => state.alerts.filter(alert =>
    alert.severity === 'critical' && !alert.isRead
  ).length,

  getCompletedChecks: (state: InventoryState) => state.checks.filter(check => check.status === 'completed'),
  getPendingChecks: (state: State) => state.checks.filter(check =>
    check.status === 'draft' || check.status === 'checking'
  ),

  // 业务数据联动选择器
  getItemsNeedingReorder: (state: InventoryState) => {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.applyFilters(state.inventoryItems).filter(
      item => item.currentStock <= item.minStock && item.status !== InventoryStatus.DISCONTINUED
    );
  },

  getOverstockItems: (state: InventoryState) => {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.applyFilters(state.inventoryItems).filter(
      item => item.currentStock >= item.maxStock * 0.9 && item.status !== InventoryStatus.DISCONTINUED
    );
  },

  getTotalInventoryValue: (state: InventoryState) => {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.applyFilters(state.inventoryItems).reduce(
      (total, item) => total + item.totalValue, 0
    );
  },

  getAverageStockTurnover: (state: InventoryState) => {
    const statistics = state.statistics;
    return statistics?.stockTurnoverRate || 0;
  }
};