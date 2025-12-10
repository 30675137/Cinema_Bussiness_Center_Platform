import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createQueries, createQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import inventoryService, {
  type CurrentInventory,
  type InventoryTransaction,
  type InventoryStatistics,
  type TransactionDetail,
  type InventoryQueryParams,
  type BatchInfo,
  type InventoryAlert,
  type ReplenishmentSuggestion,
  type TransferOrder
} from '@/services/inventoryService';
import type { TransactionType, SourceType, InventoryStatus } from '@/types/inventory';

/**
 * 库存状态管理接口
 */
interface InventoryState {
  // 基础状态
  isLoading: boolean;
  error: string | null;

  // 当前库存状态
  currentInventory: CurrentInventory[];
  selectedInventory: CurrentInventory | null;
  inventoryFilters: Partial<InventoryQueryParams>;

  // 交易历史状态
  transactions: InventoryTransaction[];
  selectedTransaction: TransactionDetail | null;
  transactionFilters: Partial<InventoryQueryParams>;

  // 统计数据状态
  statistics: InventoryStatistics | null;

  // 警报状态
  alerts: InventoryAlert[];
  alertCount: number;

  // 批次信息状态
  batches: BatchInfo[];
  selectedBatch: BatchInfo | null;

  // 调拨订单状态
  transfers: TransferOrder[];
  selectedTransfer: TransferOrder | null;

  // 补货建议状态
  replenishmentSuggestions: ReplenishmentSuggestion[];

  // UI状态
  sidebarCollapsed: boolean;
  activeTab: string;
  searchKeyword: string;

  // 操作函数
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 库存相关操作
  setCurrentInventory: (inventory: CurrentInventory[]) => void;
  setSelectedInventory: (inventory: CurrentInventory | null) => void;
  setInventoryFilters: (filters: Partial<InventoryQueryParams>) => void;
  updateInventoryFilter: (key: keyof InventoryQueryParams, value: any) => void;
  clearInventoryFilters: () => void;

  // 交易相关操作
  setTransactions: (transactions: InventoryTransaction[]) => void;
  setSelectedTransaction: (transaction: TransactionDetail | null) => void;
  setTransactionFilters: (filters: Partial<InventoryQueryParams>) => void;
  updateTransactionFilter: (key: keyof InventoryQueryParams, value: any) => void;
  clearTransactionFilters: () => void;

  // 统计数据操作
  setStatistics: (statistics: InventoryStatistics | null) => void;

  // 警报相关操作
  setAlerts: (alerts: InventoryAlert[]) => void;
  setAlertCount: (count: number) => void;

  // 批次相关操作
  setBatches: (batches: BatchInfo[]) => void;
  setSelectedBatch: (batch: BatchInfo | null) => void;

  // 调拨相关操作
  setTransfers: (transfers: TransferOrder[]) => void;
  setSelectedTransfer: (transfer: TransferOrder | null) => void;

  // 补货建议操作
  setReplenishmentSuggestions: (suggestions: ReplenishmentSuggestion[]) => void;

  // UI状态操作
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchKeyword: (keyword: string) => void;

  // 重置操作
  resetStore: () => void;
  resetFilters: () => void;
}

/**
 * 默认过滤器状态
 */
const defaultFilters: Partial<InventoryQueryParams> = {
  page: 1,
  pageSize: 20,
  sortBy: 'transactionTime',
  sortOrder: 'desc'
};

/**
 * 默认状态
 */
const defaultState = {
  isLoading: false,
  error: null,
  currentInventory: [],
  selectedInventory: null,
  inventoryFilters: defaultFilters,
  transactions: [],
  selectedTransaction: null,
  transactionFilters: defaultFilters,
  statistics: null,
  alerts: [],
  alertCount: 0,
  batches: [],
  selectedBatch: null,
  transfers: [],
  selectedTransfer: null,
  replenishmentSuggestions: [],
  sidebarCollapsed: false,
  activeTab: 'overview',
  searchKeyword: ''
};

/**
 * 创建库存状态管理
 */
export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      ...defaultState,

      // 基础操作函数
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      // 库存相关操作
      setCurrentInventory: (inventory: CurrentInventory[]) => set({ currentInventory: inventory }),
      setSelectedInventory: (inventory: CurrentInventory | null) => set({ selectedInventory: inventory }),
      setInventoryFilters: (filters: Partial<InventoryQueryParams>) =>
        set({ inventoryFilters: { ...defaultFilters, ...filters } }),
      updateInventoryFilter: (key: keyof InventoryQueryParams, value: any) =>
        set((state) => ({
          inventoryFilters: { ...state.inventoryFilters, [key]: value }
        })),
      clearInventoryFilters: () => set({ inventoryFilters: defaultFilters }),

      // 交易相关操作
      setTransactions: (transactions: InventoryTransaction[]) => set({ transactions }),
      setSelectedTransaction: (transaction: TransactionDetail | null) => set({ selectedTransaction: transaction }),
      setTransactionFilters: (filters: Partial<InventoryQueryParams>) =>
        set({ transactionFilters: { ...defaultFilters, ...filters } }),
      updateTransactionFilter: (key: keyof InventoryQueryParams, value: any) =>
        set((state) => ({
          transactionFilters: { ...state.transactionFilters, [key]: value }
        })),
      clearTransactionFilters: () => set({ transactionFilters: defaultFilters }),

      // 统计数据操作
      setStatistics: (statistics: InventoryStatistics | null) => set({ statistics }),

      // 警报相关操作
      setAlerts: (alerts: InventoryAlert[]) => set({ alerts }),
      setAlertCount: (count: number) => set({ alertCount: count }),

      // 批次相关操作
      setBatches: (batches: BatchInfo[]) => set({ batches }),
      setSelectedBatch: (batch: BatchInfo | null) => set({ selectedBatch: batch }),

      // 调拨相关操作
      setTransfers: (transfers: TransferOrder[]) => set({ transfers }),
      setSelectedTransfer: (transfer: TransferOrder | null) => set({ selectedTransfer: transfer }),

      // 补货建议操作
      setReplenishmentSuggestions: (suggestions: ReplenishmentSuggestion[]) => set({ replenishmentSuggestions: suggestions }),

      // UI状态操作
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),

      // 重置操作
      resetStore: () => set(defaultState),
      resetFilters: () => set({
        inventoryFilters: defaultFilters,
        transactionFilters: defaultFilters
      })
    }),
    {
      name: 'inventory-store'
    }
  )
);

/**
 * 库存查询Keys - 用于TanStack Query缓存管理
 */
export const inventoryQueryKeys = {
  // 基础查询
  all: ['inventory'] as const,
  current: () => [...inventoryQueryKeys.all, 'current'] as const,
  currentWithFilters: (filters: Partial<InventoryQueryParams>) =>
    [...inventoryQueryKeys.current(), filters] as const,
  transactions: () => [...inventoryQueryKeys.all, 'transactions'] as const,
  transactionsWithFilters: (filters: Partial<InventoryQueryParams>) =>
    [...inventoryQueryKeys.transactions(), filters] as const,
  statistics: (params?: any) => [...inventoryQueryKeys.all, 'statistics', params] as const,

  // 详情查询
  inventoryDetail: (skuId: string, storeId?: string) =>
    [...inventoryQueryKeys.all, 'detail', skuId, storeId] as const,
  transactionDetail: (transactionId: string) =>
    [...inventoryQueryKeys.all, 'transaction', transactionId] as const,

  // 扩展查询
  alerts: (params?: any) => [...inventoryQueryKeys.all, 'alerts', params] as const,
  batches: (params?: any) => [...inventoryQueryKeys.all, 'batches', params] as const,
  transfers: (params?: any) => [...inventoryQueryKeys.all, 'transfers', params] as const,
  replenishment: (params?: any) => [...inventoryQueryKeys.all, 'replenishment', params] as const,
  trends: (params?: any) => [...inventoryQueryKeys.all, 'trends', params] as const,
  forecast: (params?: any) => [...inventoryQueryKeys.all, 'forecast', params] as const
};

/**
 * 库存查询Hooks - 封装常用查询逻辑
 */
export const useInventoryQueries = () => {
  const queryClient = useQueryClient();
  const { inventoryFilters, transactionFilters } = useInventoryStore();

  return {
    // 当前库存查询
    useCurrentInventoryQuery: (options?: any) => ({
      queryKey: inventoryQueryKeys.currentWithFilters(inventoryFilters),
      queryFn: () => inventoryService.getCurrentInventory(inventoryFilters),
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      ...options
    }),

    // 交易历史查询
    useTransactionsQuery: (options?: any) => ({
      queryKey: inventoryQueryKeys.transactionsWithFilters(transactionFilters),
      queryFn: () => inventoryService.getInventoryTransactions(transactionFilters),
      staleTime: 2 * 60 * 1000, // 2分钟缓存
      ...options
    }),

    // 统计数据查询
    useStatisticsQuery: (params?: any, options?: any) => ({
      queryKey: inventoryQueryKeys.statistics(params),
      queryFn: () => inventoryService.getInventoryStatistics(params),
      staleTime: 10 * 60 * 1000, // 10分钟缓存
      ...options
    }),

    // 库存详情查询
    useInventoryDetailQuery: (skuId: string, storeId?: string, options?: any) => ({
      queryKey: inventoryQueryKeys.inventoryDetail(skuId, storeId),
      queryFn: () => inventoryService.getSingleInventory(skuId, storeId),
      staleTime: 5 * 60 * 1000,
      ...options
    }),

    // 交易详情查询
    useTransactionDetailQuery: (transactionId: string, options?: any) => ({
      queryKey: inventoryQueryKeys.transactionDetail(transactionId),
      queryFn: () => inventoryService.getTransactionDetail(transactionId),
      staleTime: 30 * 60 * 1000, // 30分钟缓存
      ...options
    }),

    // 警报查询
    useAlertsQuery: (params?: any, options?: any) => ({
      queryKey: inventoryQueryKeys.alerts(params),
      queryFn: () => inventoryService.getInventoryAlerts(params),
      staleTime: 3 * 60 * 1000, // 3分钟缓存
      ...options
    }),

    // 批次信息查询
    useBatchesQuery: (params?: any, options?: any) => ({
      queryKey: inventoryQueryKeys.batches(params),
      queryFn: () => inventoryService.getInventoryBatches(params),
      staleTime: 5 * 60 * 1000,
      ...options
    }),

    // 调拨订单查询
    useTransfersQuery: (params?: any, options?: any) => ({
      queryKey: inventoryQueryKeys.transfers(params),
      queryFn: () => inventoryService.getInventoryTransfers(params),
      staleTime: 5 * 60 * 1000,
      ...options
    }),

    // 补货建议查询
    useReplenishmentQuery: (params?: any, options?: any) => ({
      queryKey: inventoryQueryKeys.replenishment(params),
      queryFn: () => inventoryService.getReplenishmentSuggestions(params),
      staleTime: 15 * 60 * 1000, // 15分钟缓存
      ...options
    }),

    // 趋势数据查询
    useTrendsQuery: (params?: any, options?: any) => ({
      queryKey: inventoryQueryKeys.trends(params),
      queryFn: () => inventoryService.getInventoryTrends(params),
      staleTime: 30 * 60 * 1000, // 30分钟缓存
      ...options
    }),

    // 预测数据查询
    useForecastQuery: (params: any, options?: any) => ({
      queryKey: inventoryQueryKeys.forecast(params),
      queryFn: () => inventoryService.getInventoryForecast(params),
      staleTime: 60 * 60 * 1000, // 1小时缓存
      ...options
    }),

    // 批量库存查询（高性能）
    useBatchInventoryQuery: (skuIds: string[], storeIds?: string[], options?: any) => ({
      queryKey: [...inventoryQueryKeys.all, 'batch', skuIds, storeIds],
      queryFn: () => inventoryService.batchGetInventory(skuIds, storeIds),
      staleTime: 2 * 60 * 1000, // 2分钟缓存
      ...options
    }),

    // 查询客户端方法
    invalidateCurrentInventory: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.current() }),
    invalidateTransactions: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.transactions() }),
    invalidateStatistics: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.statistics() }),
    invalidateAlerts: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.alerts() }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all }),

    // 预取数据方法
    prefetchInventoryDetail: (skuId: string, storeId?: string) =>
      queryClient.prefetchQuery({
        queryKey: inventoryQueryKeys.inventoryDetail(skuId, storeId),
        queryFn: () => inventoryService.getSingleInventory(skuId, storeId),
        staleTime: 5 * 60 * 1000
      }),
    prefetchTransactionDetail: (transactionId: string) =>
      queryClient.prefetchQuery({
        queryKey: inventoryQueryKeys.transactionDetail(transactionId),
        queryFn: () => inventoryService.getTransactionDetail(transactionId),
        staleTime: 30 * 60 * 1000
      })
  };
};

/**
 * 库存操作Hooks - 封装常用操作逻辑
 */
export const useInventoryActions = () => {
  const queryClient = useQueryClient();
  const {
    setCurrentInventory,
    setSelectedInventory,
    setTransactions,
    setSelectedTransaction,
    setStatistics,
    setAlerts,
    setBatches,
    setTransfers,
    setReplenishmentSuggestions,
    setLoading,
    setError
  } = useInventoryStore();

  return {
    // 刷新当前库存
    refreshCurrentInventory: async (filters?: Partial<InventoryQueryParams>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await inventoryService.getCurrentInventory(filters);
        setCurrentInventory(response.data);
        return response;
      } catch (error) {
        console.error('刷新当前库存失败:', error);
        setError('获取库存数据失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 刷新交易历史
    refreshTransactions: async (filters?: Partial<InventoryQueryParams>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await inventoryService.getInventoryTransactions(filters);
        setTransactions(response.data);
        return response;
      } catch (error) {
        console.error('刷新交易历史失败:', error);
        setError('获取交易数据失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 刷新统计数据
    refreshStatistics: async (params?: any) => {
      try {
        setLoading(true);
        setError(null);
        const statistics = await inventoryService.getInventoryStatistics(params);
        setStatistics(statistics);
        return statistics;
      } catch (error) {
        console.error('刷新统计数据失败:', error);
        setError('获取统计数据失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 获取库存详情
    fetchInventoryDetail: async (skuId: string, storeId?: string) => {
      try {
        setLoading(true);
        setError(null);
        const inventory = await inventoryService.getSingleInventory(skuId, storeId);
        setSelectedInventory(inventory);
        return inventory;
      } catch (error) {
        console.error('获取库存详情失败:', error);
        setError('获取库存详情失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 获取交易详情
    fetchTransactionDetail: async (transactionId: string) => {
      try {
        setLoading(true);
        setError(null);
        const transaction = await inventoryService.getTransactionDetail(transactionId);
        setSelectedTransaction(transaction);
        return transaction;
      } catch (error) {
        console.error('获取交易详情失败:', error);
        setError('获取交易详情失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 刷新警报
    refreshAlerts: async (params?: any) => {
      try {
        const response = await inventoryService.getInventoryAlerts(params);
        setAlerts(response.data);
        return response;
      } catch (error) {
        console.error('刷新警报失败:', error);
        throw error;
      }
    },

    // 刷新批次信息
    refreshBatches: async (params?: any) => {
      try {
        const response = await inventoryService.getInventoryBatches(params);
        setBatches(response.data);
        return response;
      } catch (error) {
        console.error('刷新批次信息失败:', error);
        throw error;
      }
    },

    // 刷新调拨订单
    refreshTransfers: async (params?: any) => {
      try {
        const response = await inventoryService.getInventoryTransfers(params);
        setTransfers(response.data);
        return response;
      } catch (error) {
        console.error('刷新调拨订单失败:', error);
        throw error;
      }
    },

    // 刷新补货建议
    refreshReplenishmentSuggestions: async (params?: any) => {
      try {
        const suggestions = await inventoryService.getReplenishmentSuggestions(params);
        setReplenishmentSuggestions(suggestions);
        return suggestions;
      } catch (error) {
        console.error('刷新补货建议失败:', error);
        throw error;
      }
    },

    // 批量获取库存（高性能）
    batchFetchInventory: async (skuIds: string[], storeIds?: string[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await inventoryService.batchGetInventory(skuIds, storeIds);
        return result;
      } catch (error) {
        console.error('批量获取库存失败:', error);
        setError('批量获取库存失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 导出库存数据
    exportInventoryData: async (params: any) => {
      try {
        setLoading(true);
        const blob = await inventoryService.exportInventoryData(params);

        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.${params.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return blob;
      } catch (error) {
        console.error('导出库存数据失败:', error);
        setError('导出库存数据失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 创建库存警报
    createAlert: async (alertData: any) => {
      try {
        const alert = await inventoryService.createInventoryAlert(alertData);
        // 刷新警报列表
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.alerts() });
        return alert;
      } catch (error) {
        console.error('创建库存警报失败:', error);
        throw error;
      }
    },

    // 创建调拨订单
    createTransfer: async (transferData: any) => {
      try {
        setLoading(true);
        const transfer = await inventoryService.createInventoryTransfer(transferData);
        // 刷新调拨列表
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.transfers() });
        return transfer;
      } catch (error) {
        console.error('创建调拨订单失败:', error);
        setError('创建调拨订单失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 更新调拨状态
    updateTransferStatus: async (transferId: string, status: any, remarks?: string) => {
      try {
        setLoading(true);
        const transfer = await inventoryService.updateInventoryTransferStatus(transferId, status, remarks);
        // 刷新调拨列表
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.transfers() });
        return transfer;
      } catch (error) {
        console.error('更新调拨状态失败:', error);
        setError('更新调拨状态失败');
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 批量创建库存交易
    batchCreateTransactions: async (transactions: any[]) => {
      try {
        setLoading(true);
        const result = await inventoryService.batchCreateInventoryTransactions(transactions);
        // 刷新相关数据
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.transactions() });
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.current() });
        return result;
      } catch (error) {
        console.error('批量创建库存交易失败:', error);
        setError('批量创建库存交易失败');
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };
};

/**
 * 库存工具Hooks
 */
export const useInventoryUtils = () => {
  const { currentInventory, transactions, statistics, alerts } = useInventoryStore();

  return {
    // 计算库存健康度
    getInventoryHealth: (inventory: CurrentInventory) => {
      const { totalQuantity, reservedQuantity, availableQuantity } = inventory;
      const utilizationRate = totalQuantity > 0 ? (availableQuantity / totalQuantity) * 100 : 0;

      if (utilizationRate >= 90) return { status: 'healthy', color: '#52c41a', text: '充足' };
      if (utilizationRate >= 70) return { status: 'warning', color: '#faad14', text: '适中' };
      if (utilizationRate >= 50) return { status: 'low', color: '#fa8c16', text: '偏低' };
      return { status: 'critical', color: '#f5222d', text: '不足' };
    },

    // 获取交易类型显示信息
    getTransactionTypeInfo: (type: TransactionType) => {
      const typeMap = {
        [TransactionType.PURCHASE_IN]: { text: '采购入库', color: '#52c41a', icon: '↓' },
        [TransactionType.SALE_OUT]: { text: '销售出库', color: '#f5222d', icon: '↑' },
        [TransactionType.TRANSFER_IN]: { text: '调拨入库', color: '#1890ff', icon: '→' },
        [TransactionType.TRANSFER_OUT]: { text: '调拨出库', color: '#722ed1', icon: '←' },
        [TransactionType.ADJUSTMENT_IN]: { text: '盘盈入库', color: '#52c41a', icon: '↗' },
        [TransactionType.ADJUSTMENT_OUT]: { text: '盘亏出库', color: '#f5222d', icon: '↘' },
        [TransactionType.RETURN_IN]: { text: '退货入库', color: '#faad14', icon: '↶' },
        [TransactionType.RETURN_OUT]: { text: '退货出库', color: '#fa8c16', icon: '↷' },
        [TransactionType.DAMAGE_OUT]: { text: '损耗出库', color: '#ff4d4f', icon: '✗' },
        [TransactionType.PRODUCTION_IN]: { text: '生产入库', color: '#13c2c2', icon: '⚙' },
        [TransactionType.EXPIRED_OUT]: { text: '过期出库', color: '#a0d911', icon: '⏰' }
      };
      return typeMap[type] || { text: '未知', color: '#d9d9d9', icon: '?' };
    },

    // 格式化数量显示
    formatQuantity: (quantity: number, unit?: string) => {
      if (Math.abs(quantity) >= 1000000) {
        return `${(quantity / 1000000).toFixed(1)}M ${unit || ''}`;
      }
      if (Math.abs(quantity) >= 1000) {
        return `${(quantity / 1000).toFixed(1)}K ${unit || ''}`;
      }
      return `${quantity.toLocaleString()} ${unit || ''}`;
    },

    // 格式化金额显示
    formatCurrency: (amount: number, currency = '¥') => {
      return `${currency}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // 计算库存价值
    calculateInventoryValue: (inventory: CurrentInventory[]) => {
      return inventory.reduce((total, item) =>
        total + (item.availableQuantity * item.unitCost || 0), 0
      );
    },

    // 获取热门商品（按交易次数）
    getTopMovingProducts: (limit = 10) => {
      const productCounts = transactions.reduce((acc, transaction) => {
        const key = transaction.skuId;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([skuId, count]) => ({ skuId, transactionCount: count }));
    },

    // 获取库存警报统计
    getAlertStatistics: () => {
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
      const warningAlerts = alerts.filter(alert => alert.severity === 'high').length;
      const infoAlerts = alerts.filter(alert => alert.severity === 'medium').length;

      return {
        total: alerts.length,
        critical: criticalAlerts,
        high: warningAlerts,
        medium: infoAlerts,
        percentage: alerts.length > 0 ? Math.round((criticalAlerts / alerts.length) * 100) : 0
      };
    },

    // 搜索库存
    searchInventory: (keyword: string) => {
      if (!keyword.trim()) return currentInventory;

      const lowerKeyword = keyword.toLowerCase();
      return currentInventory.filter(item =>
        item.skuName?.toLowerCase().includes(lowerKeyword) ||
        item.skuCode?.toLowerCase().includes(lowerKeyword) ||
        item.storeName?.toLowerCase().includes(lowerKeyword) ||
        item.remarks?.toLowerCase().includes(lowerKeyword)
      );
    },

    // 按状态筛选库存
    filterInventoryByStatus: (status?: InventoryStatus[]) => {
      if (!status || status.length === 0) return currentInventory;
      return currentInventory.filter(item => status.includes(item.status));
    },

    // 按门店筛选库存
    filterInventoryByStore: (storeIds?: string[]) => {
      if (!storeIds || storeIds.length === 0) return currentInventory;
      return currentInventory.filter(item => storeIds.includes(item.storeId));
    }
  };
};

export default useInventoryStore;