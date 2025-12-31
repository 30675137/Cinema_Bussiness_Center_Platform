/**
 * 采购订单Store
 */
import { createStore, createModalStore, createAsyncAction } from './baseStore';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderPriority,
  PurchaseOrderQueryParams,
  PurchaseOrderFormData,
  PurchaseStatistics,
} from '../types/purchase';

// 采购订单状态类型
export type PurchaseOrderStoreState = {
  // 数据状态
  orders: PurchaseOrder[];
  currentOrder: PurchaseOrder | null;
  statistics: PurchaseStatistics | null;

  // 过滤器状态
  statusFilters: PurchaseOrderStatus[];
  priorityFilter?: PurchaseOrderPriority;
  supplierFilter?: string;
  dateRange: [string, string] | null;

  // 订单项编辑状态
  editingOrder: PurchaseOrder | null;
  editingItems: PurchaseOrder['items'];

  // 批量操作状态
  selectedOrderIds: string[];
  isBatchDeleting: boolean;
  isBatchApproving: boolean;
};

// 采购订单动作类型
export type PurchaseOrderStoreActions = {
  // 订单管理
  fetchOrders: (params?: PurchaseOrderQueryParams) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (data: PurchaseOrderFormData) => Promise<string | null>;
  updateOrder: (id: string, data: Partial<PurchaseOrderFormData>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;

  // 订单状态操作
  approveOrder: (id: string, remarks?: string) => Promise<boolean>;
  rejectOrder: (id: string, remarks: string) => Promise<boolean>;
  confirmOrder: (id: string) => Promise<boolean>;
  cancelOrder: (id: string, reason: string) => Promise<boolean>;

  // 批量操作
  batchApprove: (orderIds: string[], remarks?: string) => Promise<boolean>;
  batchDelete: (orderIds: string[]) => Promise<boolean>;
  batchCancel: (orderIds: string[], reason: string) => Promise<boolean>;

  // 统计数据
  fetchStatistics: () => Promise<void>;

  // 订单项操作
  addOrderItem: (item: PurchaseOrder['items'][0]) => void;
  updateOrderItem: (itemId: string, updates: Partial<PurchaseOrder['items'][0]>) => void;
  removeOrderItem: (itemId: string) => void;

  // 过滤器
  setStatusFilters: (statuses: PurchaseOrderStatus[]) => void;
  setPriorityFilter: (priority?: PurchaseOrderPriority) => void;
  setSupplierFilter: (supplierId?: string) => void;
  setDateRange: (range: [string, string] | null) => void;
  clearFilters: () => void;

  // 选择操作
  selectOrder: (orderId: string, selected: boolean) => void;
  selectAllOrders: (selected: boolean) => void;
  clearSelection: () => void;

  // 编辑状态
  startEditing: (order: PurchaseOrder) => void;
  cancelEditing: () => void;
  saveEditing: () => Promise<boolean>;

  // 复制订单
  duplicateOrder: (orderId: string) => Promise<string | null>;

  // 导出
  exportOrders: (params?: PurchaseOrderQueryParams) => Promise<void>;
};

// 创建采购订单Store
export const usePurchaseOrderStore = createStore<PurchaseOrder>('purchase-order', {
  // 初始数据状态
  orders: [],
  currentOrder: null,
  statistics: null,

  // 过滤器初始状态
  statusFilters: [],
  priorityFilter: undefined,
  supplierFilter: undefined,
  dateRange: null,

  // 编辑状态
  editingOrder: null,
  editingItems: [],

  // 批量操作状态
  selectedOrderIds: [],
  isBatchDeleting: false,
  isBatchApproving: false,
});

// 扩展store以添加采购订单特定的动作
export const purchaseOrderStore = {
  ...usePurchaseOrderStore.getState(),

  // 获取过滤后的订单
  get filteredOrders() {
    const { orders, statusFilters, priorityFilter, supplierFilter, dateRange } =
      usePurchaseOrderStore.getState();

    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    return orders.filter((order) => {
      // 状态过滤
      if (statusFilters.length > 0 && !statusFilters.includes(order.status)) {
        return false;
      }

      // 优先级过滤
      if (priorityFilter && order.priority !== priorityFilter) {
        return false;
      }

      // 供应商过滤
      if (supplierFilter && (!order.supplier || order.supplier.id !== supplierFilter)) {
        return false;
      }

      // 日期范围过滤
      if (dateRange) {
        const orderDate = new Date(order.orderDate);
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);

        if (orderDate < startDate || orderDate > endDate) {
          return false;
        }
      }

      return true;
    });
  },

  // 获取选中的订单
  get selectedOrders() {
    const { orders, selectedOrderIds } = usePurchaseOrderStore.getState();
    if (!orders || !Array.isArray(orders) || !selectedOrderIds) {
      return [];
    }
    return orders.filter((order) => selectedOrderIds.includes(order.id));
  },

  // 检查是否全选
  get isAllSelected() {
    const { filteredOrders, selectedOrderIds } = this as any;
    return (
      filteredOrders.length > 0 &&
      filteredOrders.every((order: PurchaseOrder) => selectedOrderIds.includes(order.id))
    );
  },

  // 获取订单状态统计
  getStatusStatistics() {
    const { orders } = usePurchaseOrderStore.getState();

    if (!orders || !Array.isArray(orders)) {
      return {};
    }

    return orders.reduce(
      (stats, order) => {
        const status = order.status;
        stats[status] = (stats[status] || 0) + 1;
        return stats;
      },
      {} as Record<PurchaseOrderStatus, number>
    );
  },

  // 获取订单金额统计
  getAmountStatistics() {
    const { orders } = usePurchaseOrderStore.getState();

    if (!orders || !Array.isArray(orders)) {
      return {
        totalAmount: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0,
      };
    }

    return {
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageAmount:
        orders.length > 0
          ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length
          : 0,
      maxAmount: orders.length > 0 ? Math.max(...orders.map((order) => order.totalAmount)) : 0,
      minAmount: orders.length > 0 ? Math.min(...orders.map((order) => order.totalAmount)) : 0,
    };
  },
};

// 实现store动作
const actions: PurchaseOrderStoreActions = {
  // 订单管理
  async fetchOrders(params?: PurchaseOrderQueryParams) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;
    const setItems = usePurchaseOrderStore.getState().setItems;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await purchaseOrderService.getOrders(params);
        // setItems(response.data.items);

        // Mock数据 - 暂时返回空数组
        setItems([]);
        return [];
      },
      setLoading,
      setError
    );
  },

  async fetchOrderById(id: string) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;
    const setSelectedItem = usePurchaseOrderStore.getState().setSelectedItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await purchaseOrderService.getOrderById(id);
        // setSelectedItem(response.data);

        // Mock数据
        setSelectedItem(null);
        return null;
      },
      setLoading,
      setError
    );
  },

  async createOrder(data: PurchaseOrderFormData) {
    const setCreating = usePurchaseOrderStore.getState().setCreating;
    const setError = usePurchaseOrderStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await purchaseOrderService.createOrder(data);
        // return response.data.id;

        // Mock数据
        return 'mock-order-id-' + Date.now();
      },
      setCreating,
      setError
    );
  },

  async updateOrder(id: string, data: Partial<PurchaseOrderFormData>) {
    const setUpdating = usePurchaseOrderStore.getState().setUpdating;
    const setError = usePurchaseOrderStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.updateOrder(id, data);
        return true;
      },
      setUpdating,
      setError
    );
  },

  async deleteOrder(id: string) {
    const setDeleting = usePurchaseOrderStore.getState().setDeleting;
    const setError = usePurchaseOrderStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.deleteOrder(id);
        return true;
      },
      setDeleting,
      setError
    );
  },

  // 订单状态操作
  async approveOrder(id: string, remarks?: string) {
    const setUpdating = usePurchaseOrderStore.getState().setUpdating;
    const setError = usePurchaseOrderStore.getState().setError;
    const updateItem = usePurchaseOrderStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.approveOrder(id, remarks);

        // 乐观更新
        updateItem(id, {
          status: PurchaseOrderStatus.APPROVED,
          approvedAt: new Date().toISOString(),
        });
        return true;
      },
      setUpdating,
      setError
    );
  },

  async rejectOrder(id: string, remarks: string) {
    const setUpdating = usePurchaseOrderStore.getState().setUpdating;
    const setError = usePurchaseOrderStore.getState().setError;
    const updateItem = usePurchaseOrderStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.rejectOrder(id, remarks);

        // 乐观更新
        updateItem(id, {
          status: PurchaseOrderStatus.REJECTED,
          remarks,
        });
        return true;
      },
      setUpdating,
      setError
    );
  },

  async confirmOrder(id: string) {
    const setUpdating = usePurchaseOrderStore.getState().setUpdating;
    const setError = usePurchaseOrderStore.getState().setError;
    const updateItem = usePurchaseOrderStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.confirmOrder(id);

        // 乐观更新
        updateItem(id, { status: PurchaseOrderStatus.CONFIRMED });
        return true;
      },
      setUpdating,
      setError
    );
  },

  async cancelOrder(id: string, reason: string) {
    const setUpdating = usePurchaseOrderStore.getState().setUpdating;
    const setError = usePurchaseOrderStore.getState().setError;
    const updateItem = usePurchaseOrderStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.cancelOrder(id, reason);

        // 乐观更新
        updateItem(id, {
          status: PurchaseOrderStatus.CANCELLED,
          remarks: reason,
        });
        return true;
      },
      setUpdating,
      setError
    );
  },

  // 批量操作
  async batchApprove(orderIds: string[], remarks?: string) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;
    const updateItem = usePurchaseOrderStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.batchApprove(orderIds, remarks);

        // 乐观更新
        orderIds.forEach((id) => {
          updateItem(id, {
            status: PurchaseOrderStatus.APPROVED,
            approvedAt: new Date().toISOString(),
          });
        });
        return true;
      },
      setLoading,
      setError
    );
  },

  async batchDelete(orderIds: string[]) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;
    const removeItem = usePurchaseOrderStore.getState().removeItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.batchDelete(orderIds);

        // 乐观更新
        orderIds.forEach((id) => removeItem(id));
        return true;
      },
      setLoading,
      setError
    );
  },

  async batchCancel(orderIds: string[], reason: string) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;
    const updateItem = usePurchaseOrderStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.batchCancel(orderIds, reason);

        // 乐观更新
        orderIds.forEach((id) => {
          updateItem(id, {
            status: PurchaseOrderStatus.CANCELLED,
            remarks: reason,
          });
        });
        return true;
      },
      setLoading,
      setError
    );
  },

  // 统计数据
  async fetchStatistics() {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await purchaseOrderService.getStatistics();
        // return response.data;

        // Mock数据
        return {
          totalOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalPurchaseAmount: 0,
          monthlyPurchaseAmount: 0,
          averageOrderValue: 0,
          totalSuppliers: 0,
          activeSuppliers: 0,
          topSuppliers: [],
          topProducts: [],
          averageApprovalTime: 0,
          averageDeliveryTime: 0,
          onTimeDeliveryRate: 0,
        };
      },
      setLoading,
      setError
    );
  },

  // 订单项操作
  addOrderItem(item: PurchaseOrder['items'][0]) {
    const { editingItems } = usePurchaseOrderStore.getState();
    const newItems = [...editingItems, item];
    usePurchaseOrderStore.setState({ editingItems: newItems });
  },

  updateOrderItem(itemId: string, updates: Partial<PurchaseOrder['items'][0]>) {
    const { editingItems } = usePurchaseOrderStore.getState();
    const newItems = editingItems.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    usePurchaseOrderStore.setState({ editingItems: newItems });
  },

  removeOrderItem(itemId: string) {
    const { editingItems } = usePurchaseOrderStore.getState();
    const newItems = editingItems.filter((item) => item.id !== itemId);
    usePurchaseOrderStore.setState({ editingItems: newItems });
  },

  // 过滤器
  setStatusFilters(statuses: PurchaseOrderStatus[]) {
    usePurchaseOrderStore.setState({ statusFilters: statuses });
  },

  setPriorityFilter(priority?: PurchaseOrderPriority) {
    usePurchaseOrderStore.setState({ priorityFilter: priority });
  },

  setSupplierFilter(supplierId?: string) {
    usePurchaseOrderStore.setState({ supplierFilter: supplierId });
  },

  setDateRange(range: [string, string] | null) {
    usePurchaseOrderStore.setState({ dateRange: range });
  },

  clearFilters() {
    usePurchaseOrderStore.setState({
      statusFilters: [],
      priorityFilter: undefined,
      supplierFilter: undefined,
      dateRange: null,
    });
  },

  // 选择操作
  selectOrder(orderId: string, selected: boolean) {
    const { selectedOrderIds } = usePurchaseOrderStore.getState();
    const newSelection = selected
      ? [...selectedOrderIds, orderId]
      : selectedOrderIds.filter((id) => id !== orderId);
    usePurchaseOrderStore.setState({ selectedOrderIds: newSelection });
  },

  selectAllOrders(selected: boolean) {
    const { filteredOrders } = purchaseOrderStore;
    const newSelection = selected ? filteredOrders.map((order: PurchaseOrder) => order.id) : [];
    usePurchaseOrderStore.setState({ selectedOrderIds: newSelection });
  },

  clearSelection() {
    usePurchaseOrderStore.setState({ selectedOrderIds: [] });
  },

  // 编辑状态
  startEditing(order: PurchaseOrder) {
    usePurchaseOrderStore.setState({
      editingOrder: { ...order },
      editingItems: [...order.items],
    });
  },

  cancelEditing() {
    usePurchaseOrderStore.setState({
      editingOrder: null,
      editingItems: [],
    });
  },

  async saveEditing() {
    const { editingOrder } = usePurchaseOrderStore.getState();
    if (!editingOrder) return false;

    return this.updateOrder(editingOrder.id, {
      title: editingOrder.title,
      description: editingOrder.description,
      items: editingOrder.items,
    });
  },

  // 复制订单
  async duplicateOrder(orderId: string) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await purchaseOrderService.duplicateOrder(orderId);
        // return response.data.id;

        // Mock数据
        return 'mock-duplicated-order-id-' + Date.now();
      },
      setLoading,
      setError
    );
  },

  // 导出
  async exportOrders(params?: PurchaseOrderQueryParams) {
    const setLoading = usePurchaseOrderStore.getState().setLoading;
    const setError = usePurchaseOrderStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await purchaseOrderService.exportOrders(params);
        return;
      },
      setLoading,
      setError
    );
  },
};

// 将actions绑定到store
Object.assign(usePurchaseOrderStore.getState(), actions);

export default usePurchaseOrderStore;
