/**
 * 收货管理状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Receipt,
  ReceiptStatus,
  ReceiptPriority,
  QualityStatus,
  ReceiptQueryParams,
  ReceiptFilter,
  ReceiptStatistics,
  CreateReceiptParams,
  UpdateReceiptParams,
  ReceiptConfirmationParams,
  QualityCheckParams,
  ReceiptLog,
  ReturnRecord,
  } from '@/types/receipt';
import { generateOrderNumber, generateId } from '@/utils/helpers';
import { formatDate } from '@/utils/formatters';

interface ReceiptState {
  // 数据状态
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  statistics: ReceiptStatistics | null;
  logs: ReceiptLog[];
  returnRecords: ReturnRecord[];

  // 查询状态
  loading: boolean;
  error: string | null;

  // 过滤和分页状态
  filters: ReceiptFilter;
  currentPage: number;
  pageSize: number;
  totalCount: number;

  // 选择状态
  selectedReceiptIds: string[];

  // 编辑状态
  editingReceipt: Receipt | null;
  isFormVisible: boolean;
  isDetailVisible: boolean;
  isQualityCheckVisible: boolean;
  qualityCheckingItemId: string | null;
}

interface ReceiptActions {
  // 数据操作
  fetchReceipts: (params?: ReceiptQueryParams) => Promise<void>;
  fetchReceiptById: (id: string) => Promise<Receipt | null>;
  createReceipt: (data: CreateReceiptParams) => Promise<string | null>;
  updateReceipt: (id: string, data: UpdateReceiptParams) => Promise<boolean>;
  deleteReceipt: (id: string) => Promise<boolean>;
  confirmReceipt: (data: ReceiptConfirmationParams) => Promise<boolean>;
  cancelReceipt: (id: string, reason: string) => Promise<boolean>;

  // 质检操作
  startQualityCheck: (receiptId: string, itemId: string) => void;
  completeQualityCheck: (data: QualityCheckParams) => Promise<boolean>;
  approveQualityCheck: (receiptId: string, itemId: string) => Promise<boolean>;

  // 统计操作
  fetchStatistics: (params?: any) => Promise<void>;
  fetchLogs: (receiptId: string) => Promise<void>;
  fetchReturnRecords: (receiptId: string) => Promise<void>;

  // 过滤和搜索
  setFilters: (filters: ReceiptFilter) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // 选择操作
  selectReceipt: (id: string, selected: boolean) => void;
  selectAllReceipts: (selected: boolean) => void;
  clearSelection: () => void;

  // UI状态操作
  showForm: (receipt?: Receipt) => void;
  hideForm: () => void;
  showDetail: (receipt: Receipt) => void;
  hideDetail: () => void;
  showQualityCheck: (receiptId: string, itemId: string) => void;
  hideQualityCheck: () => void;

  // 批量操作
  batchDelete: (ids: string[]) => Promise<boolean>;
  batchCancel: (ids: string[], reason: string) => Promise<boolean>;
  batchApprove: (ids: string[]) => Promise<boolean>;

  // 导入导出
  exportReceipts: (ids?: string[], format?: 'excel' | 'pdf') => Promise<void>;
  importReceipts: (file: File) => Promise<void>;

  // 重置状态
  reset: () => void;
}

// 初始状态
const initialState: ReceiptState = {
  receipts: [],
  currentReceipt: null,
  statistics: null,
  logs: [],
  returnRecords: [],

  loading: false,
  error: null,

  filters: {},
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,

  selectedReceiptIds: [],

  editingReceipt: null,
  isFormVisible: false,
  isDetailVisible: false,
  isQualityCheckVisible: false,
  qualityCheckingItemId: null,
};

// 生成模拟数据
const generateMockReceipts = (count: number = 50): Receipt[] => {
  return Array.from({ length: count }, (_, index) => {
    const id = `receipt-${index + 1}`;
    const receiptNumber = `REC${String(index + 1).padStart(6, '0')}`;
    const status = Object.values(ReceiptStatus)[Math.floor(Math.random() * Object.values(ReceiptStatus).length)];
    const priority = Object.values(ReceiptPriority)[Math.floor(Math.random() * Object.values(ReceiptPriority).length)];

    const itemQuantity = Math.floor(Math.random() * 5) + 1;
    const items = Array.from({ length: itemQuantity }, (_, itemIndex) => ({
      id: `${id}-item-${itemIndex + 1}`,
      productId: `product-${index + 1}-${itemIndex + 1}`,
      productCode: `P${String(index + 1).padStart(4, '0')}${String(itemIndex + 1).padStart(2, '0')}`,
      productName: `商品 ${index + 1}-${itemIndex + 1}`,
      specification: `规格 ${itemIndex + 1}`,
      unit: '个',
      orderedQuantity: Math.floor(Math.random() * 100) + 10,
      receivedQuantity: Math.floor(Math.random() * 100) + 10,
      qualifiedQuantity: Math.floor(Math.random() * 80) + 20,
      defectiveQuantity: Math.floor(Math.random() * 10),
      unitPrice: Math.floor(Math.random() * 1000) + 100,
      totalPrice: 0,
      batchNumber: `B${Date.now()}${itemIndex}`,
      productionDate: '2024-01-01',
      expiryDate: '2025-12-31',
      warehouseLocation: `A区${itemIndex + 1}排`,
      qualityStatus: Object.values(QualityStatus)[Math.floor(Math.random() * Object.values(QualityStatus).length)],
      qualityResult: '质检结果',
      images: [],
      operator: `操作员${itemIndex + 1}`,
      checkTime: new Date().toISOString(),
      remarks: `备注信息${itemIndex + 1}`,
    }));

    items.forEach(item => {
      item.totalPrice = item.unitPrice * item.receivedQuantity;
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      id,
      receiptNumber,
      relatedOrderNumber: `PO${String(index + 1).padStart(6, '0')}`,
      status,
      priority,
      supplier: {
        id: `supplier-${index + 1}`,
        code: `SUP${String(index + 1).padStart(4, '0')}`,
        name: `供应商 ${index + 1}`,
        contact: `联系人${index + 1}`,
        phone: `1380013${String(index + 1).padStart(4, '0')}`,
      },
      warehouse: {
        id: `warehouse-${(index % 3) + 1}`,
        code: `WH${String((index % 3) + 1).padStart(2, '0')}`,
        name: `仓库 ${(index % 3) + 1}`,
        location: `位置 ${(index % 3) + 1}`,
        manager: `管理员${(index % 3) + 1}`,
      },
      receiptDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      operator: `收货员${(index % 5) + 1}`,
      reviewer: `复核员${(index % 3) + 1}`,
      approvalUser: `审批员${(index % 2) + 1}`,

      totalItems: items.length,
      totalOrderedQuantity: items.reduce((sum, item) => sum + item.orderedQuantity, 0),
      totalReceivedQuantity: items.reduce((sum, item) => sum + item.receivedQuantity, 0),
      totalQualifiedQuantity: items.reduce((sum, item) => sum + item.qualifiedQuantity, 0),
      totalDefectiveQuantity: items.reduce((sum, item) => sum + item.defectiveQuantity, 0),

      totalAmount,
      taxAmount: totalAmount * 0.13,
      totalAmountWithTax: totalAmount * 1.13,

      items,

      attachments: {
        deliveryNote: [`delivery-note-${id}.pdf`],
        qualityReport: Math.random() > 0.5 ? [`quality-report-${id}.pdf`] : undefined,
        images: Math.random() > 0.7 ? [`image-${id}-1.jpg`, `image-${id}-2.jpg`] : undefined,
        other: Math.random() > 0.8 ? [`other-${id}.docx`] : undefined,
      },

      remarks: `收货单备注 ${index + 1}`,
      createdById: 'user-1',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedById: 'user-1',
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// 生成模拟统计数据
const generateMockStatistics = (): ReceiptStatistics => ({
  totalReceipts: 156,
  pendingReceipts: 12,
  completedReceipts: 128,
  partialReceipts: 8,
  totalAmount: 2580000,
  monthlyStats: Array.from({ length: 6 }, (_, index) => ({
    month: `2024-${String(7 + index).padStart(2, '0')}`,
    count: Math.floor(Math.random() * 30) + 10,
    amount: Math.floor(Math.random() * 500000) + 100000,
  })),
  supplierStats: Array.from({ length: 5 }, (_, index) => ({
    supplierId: `supplier-${index + 1}`,
    supplierName: `供应商 ${index + 1}`,
    receiptCount: Math.floor(Math.random() * 20) + 5,
    totalAmount: Math.floor(Math.random() * 500000) + 100000,
    qualifiedRate: 95 + Math.random() * 4,
  })),
  warehouseStats: Array.from({ length: 3 }, (_, index) => ({
    warehouseId: `warehouse-${index + 1}`,
    warehouseName: `仓库 ${index + 1}`,
    receiptCount: Math.floor(Math.random() * 50) + 20,
    totalAmount: Math.floor(Math.random() * 1000000) + 200000,
  })),
});

export const useReceiptStore = create<ReceiptState & ReceiptActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 数据操作
      fetchReceipts: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 800));

          const mockReceipts = generateMockReceipts();

          // 应用过滤条件
          let filteredReceipts = mockReceipts;

          if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredReceipts = filteredReceipts.filter(receipt =>
              receipt.receiptNumber.toLowerCase().includes(searchLower) ||
              receipt.supplier.name.toLowerCase().includes(searchLower) ||
              receipt.operator.toLowerCase().includes(searchLower)
            );
          }

          if (params.status) {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.status === params.status);
          }

          if (params.priority) {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.priority === params.priority);
          }

          if (params.supplierId) {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.supplier.id === params.supplierId);
          }

          if (params.warehouseId) {
            filteredReceipts = filteredReceipts.filter(receipt => receipt.warehouse.id === params.warehouseId);
          }

          if (params.dateRange) {
            const [startDate, endDate] = params.dateRange;
            filteredReceipts = filteredReceipts.filter(receipt =>
              receipt.receiptDate >= startDate && receipt.receiptDate <= endDate
            );
          }

          // 应用排序
          if (params.sortBy) {
            filteredReceipts.sort((a, b) => {
              const aValue = a[params.sortBy!];
              const bValue = b[params.sortBy!];
              const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
              return params.sortOrder === 'desc' ? -result : result;
            });
          }

          // 应用分页
          const page = params.page || get().currentPage;
          const pageSize = params.pageSize || get().pageSize;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;

          set({
            receipts: filteredReceipts.slice(startIndex, endIndex),
            totalCount: filteredReceipts.length,
            loading: false,
          });
        } catch (error) {
          console.error('Fetch receipts error:', error);
          set({ error: '获取收货单失败', loading: false });
        }
      },

      fetchReceiptById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const mockReceipts = generateMockReceipts();
          const receipt = mockReceipts.find(r => r.id === id);

          set({
            currentReceipt: receipt || null,
            loading: false,
          });

          return receipt;
        } catch (error) {
          console.error('Fetch receipt by id error:', error);
          set({ error: '获取收货单详情失败', loading: false });
          return null;
        }
      },

      createReceipt: async (data: CreateReceiptParams) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const newReceipt: Receipt = {
            id: generateId(),
            receiptNumber: generateOrderNumber('REC'),
            status: ReceiptStatus.DRAFT,
            priority: data.priority || ReceiptPriority.NORMAL,
            relatedOrderNumber: data.relatedOrderNumber,
            supplier: {
              id: data.supplierId,
              code: '',
              name: '',
            },
            warehouse: {
              id: data.warehouseId,
              code: '',
              name: '',
            },
            receiptDate: formatDate(new Date()),
            expectedDate: data.expectedDate,
            operator: '当前用户',
            totalItems: data.items.length,
            totalOrderedQuantity: data.items.reduce((sum, item) => sum + item.orderedQuantity, 0),
            totalReceivedQuantity: 0,
            totalQualifiedQuantity: 0,
            totalDefectiveQuantity: 0,
            totalAmount: data.items.reduce((sum, item) => sum + item.totalPrice, 0),
            taxAmount: 0,
            totalAmountWithTax: 0,
            items: data.items.map(item => ({
              ...item,
              id: generateId(),
              receivedQuantity: 0,
              qualifiedQuantity: 0,
              defectiveQuantity: 0,
              qualityStatus: QualityStatus.PENDING,
            })),
            remarks: data.remarks,
            createdById: 'current-user',
            createdAt: new Date().toISOString(),
            updatedById: 'current-user',
            updatedAt: new Date().toISOString(),
          };

          // 添加到列表
          const { receipts } = get();
          set({
            receipts: [newReceipt, ...receipts],
            loading: false,
          });

          return newReceipt.id;
        } catch (error) {
          console.error('Create receipt error:', error);
          set({ error: '创建收货单失败', loading: false });
          return null;
        }
      },

      updateReceipt: async (id: string, data: UpdateReceiptParams) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 800));

          const { receipts } = get();
          const receiptIndex = receipts.findIndex(r => r.id === id);

          if (receiptIndex === -1) {
            set({ error: '收货单不存在', loading: false });
            return false;
          }

          const updatedReceipts = [...receipts];
          updatedReceipts[receiptIndex] = {
            ...updatedReceipts[receiptIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          };

          set({
            receipts: updatedReceipts,
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Update receipt error:', error);
          set({ error: '更新收货单失败', loading: false });
          return false;
        }
      },

      deleteReceipt: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const { receipts } = get();
          set({
            receipts: receipts.filter(r => r.id !== id),
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Delete receipt error:', error);
          set({ error: '删除收货单失败', loading: false });
          return false;
        }
      },

      confirmReceipt: async (data: ReceiptConfirmationParams) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          const { receipts } = get();
          const receiptIndex = receipts.findIndex(r => r.id === data.receiptId);

          if (receiptIndex === -1) {
            set({ error: '收货单不存在', loading: false });
            return false;
          }

          const updatedReceipts = [...receipts];
          const receipt = { ...updatedReceipts[receiptIndex] };

          // 更新明细
          receipt.items = receipt.items.map(item => {
            const confirmItem = data.items.find(d => d.id === item.id);
            if (confirmItem) {
              return {
                ...item,
                ...confirmItem,
              };
            }
            return item;
          });

          // 重新计算统计数据
          receipt.totalReceivedQuantity = receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
          receipt.totalQualifiedQuantity = receipt.items.reduce((sum, item) => sum + item.qualifiedQuantity, 0);
          receipt.totalDefectiveQuantity = receipt.items.reduce((sum, item) => sum + item.defectiveQuantity, 0);

          // 判断收货状态
          const allItemsReceived = receipt.items.every(item => item.receivedQuantity >= item.orderedQuantity);
          receipt.status = allItemsReceived ? ReceiptStatus.COMPLETED : ReceiptStatus.PARTIAL_RECEIVED;

          receipt.updatedAt = new Date().toISOString();
          updatedReceipts[receiptIndex] = receipt;

          set({
            receipts: updatedReceipts,
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Confirm receipt error:', error);
          set({ error: '确认收货失败', loading: false });
          return false;
        }
      },

      cancelReceipt: async (id: string, reason: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const { receipts } = get();
          const receiptIndex = receipts.findIndex(r => r.id === id);

          if (receiptIndex === -1) {
            set({ error: '收货单不存在', loading: false });
            return false;
          }

          const updatedReceipts = [...receipts];
          updatedReceipts[receiptIndex] = {
            ...updatedReceipts[receiptIndex],
            status: ReceiptStatus.CANCELLED,
            remarks: `${updatedReceipts[receiptIndex].remarks || ''}\n取消原因：${reason}`,
            updatedAt: new Date().toISOString(),
          };

          set({
            receipts: updatedReceipts,
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Cancel receipt error:', error);
          set({ error: '取消收货单失败', loading: false });
          return false;
        }
      },

      // 质检操作
      startQualityCheck: (receiptId: string, itemId: string) => {
        set({
          qualityCheckingItemId: itemId,
          isQualityCheckVisible: true,
        });
      },

      completeQualityCheck: async (data: QualityCheckParams) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { receipts } = get();
          const receiptIndex = receipts.findIndex(r => r.id === data.receiptId);

          if (receiptIndex === -1) {
            set({ error: '收货单不存在', loading: false });
            return false;
          }

          const updatedReceipts = [...receipts];
          const receipt = { ...updatedReceipts[receiptIndex] };

          receipt.items = receipt.items.map(item => {
            if (item.id === data.itemId) {
              return {
                ...item,
                qualityStatus: data.qualityStatus,
                qualifiedQuantity: data.qualifiedQuantity || 0,
                defectiveQuantity: data.defectiveQuantity || 0,
                qualityResult: data.qualityResult,
                images: data.images || [],
              };
            }
            return item;
          });

          receipt.updatedAt = new Date().toISOString();
          updatedReceipts[receiptIndex] = receipt;

          set({
            receipts: updatedReceipts,
            loading: false,
            isQualityCheckVisible: false,
            qualityCheckingItemId: null,
          });

          return true;
        } catch (error) {
          console.error('Complete quality check error:', error);
          set({ error: '完成质检失败', loading: false });
          return false;
        }
      },

      approveQualityCheck: async (receiptId: string, itemId: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const { receipts } = get();
          const receiptIndex = receipts.findIndex(r => r.id === receiptId);

          if (receiptIndex === -1) {
            set({ error: '收货单不存在', loading: false });
            return false;
          }

          const updatedReceipts = [...receipts];
          const receipt = { ...updatedReceipts[receiptIndex] };

          receipt.items = receipt.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                qualityStatus: QualityStatus.PASSED,
              };
            }
            return item;
          });

          receipt.updatedAt = new Date().toISOString();
          updatedReceipts[receiptIndex] = receipt;

          set({
            receipts: updatedReceipts,
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Approve quality check error:', error);
          set({ error: '审批质检失败', loading: false });
          return false;
        }
      },

      // 统计操作
      fetchStatistics: async (params = {}) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ statistics: generateMockStatistics() });
        } catch (error) {
          console.error('Fetch statistics error:', error);
        }
      },

      fetchLogs: async (receiptId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const mockLogs: ReceiptLog[] = Array.from({ length: 5 }, (_, index) => ({
            id: `log-${receiptId}-${index + 1}`,
            receiptId,
            action: 'create',
            actionText: `操作记录 ${index + 1}`,
            operator: '操作员',
            operatorName: '操作员姓名',
            timestamp: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
            details: `操作详情 ${index + 1}`,
          }));
          set({ logs: mockLogs });
        } catch (error) {
          console.error('Fetch logs error:', error);
        }
      },

      fetchReturnRecords: async (receiptId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const mockReturnRecords: ReturnRecord[] = Array.from({ length: 2 }, (_, index) => ({
            id: `return-${receiptId}-${index + 1}`,
            receiptId,
            receiptItemId: `${receiptId}-item-${index + 1}`,
            returnQuantity: Math.floor(Math.random() * 10) + 1,
            returnReason: `退货原因 ${index + 1}`,
            returnDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            processor: `处理员 ${index + 1}`,
            status: 'completed',
            remarks: `退货备注 ${index + 1}`,
            createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
          }));
          set({ returnRecords: mockReturnRecords });
        } catch (error) {
          console.error('Fetch return records error:', error);
        }
      },

      // 过滤和搜索
      setFilters: (filters: ReceiptFilter) => {
        set({ filters });
        get().fetchReceipts();
      },

      setSearchQuery: (query: string) => {
        const { filters } = get();
        set({ filters: { ...filters, search: query } });
        get().fetchReceipts();
      },

      setCurrentPage: (page: number) => {
        set({ currentPage: page });
        get().fetchReceipts();
      },

      setPageSize: (size: number) => {
        set({ pageSize: size, currentPage: 1 });
        get().fetchReceipts();
      },

      // 选择操作
      selectReceipt: (id: string, selected: boolean) => {
        const { selectedReceiptIds } = get();
        const newSelectedIds = selected
          ? [...selectedReceiptIds, id]
          : selectedReceiptIds.filter(selectedId => selectedId !== id);
        set({ selectedReceiptIds: newSelectedIds });
      },

      selectAllReceipts: (selected: boolean) => {
        const { receipts } = get();
        set({
          selectedReceiptIds: selected ? receipts.map(r => r.id) : [],
        });
      },

      clearSelection: () => {
        set({ selectedReceiptIds: [] });
      },

      // UI状态操作
      showForm: (receipt?: Receipt) => {
        set({
          editingReceipt: receipt || null,
          isFormVisible: true,
          isDetailVisible: false,
        });
      },

      hideForm: () => {
        set({
          editingReceipt: null,
          isFormVisible: false,
        });
      },

      showDetail: (receipt: Receipt) => {
        set({
          currentReceipt: receipt,
          isDetailVisible: true,
          isFormVisible: false,
        });
      },

      hideDetail: () => {
        set({
          currentReceipt: null,
          isDetailVisible: false,
        });
      },

      showQualityCheck: (receiptId: string, itemId: string) => {
        set({
          qualityCheckingItemId: itemId,
          isQualityCheckVisible: true,
        });
      },

      hideQualityCheck: () => {
        set({
          qualityCheckingItemId: null,
          isQualityCheckVisible: false,
        });
      },

      // 批量操作
      batchDelete: async (ids: string[]) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { receipts } = get();
          set({
            receipts: receipts.filter(r => !ids.includes(r.id)),
            selectedReceiptIds: [],
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Batch delete error:', error);
          set({ error: '批量删除失败', loading: false });
          return false;
        }
      },

      batchCancel: async (ids: string[], reason: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { receipts } = get();
          const updatedReceipts = receipts.map(receipt => {
            if (ids.includes(receipt.id)) {
              return {
                ...receipt,
                status: ReceiptStatus.CANCELLED,
                remarks: `${receipt.remarks || ''}\n批量取消原因：${reason}`,
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          });

          set({
            receipts: updatedReceipts,
            selectedReceiptIds: [],
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Batch cancel error:', error);
          set({ error: '批量取消失败', loading: false });
          return false;
        }
      },

      batchApprove: async (ids: string[]) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { receipts } = get();
          const updatedReceipts = receipts.map(receipt => {
            if (ids.includes(receipt.id)) {
              return {
                ...receipt,
                status: ReceiptStatus.COMPLETED,
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          });

          set({
            receipts: updatedReceipts,
            selectedReceiptIds: [],
            loading: false,
          });

          return true;
        } catch (error) {
          console.error('Batch approve error:', error);
          set({ error: '批量审批失败', loading: false });
          return false;
        }
      },

      // 导入导出
      exportReceipts: async (ids?: string[], format = 'excel') => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log(`导出收货单 ${format} 格式`, ids);
          set({ loading: false });
        } catch (error) {
          console.error('Export receipts error:', error);
          set({ error: '导出失败', loading: false });
        }
      },

      importReceipts: async (file: File) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('导入收货单', file.name);
          set({ loading: false });
        } catch (error) {
          console.error('Import receipts error:', error);
          set({ error: '导入失败', loading: false });
        }
      },

      // 重置状态
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'receipt-store',
      partialize: (state) => ({
        filters: state.filters,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
      }),
    }
  )
);