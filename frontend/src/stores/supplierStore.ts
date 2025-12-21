/**
 * 供应商Store
 */
import { createStore, createModalStore, createAsyncAction } from './baseStore';
import {
  Supplier,
  SupplierStatus,
  SupplierLevel,
  SupplierType,
  SupplierQueryParams,
  CreateSupplierParams,
  UpdateSupplierParams,
  SupplierStatistics,
  SupplierBatchOperationParams
} from '../types/supplier';

// 供应商状态类型
export type SupplierStoreState = {
  // 数据状态
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  statistics: SupplierStatistics | null;

  // 过滤器状态
  statusFilter?: SupplierStatus;
  levelFilter?: SupplierLevel;
  typeFilter?: SupplierType;
  searchQuery: string;
  productCategoryFilter?: string;

  // 表单状态
  editingSupplier: Supplier | null;
  isEditing: boolean;

  // 批量操作状态
  selectedSupplierIds: string[];
  isBatchOperating: boolean;

  // 分页状态
  currentPage: number;
  pageSize: number;
  total: number;
};

// 供应商动作类型
export type SupplierStoreActions = {
  // 供应商管理
  fetchSuppliers: (params?: SupplierQueryParams) => Promise<void>;
  fetchSupplierById: (id: string) => Promise<void>;
  createSupplier: (data: CreateSupplierParams) => Promise<string | null>;
  updateSupplier: (id: string, data: UpdateSupplierParams) => Promise<boolean>;
  deleteSupplier: (id: string) => Promise<boolean>;

  // 供应商状态操作
  activateSupplier: (id: string, remarks?: string) => Promise<boolean>;
  suspendSupplier: (id: string, remarks?: string) => Promise<boolean>;
  terminateSupplier: (id: string, remarks?: string) => Promise<boolean>;

  // 批量操作
  batchActivate: (supplierIds: string[], remarks?: string) => Promise<boolean>;
  batchSuspend: (supplierIds: string[], remarks?: string) => Promise<boolean>;
  batchTerminate: (supplierIds: string[], remarks?: string) => Promise<boolean>;
  batchUpdateLevel: (supplierIds: string[], level: SupplierLevel) => Promise<boolean>;
  batchDelete: (supplierIds: string[]) => Promise<boolean>;

  // 统计数据
  fetchStatistics: () => Promise<void>;

  // 搜索和过滤
  searchSuppliers: (query: string) => Promise<void>;
  setStatusFilter: (status?: SupplierStatus) => void;
  setLevelFilter: (level?: SupplierLevel) => void;
  setTypeFilter: (type?: SupplierType) => void;
  setProductCategoryFilter: (category?: string) => void;
  clearFilters: () => void;

  // 选择操作
  selectSupplier: (supplierId: string, selected: boolean) => void;
  selectAllSuppliers: (selected: boolean) => void;
  clearSelection: () => void;

  // 编辑状态
  startEditing: (supplier: Supplier) => void;
  cancelEditing: () => void;
  saveEditing: () => Promise<boolean>;

  // 导入导出
  importSuppliers: (params: { fileUrl: string; overwrite?: boolean }) => Promise<{ success: number; failed: number }>;
  exportSuppliers: (params?: { supplierIds?: string[]; format?: string }) => Promise<string>;

  // 分页操作
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // 复制供应商
  duplicateSupplier: (id: string) => Promise<string | null>;

  // 供应商评价
  addEvaluation: (supplierId: string, evaluation: {
    evaluationType: string;
    score: number;
    comments?: string;
  }) => Promise<boolean>;

  // 更新供应商采购统计
  updatePurchaseStats: (supplierId: string) => Promise<boolean>;
};

// 创建供应商Store
export const useSupplierStore = createStore<Supplier>(
  'supplier',
  {
    // 初始数据状态
    suppliers: [],
    currentSupplier: null,
    statistics: null,

    // 过滤器初始状态
    statusFilter: undefined,
    levelFilter: undefined,
    typeFilter: undefined,
    searchQuery: '',
    productCategoryFilter: undefined,

    // 编辑状态
    editingSupplier: null,
    isEditing: false,

    // 批量操作状态
    selectedSupplierIds: [],
    isBatchOperating: false,

    // 分页状态
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
);

// 扩展store以添加供应商特定的动作
export const supplierStore = {
  ...useSupplierStore.getState(),

  // 获取过滤后的供应商
  get filteredSuppliers() {
    const {
      suppliers,
      statusFilter,
      levelFilter,
      typeFilter,
      searchQuery,
      productCategoryFilter
    } = useSupplierStore.getState();

    if (!suppliers || !Array.isArray(suppliers)) {
      return [];
    }

    return suppliers.filter(supplier => {
      // 状态过滤
      if (statusFilter && supplier.status !== statusFilter) {
        return false;
      }

      // 等级过滤
      if (levelFilter && supplier.level !== levelFilter) {
        return false;
      }

      // 类型过滤
      if (typeFilter && supplier.type !== typeFilter) {
        return false;
      }

      // 搜索查询过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          supplier.name,
          supplier.code,
          supplier.shortName || '',
          supplier.phone,
          supplier.email || ''
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // 供应品类过滤
      if (productCategoryFilter &&
          !supplier.productCategories.includes(productCategoryFilter)) {
        return false;
      }

      return true;
    });
  },

  // 获取选中的供应商
  get selectedSuppliers() {
    const { suppliers, selectedSupplierIds } = useSupplierStore.getState();
    if (!suppliers || !Array.isArray(suppliers) || !selectedSupplierIds) {
      return [];
    }
    return suppliers.filter(supplier => selectedSupplierIds.includes(supplier.id));
  },

  // 检查是否全选
  get isAllSelected() {
    const { filteredSuppliers, selectedSupplierIds } = this as any;
    return filteredSuppliers.length > 0 &&
           filteredSuppliers.every((supplier: Supplier) => selectedSupplierIds.includes(supplier.id));
  },

  // 获取供应商状态统计
  getStatusStatistics() {
    const { suppliers } = useSupplierStore.getState();

    if (!suppliers || !Array.isArray(suppliers)) {
      return {};
    }

    return suppliers.reduce((stats, supplier) => {
      const status = supplier.status;
      stats[status] = (stats[status] || 0) + 1;
      return stats;
    }, {} as Record<SupplierStatus, number>);
  },

  // 获取供应商等级统计
  getLevelStatistics() {
    const { suppliers } = useSupplierStore.getState();

    if (!suppliers || !Array.isArray(suppliers)) {
      return {};
    }

    return suppliers.reduce((stats, supplier) => {
      const level = supplier.level;
      stats[level] = (stats[level] || 0) + 1;
      return stats;
    }, {} as Record<SupplierLevel, number>);
  },

  // 获取活跃供应商数量
  get activeSupplierCount() {
    const { suppliers } = useSupplierStore.getState();
    if (!suppliers || !Array.isArray(suppliers)) {
      return 0;
    }
    return suppliers.filter(supplier => supplier.status === SupplierStatus.ACTIVE).length;
  },

  // 获取即将到期资质的供应商
  get suppliersWithExpiringQualifications() {
    const { suppliers } = useSupplierStore.getState();
    if (!suppliers || !Array.isArray(suppliers)) {
      return [];
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return suppliers.filter(supplier => {
      return supplier.qualifications.some(qualification => {
        if (qualification.expireDate) {
          const expireDate = new Date(qualification.expireDate);
          return expireDate <= thirtyDaysFromNow && expireDate > new Date();
        }
        return false;
      });
    });
  }
};

// 实现store动作
const actions: SupplierStoreActions = {
  // 供应商管理
  async fetchSuppliers(params?: SupplierQueryParams) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const setItems = useSupplierStore.getState().setItems;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.getSuppliers(params);
        // setItems(response.data.items);

        // Mock数据 - 暂时返回空数组
        setItems([]);
        return [];
      },
      setLoading,
      setError
    );
  },

  async fetchSupplierById(id: string) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const setSelectedItem = useSupplierStore.getState().setSelectedItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.getSupplierById(id);
        // setSelectedItem(response.data);

        // Mock数据
        setSelectedItem(null);
        return null;
      },
      setLoading,
      setError
    );
  },

  async createSupplier(data: CreateSupplierParams) {
    const setCreating = useSupplierStore.getState().setCreating;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.createSupplier(data);
        // return response.data.id;

        // Mock数据
        return 'mock-supplier-id-' + Date.now();
      },
      setCreating,
      setError
    );
  },

  async updateSupplier(id: string, data: UpdateSupplierParams) {
    const setUpdating = useSupplierStore.getState().setUpdating;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.updateSupplier(id, data);
        return true;
      },
      setUpdating,
      setError
    );
  },

  async deleteSupplier(id: string) {
    const setDeleting = useSupplierStore.getState().setDeleting;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.deleteSupplier(id);
        return true;
      },
      setDeleting,
      setError
    );
  },

  // 供应商状态操作
  async activateSupplier(id: string, remarks?: string) {
    const setUpdating = useSupplierStore.getState().setUpdating;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.activateSupplier(id, remarks);

        // 乐观更新
        updateItem(id, {
          status: SupplierStatus.ACTIVE,
          remarks
        });
        return true;
      },
      setUpdating,
      setError
    );
  },

  async suspendSupplier(id: string, remarks?: string) {
    const setUpdating = useSupplierStore.getState().setUpdating;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.suspendSupplier(id, remarks);

        // 乐观更新
        updateItem(id, {
          status: SupplierStatus.SUSPENDED,
          remarks
        });
        return true;
      },
      setUpdating,
      setError
    );
  },

  async terminateSupplier(id: string, remarks?: string) {
    const setUpdating = useSupplierStore.getState().setUpdating;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.terminateSupplier(id, remarks);

        // 乐观更新
        updateItem(id, {
          status: SupplierStatus.TERMINATED,
          remarks
        });
        return true;
      },
      setUpdating,
      setError
    );
  },

  // 批量操作
  async batchActivate(supplierIds: string[], remarks?: string) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.batchActivate(supplierIds, remarks);

        // 乐观更新
        supplierIds.forEach(id => {
          updateItem(id, {
            status: SupplierStatus.ACTIVE,
            remarks
          });
        });
        return true;
      },
      setLoading,
      setError
    );
  },

  async batchSuspend(supplierIds: string[], remarks?: string) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.batchSuspend(supplierIds, remarks);

        // 乐观更新
        supplierIds.forEach(id => {
          updateItem(id, {
            status: SupplierStatus.SUSPENDED,
            remarks
          });
        });
        return true;
      },
      setLoading,
      setError
    );
  },

  async batchTerminate(supplierIds: string[], remarks?: string) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.batchTerminate(supplierIds, remarks);

        // 乐观更新
        supplierIds.forEach(id => {
          updateItem(id, {
            status: SupplierStatus.TERMINATED,
            remarks
          });
        });
        return true;
      },
      setLoading,
      setError
    );
  },

  async batchUpdateLevel(supplierIds: string[], level: SupplierLevel) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const updateItem = useSupplierStore.getState().updateItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.batchUpdateLevel(supplierIds, level);

        // 乐观更新
        supplierIds.forEach(id => {
          updateItem(id, { level });
        });
        return true;
      },
      setLoading,
      setError
    );
  },

  async batchDelete(supplierIds: string[]) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;
    const removeItem = useSupplierStore.getState().removeItem;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.batchDelete(supplierIds);

        // 乐观更新
        supplierIds.forEach(id => removeItem(id));
        return true;
      },
      setLoading,
      setError
    );
  },

  // 统计数据
  async fetchStatistics() {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.getStatistics();
        // return response.data;

        // Mock数据
        return {
          totalSuppliers: 0,
          statusDistribution: {} as Record<SupplierStatus, number>,
          levelDistribution: {} as Record<SupplierLevel, number>,
          typeDistribution: {} as Record<SupplierType, number>,
          newSuppliersThisMonth: 0,
          activeSuppliersThisMonth: 0,
          averageRating: 0,
          expiringQualifications: 0,
        };
      },
      setLoading,
      setError
    );
  },

  // 搜索和过滤
  async searchSuppliers(query: string) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.searchSuppliers(query);
        // return response.data;

        // Mock数据
        return [];
      },
      setLoading,
      setError
    );
  },

  setStatusFilter(status?: SupplierStatus) {
    useSupplierStore.setState({ statusFilter: status });
  },

  setLevelFilter(level?: SupplierLevel) {
    useSupplierStore.setState({ levelFilter: level });
  },

  setTypeFilter(type?: SupplierType) {
    useSupplierStore.setState({ typeFilter: type });
  },

  setProductCategoryFilter(category?: string) {
    useSupplierStore.setState({ productCategoryFilter: category });
  },

  clearFilters() {
    useSupplierStore.setState({
      statusFilter: undefined,
      levelFilter: undefined,
      typeFilter: undefined,
      searchQuery: '',
      productCategoryFilter: undefined,
    });
  },

  // 选择操作
  selectSupplier(supplierId: string, selected: boolean) {
    const { selectedSupplierIds } = useSupplierStore.getState();
    const newSelection = selected
      ? [...selectedSupplierIds, supplierId]
      : selectedSupplierIds.filter(id => id !== supplierId);
    useSupplierStore.setState({ selectedSupplierIds: newSelection });
  },

  selectAllSuppliers(selected: boolean) {
    const { filteredSuppliers } = supplierStore;
    const newSelection = selected ? filteredSuppliers.map((supplier: Supplier) => supplier.id) : [];
    useSupplierStore.setState({ selectedSupplierIds: newSelection });
  },

  clearSelection() {
    useSupplierStore.setState({ selectedSupplierIds: [] });
  },

  // 编辑状态
  startEditing(supplier: Supplier) {
    useSupplierStore.setState({
      editingSupplier: { ...supplier },
      isEditing: true
    });
  },

  cancelEditing() {
    useSupplierStore.setState({
      editingSupplier: null,
      isEditing: false
    });
  },

  async saveEditing() {
    const { editingSupplier } = useSupplierStore.getState();
    if (!editingSupplier) return false;

    return this.updateSupplier(editingSupplier.id, {
      name: editingSupplier.name,
      shortName: editingSupplier.shortName,
      type: editingSupplier.type,
      level: editingSupplier.level,
      phone: editingSupplier.phone,
      email: editingSupplier.email,
      address: editingSupplier.address
    });
  },

  // 导入导出
  async importSuppliers(params: { fileUrl: string; overwrite?: boolean }) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.importSuppliers(params);
        // return response.data;

        // Mock数据
        return { success: 0, failed: 0 };
      },
      setLoading,
      setError
    );
  },

  async exportSuppliers(params?: { supplierIds?: string[]; format?: string }) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.exportSuppliers(params);
        // return response.data.downloadUrl;

        // Mock数据
        return 'mock-export-url-' + Date.now();
      },
      setLoading,
      setError
    );
  },

  // 分页操作
  setCurrentPage(page: number) {
    useSupplierStore.setState({ currentPage: page });
  },

  setPageSize(size: number) {
    useSupplierStore.setState({ pageSize: size, currentPage: 1 });
  },

  // 复制供应商
  async duplicateSupplier(id: string) {
    const setLoading = useSupplierStore.getState().setLoading;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // const response = await supplierService.duplicateSupplier(id);
        // return response.data.id;

        // Mock数据
        return 'mock-duplicated-supplier-id-' + Date.now();
      },
      setLoading,
      setError
    );
  },

  // 供应商评价
  async addEvaluation(supplierId: string, evaluation: {
    evaluationType: string;
    score: number;
    comments?: string;
  }) {
    const setUpdating = useSupplierStore.getState().setUpdating;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.addEvaluation(supplierId, evaluation);
        return true;
      },
      setUpdating,
      setError
    );
  },

  // 更新供应商采购统计
  async updatePurchaseStats(supplierId: string) {
    const setUpdating = useSupplierStore.getState().setUpdating;
    const setError = useSupplierStore.getState().setError;

    return createAsyncAction(
      async () => {
        // TODO: 调用API服务
        // await supplierService.updatePurchaseStats(supplierId);
        return true;
      },
      setUpdating,
      setError
    );
  },
};

// 将actions绑定到store
Object.assign(useSupplierStore.getState(), actions);

export default useSupplierStore;