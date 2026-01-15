import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '@/services/inventoryService';
import type {
  InventoryTransaction,
  InventoryQueryParams,
  InventoryStatistics,
  CurrentInventory,
  TransactionDetail,
  InventoryReportParams,
  InventoryReportData,
  InventoryAlert,
  InventoryBatch,
  InventoryTransfer,
  InventoryStatus,
  TransactionType,
  SourceType,
  InventoryTraceState,
} from '@/types/inventory';

// 库存列表状态接口
interface InventoryListState {
  transactions: TransactionDetail[];
  currentInventory: CurrentInventory[];
  loading: boolean;
  error: string | null;
  filters: InventoryQueryParams;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedTransactionIds: string[];
  selectedSKUs: string[];
  selectedStores: string[];
  statistics: InventoryStatistics | null;
  alerts: InventoryAlert[];
}

// 库存详情状态接口
interface InventoryDetailState {
  selectedTransaction: TransactionDetail | null;
  selectedInventory: CurrentInventory | null;
  batchInfo: InventoryBatch[];
  transferHistory: InventoryTransfer[];
  detailLoading: boolean;
  detailError: string | null;
}

// 库存操作状态接口
interface InventoryActionState {
  actionLoading: boolean;
  batchActionLoading: boolean;
  exportLoading: boolean;
  importLoading: boolean;
  syncLoading: boolean;
  lastAction: {
    type: string;
    timestamp: string;
    success: boolean;
    message: string;
  } | null;
  actionError: string | null;
}

// 库存存储接口
interface InventoryStore extends InventoryListState, InventoryDetailState, InventoryActionState {
  // 列表操作
  setFilters: (filters: Partial<InventoryQueryParams>) => void;
  clearFilters: () => void;
  setSelectedTransactionIds: (ids: string[]) => void;
  setSelectedSKUs: (skus: string[]) => void;
  setSelectedStores: (stores: string[]) => void;
  clearSelection: () => void;
  setPagination: (pagination: Partial<InventoryListState['pagination']>) => void;
  setAlerts: (alerts: InventoryAlert[]) => void;

  // 详情操作
  setSelectedTransaction: (transaction: TransactionDetail | null) => void;
  setSelectedInventory: (inventory: CurrentInventory | null) => void;
  setBatchInfo: (batches: InventoryBatch[]) => void;
  setTransferHistory: (transfers: InventoryTransfer[]) => void;

  // 操作状态
  setActionLoading: (loading: boolean) => void;
  setBatchActionLoading: (loading: boolean) => void;
  setExportLoading: (loading: boolean) => void;
  setImportLoading: (loading: boolean) => void;
  setSyncLoading: (loading: boolean) => void;
  setLastAction: (action: InventoryActionState['lastAction']) => void;
  setActionError: (error: string | null) => void;

  // 重置
  reset: () => void;
  resetDetail: () => void;
  resetAction: () => void;
}

// 初始状态
const initialState: Omit<
  InventoryStore,
  | 'setFilters'
  | 'clearFilters'
  | 'setSelectedTransactionIds'
  | 'setSelectedSKUs'
  | 'setSelectedStores'
  | 'clearSelection'
  | 'setPagination'
  | 'setAlerts'
  | 'setSelectedTransaction'
  | 'setSelectedInventory'
  | 'setBatchInfo'
  | 'setTransferHistory'
  | 'setActionLoading'
  | 'setBatchActionLoading'
  | 'setExportLoading'
  | 'setImportLoading'
  | 'setSyncLoading'
  | 'setLastAction'
  | 'setActionError'
  | 'reset'
  | 'resetDetail'
  | 'resetAction'
> = {
  transactions: [],
  currentInventory: [],
  loading: false,
  error: null,
  filters: {
    page: 1,
    pageSize: 20,
    sortBy: 'transactionTime',
    sortOrder: 'desc',
  },
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },
  selectedTransactionIds: [],
  selectedSKUs: [],
  selectedStores: [],
  statistics: null,
  alerts: [],
  selectedTransaction: null,
  selectedInventory: null,
  batchInfo: [],
  transferHistory: [],
  detailLoading: false,
  detailError: null,
  actionLoading: false,
  batchActionLoading: false,
  exportLoading: false,
  importLoading: false,
  syncLoading: false,
  lastAction: null,
  actionError: null,
};

// 创建库存存储
export const useInventoryStore = create<InventoryStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // 列表操作
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.current = 1; // 重置页码
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {
              page: 1,
              pageSize: 20,
              sortBy: 'transactionTime',
              sortOrder: 'desc',
            };
            state.pagination.current = 1;
          }),

        setSelectedTransactionIds: (ids) =>
          set((state) => {
            state.selectedTransactionIds = ids;
          }),

        setSelectedSKUs: (skus) =>
          set((state) => {
            state.selectedSKUs = skus;
          }),

        setSelectedStores: (stores) =>
          set((state) => {
            state.selectedStores = stores;
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedTransactionIds = [];
            state.selectedSKUs = [];
            state.selectedStores = [];
          }),

        setPagination: (pagination) =>
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          }),

        setAlerts: (alerts) =>
          set((state) => {
            state.alerts = alerts;
          }),

        // 详情操作
        setSelectedTransaction: (transaction) =>
          set((state) => {
            state.selectedTransaction = transaction;
          }),

        setSelectedInventory: (inventory) =>
          set((state) => {
            state.selectedInventory = inventory;
          }),

        setBatchInfo: (batches) =>
          set((state) => {
            state.batchInfo = batches;
          }),

        setTransferHistory: (transfers) =>
          set((state) => {
            state.transferHistory = transfers;
          }),

        // 操作状态
        setActionLoading: (loading) =>
          set((state) => {
            state.actionLoading = loading;
          }),

        setBatchActionLoading: (loading) =>
          set((state) => {
            state.batchActionLoading = loading;
          }),

        setExportLoading: (loading) =>
          set((state) => {
            state.exportLoading = loading;
          }),

        setImportLoading: (loading) =>
          set((state) => {
            state.importLoading = loading;
          }),

        setSyncLoading: (loading) =>
          set((state) => {
            state.syncLoading = loading;
          }),

        setLastAction: (action) =>
          set((state) => {
            state.lastAction = action;
          }),

        setActionError: (error) =>
          set((state) => {
            state.actionError = error;
          }),

        // 重置
        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),

        resetDetail: () =>
          set((state) => {
            state.selectedTransaction = null;
            state.selectedInventory = null;
            state.batchInfo = [];
            state.transferHistory = [];
            state.detailError = null;
          }),

        resetAction: () =>
          set((state) => {
            state.actionLoading = false;
            state.batchActionLoading = false;
            state.exportLoading = false;
            state.importLoading = false;
            state.syncLoading = false;
            state.lastAction = null;
            state.actionError = null;
          }),
      })),
      {
        name: 'inventory-store',
        partialize: (state) => ({
          filters: state.filters,
          pagination: state.pagination,
          selectedSKUs: state.selectedSKUs,
          selectedStores: state.selectedStores,
        }),
      }
    ),
    {
      name: 'inventory-store',
    }
  )
);

// React Query Hooks
export const useInventoryTransactionsQuery = (params?: InventoryQueryParams) => {
  const queryClient = useQueryClient();
  const { setFilters, setPagination } = useInventoryStore();

  return useQuery({
    queryKey: ['inventory-transactions', params],
    queryFn: () => inventoryService.getInventoryTransactions(params),
    onSuccess: (data) => {
      setPagination({
        current: data.pagination.current,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
      });
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

export const useCurrentInventoryQuery = (params?: {
  skuId?: string;
  storeId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) => {
  const queryClient = useQueryClient();
  const { setPagination } = useInventoryStore();

  return useQuery({
    queryKey: ['current-inventory', params],
    queryFn: () => inventoryService.getCurrentInventory(params),
    onSuccess: (data) => {
      setPagination({
        current: data.pagination.current,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
      });
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

export const useSingleInventoryQuery = (skuId: string, storeId?: string) => {
  const { setSelectedInventory } = useInventoryStore();

  return useQuery({
    queryKey: ['single-inventory', skuId, storeId],
    queryFn: () => inventoryService.getSingleInventory(skuId, storeId),
    enabled: !!skuId,
    onSuccess: (data) => {
      setSelectedInventory(data);
    },
    staleTime: 1 * 60 * 1000, // 1分钟
  });
};

export const useInventoryStatisticsQuery = (params?: {
  dateRange?: [string, string];
  storeIds?: string[];
  skuIds?: string[];
}) => {
  const store = useInventoryStore();

  return useQuery({
    queryKey: ['inventory-statistics', params],
    queryFn: () => inventoryService.getInventoryStatistics(params),
    onSuccess: (data) => {
      store.statistics = data;
    },
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

export const useInventoryAlertsQuery = (params?: {
  storeId?: string;
  skuId?: string;
  alertType?: string[];
  isEnabled?: boolean;
}) => {
  const { setAlerts } = useInventoryStore();

  return useQuery({
    queryKey: ['inventory-alerts', params],
    queryFn: () => inventoryService.getInventoryAlerts(params),
    onSuccess: (data) => {
      setAlerts(data.data);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryBatchesQuery = (params?: {
  skuId?: string;
  storeId?: string;
  batchNumber?: string;
}) => {
  const { setBatchInfo } = useInventoryStore();

  return useQuery({
    queryKey: ['inventory-batches', params],
    queryFn: () => inventoryService.getInventoryBatches(params),
    onSuccess: (data) => {
      setBatchInfo(data.data);
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useInventoryTransfersQuery = (params?: {
  fromStoreId?: string;
  toStoreId?: string;
  status?: string[];
}) => {
  const { setTransferHistory } = useInventoryStore();

  return useQuery({
    queryKey: ['inventory-transfers', params],
    queryFn: () => inventoryService.getInventoryTransfers(params),
    onSuccess: (data) => {
      setTransferHistory(data.data);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryTrendsQuery = (params?: {
  dateRange: [string, string];
  storeIds?: string[];
  skuIds?: string[];
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['inventory-trends', params],
    queryFn: () => inventoryService.getInventoryTrends(params),
    staleTime: 30 * 60 * 1000, // 30分钟
  });
};

export const useReplenishmentSuggestionsQuery = (params?: {
  storeIds?: string[];
  categoryIds?: string[];
  includeLowStock?: boolean;
  maxSuggestions?: number;
}) => {
  return useQuery({
    queryKey: ['replenishment-suggestions', params],
    queryFn: () => inventoryService.getReplenishmentSuggestions(params),
    staleTime: 15 * 60 * 1000, // 15分钟
  });
};

export const useInventoryHealthCheckQuery = (params?: {
  storeIds?: string[];
  includeZeroStock?: boolean;
}) => {
  return useQuery({
    queryKey: ['inventory-health-check', params],
    queryFn: () => inventoryService.performInventoryHealthCheck(params),
    staleTime: 60 * 60 * 1000, // 1小时
  });
};

// Mutations
export const useCreateInventoryTransactionMutation = () => {
  const queryClient = useQueryClient();
  const { setActionLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: (data: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      inventoryService.createInventoryTransaction(data),
    onMutate: () => {
      setActionLoading(true);
      setActionError(null);
    },
    onSuccess: (_, variables) => {
      setLastAction({
        type: 'create_transaction',
        timestamp: new Date().toISOString(),
        success: true,
        message: `库存交易记录创建成功`,
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['current-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-statistics'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'create_transaction',
        timestamp: new Date().toISOString(),
        success: false,
        message: `创建失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setActionLoading(false);
    },
  });
};

export const useBatchCreateInventoryTransactionsMutation = () => {
  const queryClient = useQueryClient();
  const { setBatchActionLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: (data: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>[]) =>
      inventoryService.batchCreateInventoryTransactions(data),
    onMutate: () => {
      setBatchActionLoading(true);
      setActionError(null);
    },
    onSuccess: (data) => {
      setLastAction({
        type: 'batch_create_transactions',
        timestamp: new Date().toISOString(),
        success: true,
        message: `批量创建完成: 成功${data.success}条，失败${data.failed}条`,
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['current-inventory'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'batch_create_transactions',
        timestamp: new Date().toISOString(),
        success: false,
        message: `批量创建失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setBatchActionLoading(false);
    },
  });
};

export const useUpdateInventoryMutation = () => {
  const queryClient = useQueryClient();
  const { setActionLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CurrentInventory> }) =>
      inventoryService.updateInventory(id, data),
    onMutate: () => {
      setActionLoading(true);
      setActionError(null);
    },
    onSuccess: () => {
      setLastAction({
        type: 'update_inventory',
        timestamp: new Date().toISOString(),
        success: true,
        message: '库存信息更新成功',
      });
      queryClient.invalidateQueries({ queryKey: ['current-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['single-inventory'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'update_inventory',
        timestamp: new Date().toISOString(),
        success: false,
        message: `更新失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setActionLoading(false);
    },
  });
};

export const useCreateInventoryTransferMutation = () => {
  const queryClient = useQueryClient();
  const { setActionLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: (
      data: Omit<
        InventoryTransfer,
        'id' | 'transferNumber' | 'createdAt' | 'updatedAt' | 'requestedAt' | 'status'
      >
    ) => inventoryService.createInventoryTransfer(data),
    onMutate: () => {
      setActionLoading(true);
      setActionError(null);
    },
    onSuccess: () => {
      setLastAction({
        type: 'create_transfer',
        timestamp: new Date().toISOString(),
        success: true,
        message: '库存转移单创建成功',
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'create_transfer',
        timestamp: new Date().toISOString(),
        success: false,
        message: `创建转移单失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setActionLoading(false);
    },
  });
};

export const useExportInventoryMutation = () => {
  const { setExportLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: (params: { format: 'excel' | 'csv'; reportType: string; filters?: any }) =>
      inventoryService.exportInventoryData(params),
    onMutate: () => {
      setExportLoading(true);
      setActionError(null);
    },
    onSuccess: (_, variables) => {
      setLastAction({
        type: 'export_inventory',
        timestamp: new Date().toISOString(),
        success: true,
        message: `库存数据导出成功 (${variables.format.toUpperCase()}格式)`,
      });
      // 处理文件下载
      const blob = new Blob([_ as any], {
        type:
          variables.format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'export_inventory',
        timestamp: new Date().toISOString(),
        success: false,
        message: `导出失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setExportLoading(false);
    },
  });
};

export const useImportInventoryMutation = () => {
  const queryClient = useQueryClient();
  const { setImportLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: any }) =>
      inventoryService.importInventoryTransactions(file, options),
    onMutate: () => {
      setImportLoading(true);
      setActionError(null);
    },
    onSuccess: (data) => {
      setLastAction({
        type: 'import_inventory',
        timestamp: new Date().toISOString(),
        success: true,
        message: `导入完成: 成功${data.imported}条，失败${data.failed}条`,
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['current-inventory'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'import_inventory',
        timestamp: new Date().toISOString(),
        success: false,
        message: `导入失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setImportLoading(false);
    },
  });
};

export const useSyncInventoryMutation = () => {
  const queryClient = useQueryClient();
  const { setSyncLoading, setActionError, setLastAction } = useInventoryStore();

  return useMutation({
    mutationFn: (params: { sourceSystem: string; syncType: string; storeIds?: string[] }) =>
      inventoryService.syncInventoryData(params),
    onMutate: () => {
      setSyncLoading(true);
      setActionError(null);
    },
    onSuccess: (data) => {
      setLastAction({
        type: 'sync_inventory',
        timestamp: new Date().toISOString(),
        success: true,
        message: `库存同步已启动 (ID: ${data.syncId})`,
      });
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setLastAction({
        type: 'sync_inventory',
        timestamp: new Date().toISOString(),
        success: false,
        message: `同步失败: ${error.message}`,
      });
    },
    onSettled: () => {
      setSyncLoading(false);
    },
  });
};

// Selectors
export const useInventorySelectors = () => {
  const store = useInventoryStore();

  return {
    // 过滤后的交易记录
    filteredTransactions: store.transactions.filter((transaction) => {
      const filters = store.filters;

      if (filters.transactionType && filters.transactionType.length > 0) {
        if (!filters.transactionType.includes(transaction.transactionType)) return false;
      }

      if (filters.sourceType && filters.sourceType.length > 0) {
        if (!filters.sourceType.includes(transaction.sourceType)) return false;
      }

      if (filters.skuId && transaction.skuId !== filters.skuId) return false;
      if (filters.storeId && transaction.storeId !== filters.storeId) return false;

      if (filters.dateRange) {
        const transactionDate = new Date(transaction.transactionTime);
        const [startDate, endDate] = filters.dateRange;
        if (transactionDate < new Date(startDate) || transactionDate > new Date(endDate)) {
          return false;
        }
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (
          !transaction.sku.skuCode.toLowerCase().includes(keyword) &&
          !transaction.sku.name.toLowerCase().includes(keyword) &&
          !transaction.store.code.toLowerCase().includes(keyword) &&
          !transaction.store.name.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      return true;
    }),

    // 选中的交易记录
    selectedTransactions: store.transactions.filter((transaction) =>
      store.selectedTransactionIds.includes(transaction.id)
    ),

    // 低库存警报
    lowStockAlerts: store.alerts.filter(
      (alert) => alert.alertType === 'low_stock' && alert.isEnabled
    ),

    // 过期库存警报
    expiringSoonAlerts: store.alerts.filter(
      (alert) => alert.alertType === 'expiring_soon' && alert.isEnabled
    ),

    // 高优先级警报
    highPriorityAlerts: store.alerts.filter(
      (alert) => alert.isEnabled && ['low_stock', 'out_of_stock'].includes(alert.alertType)
    ),

    // 库存总价值
    totalInventoryValue: store.currentInventory.reduce(
      (sum, inventory) => sum + (inventory.totalValue || 0),
      0
    ),

    // 总可用库存
    totalAvailableQuantity: store.currentInventory.reduce(
      (sum, inventory) => sum + inventory.availableQty,
      0
    ),

    // 低库存商品数量
    lowStockItemsCount: store.currentInventory.filter(
      (inventory) => inventory.availableQty <= inventory.reorderPoint
    ).length,

    // 缺货商品数量
    outOfStockItemsCount: store.currentInventory.filter((inventory) => inventory.availableQty === 0)
      .length,

    // 活跃转移单数量
    activeTransfersCount: store.transferHistory.filter((transfer) =>
      ['pending', 'in_transit'].includes(transfer.status)
    ).length,

    // 是否有选中的记录
    hasSelection:
      store.selectedTransactionIds.length > 0 ||
      store.selectedSKUs.length > 0 ||
      store.selectedStores.length > 0,

    // 当前页的交易记录
    currentPageTransactions: store.transactions.slice(
      (store.pagination.current - 1) * store.pagination.pageSize,
      store.pagination.current * store.pagination.pageSize
    ),

    // 最近7天的交易数量
    recentTransactionsCount: store.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transactionTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return transactionDate >= sevenDaysAgo;
    }).length,

    // 今日交易数量
    todayTransactionsCount: store.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transactionTime);
      const today = new Date();
      return transactionDate.toDateString() === today.toDateString();
    }).length,
  };
};
