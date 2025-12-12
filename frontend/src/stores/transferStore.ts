/**
 * 调拨管理 Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Transfer,
  TransferStatus,
  TransferType,
  TransferPriority,
  TransferStatistics,
  TransferFilters,
  TransferQueryParams,
  TransferFormData,
  Location,
  InventoryQueryResult,
  TransferLog,
  LocationTransferHistory,
  TransferReportData
} from '@/types/transfer';
import { generateId, generateOrderNumber, deepClone } from '@/utils/helpers';

/**
 * 调拨管理状态接口
 */
interface TransferState {
  // 数据状态
  transfers: Transfer[];
  currentTransfer: Transfer | null;
  statistics: TransferStatistics | null;

  // 位置信息
  locations: Location[];

  // 查询参数
  queryParams: TransferQueryParams;

  // UI状态
  loading: boolean;
  error: string | null;

  // 选择状态
  selectedTransferIds: string[];

  // 表单状态
  showForm: boolean;
  formMode: 'create' | 'edit';
  formInitialData: TransferFormData | null;

  // 详情状态
  showDetail: boolean;
  detailTransferId: string | null;

  // 审批状态
  showApproval: boolean;
  approvalTransferId: string | null;

  // 操作日志
  transferLogs: TransferLog[];

  // 变更历史
  locationHistory: LocationTransferHistory[];

  // 报表数据
  reportData: TransferReportData | null;
}

/**
 * 调拨管理操作接口
 */
interface TransferActions {
  // 数据操作
  fetchTransfers: (params?: TransferQueryParams) => Promise<void>;
  fetchTransferById: (id: string) => Promise<void>;
  createTransfer: (data: TransferFormData) => Promise<string>;
  updateTransfer: (id: string, data: Partial<TransferFormData>) => Promise<boolean>;
  deleteTransfer: (id: string) => Promise<boolean>;

  // 状态操作
  submitTransfer: (id: string) => Promise<boolean>;
  approveTransfer: (id: string, remarks?: string) => Promise<boolean>;
  rejectTransfer: (id: string, reason: string) => Promise<boolean>;
  startTransfer: (id: string, trackingNumber?: string) => Promise<boolean>;
  completeTransfer: (id: string, items: Array<{ itemId: string; actualQuantity: number }>) => Promise<boolean>;
  cancelTransfer: (id: string, reason: string) => Promise<boolean>;

  // 批量操作
  batchDelete: (ids: string[]) => Promise<boolean>;
  batchApprove: (ids: string[]) => Promise<boolean>;
  batchReject: (ids: string[], reason: string) => Promise<boolean>;

  // 选择操作
  selectTransfer: (id: string) => void;
  selectAllTransfers: () => void;
  clearSelection: () => void;

  // 过滤和排序
  setFilters: (filters: TransferFilters) => void;
  setQueryParams: (params: Partial<TransferQueryParams>) => void;
  clearFilters: () => void;

  // UI操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 表单操作
  showCreateForm: () => void;
  showEditForm: (transfer: Transfer) => void;
  hideForm: () => void;

  // 详情操作
  showDetail: (transferId: string) => void;
  hideDetail: () => void;

  // 审批操作
  showApprovalDialog: (transferId: string) => void;
  hideApprovalDialog: () => void;

  // 统计操作
  fetchStatistics: () => Promise<void>;

  // 位置操作
  fetchLocations: () => Promise<void>;
  getInventoryByLocation: (locationId: string, productId?: string) => Promise<InventoryQueryResult[]>;

  // 日志操作
  fetchTransferLogs: (transferId: string) => Promise<void>;

  // 历史操作
  fetchLocationHistory: (params?: { locationId?: string; dateRange?: [string, string] }) => Promise<void>;

  // 报表操作
  fetchReportData: (period: string) => Promise<void>;
}

/**
 * 初始化状态
 */
const initialState: TransferState = {
  transfers: [],
  currentTransfer: null,
  statistics: null,
  locations: [],
  queryParams: {
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
  selectedTransferIds: [],
  showForm: false,
  formMode: 'create',
  formInitialData: null,
  showDetail: false,
  detailTransferId: null,
  showApproval: false,
  approvalTransferId: null,
  transferLogs: [],
  locationHistory: [],
  reportData: null,
};

/**
 * 生成模拟调拨数据
 */
const generateMockTransfers = (): Transfer[] => {
  const statuses = Object.values(TransferStatus);
  const types = Object.values(TransferType);
  const priorities = Object.values(TransferPriority);

  return Array.from({ length: 50 }, (_, index) => {
    const id = `transfer-${index + 1}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const plannedDate = new Date(2024, 0, 1 + Math.floor(Math.random() * 365));
    const actualShipDate = status === TransferStatus.IN_TRANSIT || status === TransferStatus.COMPLETED
      ? new Date(plannedDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
      : undefined;
    const actualReceiveDate = status === TransferStatus.COMPLETED
      ? new Date(actualShipDate!.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : undefined;

    const items = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, itemIndex) => {
      const plannedQuantity = Math.floor(Math.random() * 100) + 10;
      const unitPrice = Math.floor(Math.random() * 1000) + 100;

      return {
        id: `${id}-item-${itemIndex + 1}`,
        transferId: id,
        productId: `product-${Math.floor(Math.random() * 100) + 1}`,
        productName: `商品${itemIndex + 1}`,
        productCode: `P${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        skuId: `sku-${Math.floor(Math.random() * 100) + 1}`,
        skuCode: `SKU${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        skuName: `规格${itemIndex + 1}`,
        unit: ['个', '箱', '件', '套'][Math.floor(Math.random() * 4)],
        plannedQuantity,
        actualQuantity: status === TransferStatus.COMPLETED ? Math.floor(Math.random() * plannedQuantity) : undefined,
        receivedQuantity: status === TransferStatus.COMPLETED || status === TransferStatus.PARTIAL_RECEIVED
          ? Math.floor(Math.random() * plannedQuantity)
          : undefined,
        unitPrice,
        totalPrice: plannedQuantity * unitPrice,
        batchNumber: `B${String(Math.floor(Math.random() * 10000) + 1).padStart(5, '0')}`,
        productionDate: new Date(2024, 0, 1 + Math.floor(Math.random() * 180)).toISOString().split('T')[0],
        expiryDate: new Date(2025, 0, 1 + Math.floor(Math.random() * 180)).toISOString().split('T')[0],
        remarks: Math.random() > 0.7 ? `备注信息${itemIndex + 1}` : undefined,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      id,
      transferNumber: generateOrderNumber('TR'),
      type,
      status,
      priority,
      title: `调拨单 ${index + 1}`,
      description: Math.random() > 0.6 ? `调拨描述信息${index + 1}` : undefined,
      fromLocation: {
        type: Math.random() > 0.5 ? 'warehouse' : 'store',
        id: `location-${Math.floor(Math.random() * 20) + 1}`,
        name: `${Math.random() > 0.5 ? '仓库' : '门店'}${Math.floor(Math.random() * 20) + 1}`,
        code: `LOC${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
        address: `地址${Math.floor(Math.random() * 100) + 1}`,
        contactName: `联系人${Math.floor(Math.random() * 100) + 1}`,
        contactPhone: `138${String(Math.floor(Math.random() * 100000000) + 1).padStart(8, '0')}`,
      },
      toLocation: {
        type: Math.random() > 0.5 ? 'warehouse' : 'store',
        id: `location-${Math.floor(Math.random() * 20) + 21}`,
        name: `${Math.random() > 0.5 ? '仓库' : '门店'}${Math.floor(Math.random() * 20) + 21}`,
        code: `LOC${String(Math.floor(Math.random() * 100) + 101).padStart(3, '0')}`,
        address: `地址${Math.floor(Math.random() * 100) + 101}`,
        contactName: `联系人${Math.floor(Math.random() * 100) + 101}`,
        contactPhone: `139${String(Math.floor(Math.random() * 100000000) + 1).padStart(8, '0')}`,
      },
      plannedDate: plannedDate.toISOString().split('T')[0],
      actualShipDate: actualShipDate?.toISOString().split('T')[0],
      actualReceiveDate: actualReceiveDate?.toISOString().split('T')[0],
      shippingMethod: 'company_logistics',
      trackingNumber: Math.random() > 0.5 ? `TRK${String(Math.floor(Math.random() * 1000000000) + 1).padStart(10, '0')}` : undefined,
      carrier: Math.random() > 0.5 ? '顺丰快递' : undefined,
      estimatedArrivalDate: actualShipDate ? new Date(actualShipDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      totalAmount,
      shippingCost: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : undefined,
      insuranceCost: Math.random() > 0.8 ? Math.floor(Math.random() * 200) + 20 : undefined,
      applicant: {
        id: `user-${Math.floor(Math.random() * 50) + 1}`,
        name: `申请人${Math.floor(Math.random() * 50) + 1}`,
        department: `部门${Math.floor(Math.random() * 10) + 1}`,
      },
      approver: status === TransferStatus.APPROVED || status === TransferStatus.COMPLETED || status === TransferStatus.IN_TRANSIT ? {
        id: `approver-${Math.floor(Math.random() * 20) + 1}`,
        name: `审批人${Math.floor(Math.random() * 20) + 1}`,
        position: '经理',
        approveTime: new Date(plannedDate.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        remarks: Math.random() > 0.7 ? `审批意见${index + 1}` : undefined,
      } : undefined,
      operator: status === TransferStatus.IN_TRANSIT || status === TransferStatus.COMPLETED ? {
        id: `operator-${Math.floor(Math.random() * 30) + 1}`,
        name: `操作员${Math.floor(Math.random() * 30) + 1}`,
        position: '仓管员',
      } : undefined,
      items,
      attachments: [],
      remarks: Math.random() > 0.6 ? `备注信息${index + 1}` : undefined,
      createdBy: `user-${Math.floor(Math.random() * 50) + 1}`,
      createdAt: new Date(plannedDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: `user-${Math.floor(Math.random() * 50) + 1}`,
      updatedAt: new Date(plannedDate.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

/**
 * 生成模拟位置数据
 */
const generateMockLocations = (): Location[] => {
  return Array.from({ length: 40 }, (_, index) => ({
    id: `location-${index + 1}`,
    type: index % 2 === 0 ? 'warehouse' : 'store',
    code: `LOC${String(index + 1).padStart(3, '0')}`,
    name: index % 2 === 0 ? `仓库${index + 1}` : `门店${index + 1}`,
    address: `地址${index + 1}号`,
    contactName: `联系人${index + 1}`,
    contactPhone: `13${String(8 + index).padStart(1, '0')}${String(Math.floor(Math.random() * 100000000) + 1).padStart(8, '0')}`,
    isActive: true,
  }));
};

/**
 * 生成模拟统计数据
 */
const generateMockStatistics = (transfers: Transfer[]): TransferStatistics => {
  const totalTransfers = transfers.length;
  const draftTransfers = transfers.filter(t => t.status === TransferStatus.DRAFT).length;
  const pendingApprovalTransfers = transfers.filter(t => t.status === TransferStatus.PENDING_APPROVAL).length;
  const inTransitTransfers = transfers.filter(t => t.status === TransferStatus.IN_TRANSIT).length;
  const completedTransfers = transfers.filter(t => t.status === TransferStatus.COMPLETED).length;
  const cancelledTransfers = transfers.filter(t => t.status === TransferStatus.CANCELLED).length;

  const transfersByType = {
    warehouseToWarehouse: transfers.filter(t => t.type === TransferType.WAREHOUSE_TO_WAREHOUSE).length,
    storeToStore: transfers.filter(t => t.type === TransferType.STORE_TO_STORE).length,
    warehouseToStore: transfers.filter(t => t.type === TransferType.WAREHOUSE_TO_STORE).length,
    storeToWarehouse: transfers.filter(t => t.type === TransferType.STORE_TO_WAREHOUSE).length,
    emergency: transfers.filter(t => t.type === TransferType.EMERGENCY).length,
  };

  const transfersByStatus = {
    draft: transfers.filter(t => t.status === TransferStatus.DRAFT).length,
    pendingApproval: transfers.filter(t => t.status === TransferStatus.PENDING_APPROVAL).length,
    approved: transfers.filter(t => t.status === TransferStatus.APPROVED).length,
    inTransit: transfers.filter(t => t.status === TransferStatus.IN_TRANSIT).length,
    completed: transfers.filter(t => t.status === TransferStatus.COMPLETED).length,
    cancelled: transfers.filter(t => t.status === TransferStatus.CANCELLED).length,
  };

  const totalAmount = transfers.reduce((sum, t) => sum + t.totalAmount, 0);
  const currentMonth = new Date().getMonth();
  const monthAmount = transfers
    .filter(t => new Date(t.createdAt).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const averageAmount = totalTransfers > 0 ? totalAmount / totalTransfers : 0;

  return {
    totalTransfers,
    draftTransfers,
    pendingApprovalTransfers,
    inTransitTransfers,
    completedTransfers,
    cancelledTransfers,
    transfersByType,
    transfersByStatus,
    totalAmount,
    monthAmount,
    averageAmount,
    averageProcessingTime: 24,
    averageTransitTime: 48,
  };
};

/**
 * 调拨管理 Store
 */
export const useTransferStore = create<TransferState & TransferActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // 获取调拨列表
      fetchTransfers: async (params?: TransferQueryParams) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));

          let transfers = generateMockTransfers();

          // 应用过滤条件
          if (params) {
            const { search, status, type, priority, dateRange } = params;

            if (search) {
              transfers = transfers.filter(t =>
                t.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.fromLocation.name.toLowerCase().includes(search.toLowerCase()) ||
                t.toLocation.name.toLowerCase().includes(search.toLowerCase())
              );
            }

            if (status) {
              if (Array.isArray(status)) {
                transfers = transfers.filter(t => status.includes(t.status));
              } else {
                transfers = transfers.filter(t => t.status === status);
              }
            }

            if (type) {
              if (Array.isArray(type)) {
                transfers = transfers.filter(t => type.includes(t.type));
              } else {
                transfers = transfers.filter(t => t.type === type);
              }
            }

            if (priority) {
              if (Array.isArray(priority)) {
                transfers = transfers.filter(t => priority.includes(t.priority));
              } else {
                transfers = transfers.filter(t => t.priority === priority);
              }
            }

            if (dateRange) {
              const [startDate, endDate] = dateRange;
              transfers = transfers.filter(t =>
                t.plannedDate >= startDate && t.plannedDate <= endDate
              );
            }
          }

          // 应用排序
          const { sortBy = 'createdAt', sortOrder = 'desc' } = params || {};
          transfers.sort((a, b) => {
            const aValue = a[sortBy as keyof Transfer];
            const bValue = b[sortBy as keyof Transfer];

            if (aValue === undefined || bValue === undefined) return 0;

            if (sortOrder === 'asc') {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });

          // 应用分页
          const { page = 1, pageSize = 10 } = params || {};
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          transfers = transfers.slice(startIndex, endIndex);

          set(state => {
            state.transfers = transfers;
            state.queryParams = { ...state.queryParams, ...params };
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = '获取调拨列表失败';
            state.loading = false;
          });
        }
      },

      // 获取调拨详情
      fetchTransferById: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const transfers = generateMockTransfers();
          const transfer = transfers.find(t => t.id === id);

          if (transfer) {
            set(state => {
              state.currentTransfer = transfer;
              state.loading = false;
            });
          } else {
            set(state => {
              state.error = '调拨不存在';
              state.loading = false;
            });
          }
        } catch (error) {
          set(state => {
            state.error = '获取调拨详情失败';
            state.loading = false;
          });
        }
      },

      // 创建调拨
      createTransfer: async (data: TransferFormData) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const id = generateId();
          const transferNumber = generateOrderNumber('TR');

          const locations = get().locations;
          const fromLocation = locations.find(l => l.id === data.fromLocationId);
          const toLocation = locations.find(l => l.id === data.toLocationId);

          if (!fromLocation || !toLocation) {
            throw new Error('位置信息无效');
          }

          const items = data.items.map((item, index) => ({
            ...item,
            id: `${id}-item-${index + 1}`,
            transferId: id,
            totalPrice: item.plannedQuantity * item.unitPrice,
          }));

          const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

          const newTransfer: Transfer = {
            id,
            transferNumber,
            type: data.type,
            status: TransferStatus.DRAFT,
            priority: data.priority,
            title: data.title,
            description: data.description,
            fromLocation: {
              type: fromLocation.type,
              id: fromLocation.id,
              name: fromLocation.name,
              code: fromLocation.code,
              address: fromLocation.address,
              contactName: fromLocation.contactName,
              contactPhone: fromLocation.contactPhone,
            },
            toLocation: {
              type: toLocation.type,
              id: toLocation.id,
              name: toLocation.name,
              code: toLocation.code,
              address: toLocation.address,
              contactName: toLocation.contactName,
              contactPhone: toLocation.contactPhone,
            },
            plannedDate: data.plannedDate,
            shippingMethod: data.shippingMethod,
            estimatedArrivalDate: data.estimatedArrivalDate,
            totalAmount,
            applicant: {
              id: 'current-user',
              name: '当前用户',
              department: '采购部',
            },
            items,
            attachments: [],
            remarks: data.remarks,
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            updatedBy: 'current-user',
            updatedAt: new Date().toISOString(),
          };

          set(state => {
            state.transfers.unshift(newTransfer);
            state.loading = false;
          });

          return id;
        } catch (error) {
          set(state => {
            state.error = '创建调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 更新调拨
      updateTransfer: async (id: string, data: Partial<TransferFormData>) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          set(state => {
            const index = state.transfers.findIndex(t => t.id === id);
            if (index !== -1) {
              const transfer = state.transfers[index];

              if (data.fromLocationId) {
                const location = state.locations.find(l => l.id === data.fromLocationId);
                if (location) {
                  transfer.fromLocation = {
                    type: location.type,
                    id: location.id,
                    name: location.name,
                    code: location.code,
                    address: location.address,
                    contactName: location.contactName,
                    contactPhone: location.contactPhone,
                  };
                }
              }

              if (data.toLocationId) {
                const location = state.locations.find(l => l.id === data.toLocationId);
                if (location) {
                  transfer.toLocation = {
                    type: location.type,
                    id: location.id,
                    name: location.name,
                    code: location.code,
                    address: location.address,
                    contactName: location.contactName,
                    contactPhone: location.contactPhone,
                  };
                }
              }

              if (data.items) {
                const items = data.items.map((item, index) => ({
                  ...item,
                  id: item.id || `${id}-item-${index + 1}`,
                  transferId: id,
                  totalPrice: item.plannedQuantity * item.unitPrice,
                }));

                transfer.items = items;
                transfer.totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
              }

              Object.assign(transfer, data);
              transfer.updatedAt = new Date().toISOString();
            }

            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '更新调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 删除调拨
      deleteTransfer: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            state.transfers = state.transfers.filter(t => t.id !== id);
            state.selectedTransferIds = state.selectedTransferIds.filter(selectedId => selectedId !== id);
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '删除调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 提交调拨审批
      submitTransfer: async (id: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            const transfer = state.transfers.find(t => t.id === id);
            if (transfer) {
              transfer.status = TransferStatus.PENDING_APPROVAL;
              transfer.updatedAt = new Date().toISOString();
            }
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '提交调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 审批通过
      approveTransfer: async (id: string, remarks?: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            const transfer = state.transfers.find(t => t.id === id);
            if (transfer) {
              transfer.status = TransferStatus.APPROVED;
              transfer.approver = {
                id: 'current-user',
                name: '当前用户',
                position: '经理',
                approveTime: new Date().toISOString(),
                remarks,
              };
              transfer.updatedAt = new Date().toISOString();
            }
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '审批调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 审批拒绝
      rejectTransfer: async (id: string, reason: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            const transfer = state.transfers.find(t => t.id === id);
            if (transfer) {
              transfer.status = TransferStatus.REJECTED;
              transfer.approver = {
                id: 'current-user',
                name: '当前用户',
                position: '经理',
                approveTime: new Date().toISOString(),
                remarks: reason,
              };
              transfer.updatedAt = new Date().toISOString();
            }
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '拒绝调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 开始调拨
      startTransfer: async (id: string, trackingNumber?: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            const transfer = state.transfers.find(t => t.id === id);
            if (transfer) {
              transfer.status = TransferStatus.IN_TRANSIT;
              transfer.actualShipDate = new Date().toISOString().split('T')[0];
              transfer.trackingNumber = trackingNumber;
              transfer.operator = {
                id: 'current-user',
                name: '当前用户',
                position: '仓管员',
              };
              transfer.updatedAt = new Date().toISOString();
            }
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '开始调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 完成调拨
      completeTransfer: async (id: string, items: Array<{ itemId: string; actualQuantity: number }>) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            const transfer = state.transfers.find(t => t.id === id);
            if (transfer) {
              // 更新实际收货数量
              items.forEach(({ itemId, actualQuantity }) => {
                const item = transfer.items.find(i => i.id === itemId);
                if (item) {
                  item.actualQuantity = actualQuantity;
                  item.receivedQuantity = actualQuantity;
                }
              });

              transfer.status = TransferStatus.COMPLETED;
              transfer.actualReceiveDate = new Date().toISOString().split('T')[0];
              transfer.updatedAt = new Date().toISOString();
            }
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '完成调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 取消调拨
      cancelTransfer: async (id: string, reason: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          set(state => {
            const transfer = state.transfers.find(t => t.id === id);
            if (transfer) {
              transfer.status = TransferStatus.CANCELLED;
              transfer.remarks = reason;
              transfer.updatedAt = new Date().toISOString();
            }
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '取消调拨失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 批量删除
      batchDelete: async (ids: string[]) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          set(state => {
            state.transfers = state.transfers.filter(t => !ids.includes(t.id));
            state.selectedTransferIds = [];
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '批量删除失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 批量审批
      batchApprove: async (ids: string[]) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          set(state => {
            ids.forEach(id => {
              const transfer = state.transfers.find(t => t.id === id);
              if (transfer) {
                transfer.status = TransferStatus.APPROVED;
                transfer.approver = {
                  id: 'current-user',
                  name: '当前用户',
                  position: '经理',
                  approveTime: new Date().toISOString(),
                };
                transfer.updatedAt = new Date().toISOString();
              }
            });
            state.selectedTransferIds = [];
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '批量审批失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 批量拒绝
      batchReject: async (ids: string[], reason: string) => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          set(state => {
            ids.forEach(id => {
              const transfer = state.transfers.find(t => t.id === id);
              if (transfer) {
                transfer.status = TransferStatus.REJECTED;
                transfer.approver = {
                  id: 'current-user',
                  name: '当前用户',
                  position: '经理',
                  approveTime: new Date().toISOString(),
                  remarks: reason,
                };
                transfer.updatedAt = new Date().toISOString();
              }
            });
            state.selectedTransferIds = [];
            state.loading = false;
          });

          return true;
        } catch (error) {
          set(state => {
            state.error = '批量拒绝失败';
            state.loading = false;
          });
          throw error;
        }
      },

      // 选择调拨
      selectTransfer: (id: string) => {
        set(state => {
          const index = state.selectedTransferIds.indexOf(id);
          if (index === -1) {
            state.selectedTransferIds.push(id);
          } else {
            state.selectedTransferIds.splice(index, 1);
          }
        });
      },

      // 全选
      selectAllTransfers: () => {
        set(state => {
          state.selectedTransferIds = state.transfers.map(t => t.id);
        });
      },

      // 清空选择
      clearSelection: () => {
        set(state => {
          state.selectedTransferIds = [];
        });
      },

      // 设置过滤条件
      setFilters: (filters: TransferFilters) => {
        set(state => {
          Object.assign(state.queryParams, filters);
        });
      },

      // 设置查询参数
      setQueryParams: (params: Partial<TransferQueryParams>) => {
        set(state => {
          Object.assign(state.queryParams, params);
        });
      },

      // 清空过滤条件
      clearFilters: () => {
        set(state => {
          state.queryParams = {
            page: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          };
        });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set(state => {
          state.loading = loading;
        });
      },

      // 设置错误信息
      setError: (error: string | null) => {
        set(state => {
          state.error = error;
        });
      },

      // 显示创建表单
      showCreateForm: () => {
        set(state => {
          state.showForm = true;
          state.formMode = 'create';
          state.formInitialData = null;
        });
      },

      // 显示编辑表单
      showEditForm: (transfer: Transfer) => {
        set(state => {
          state.showForm = true;
          state.formMode = 'edit';
          state.formInitialData = {
            type: transfer.type,
            priority: transfer.priority,
            title: transfer.title,
            description: transfer.description,
            fromLocationId: transfer.fromLocation.id,
            toLocationId: transfer.toLocation.id,
            plannedDate: transfer.plannedDate,
            shippingMethod: transfer.shippingMethod,
            estimatedArrivalDate: transfer.estimatedArrivalDate,
            items: transfer.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productCode: item.productCode,
              skuId: item.skuId,
              skuCode: item.skuCode,
              skuName: item.skuName,
              unit: item.unit,
              plannedQuantity: item.plannedQuantity,
              unitPrice: item.unitPrice,
              batchNumber: item.batchNumber,
              productionDate: item.productionDate,
              expiryDate: item.expiryDate,
              remarks: item.remarks,
            })),
            remarks: transfer.remarks,
          };
        });
      },

      // 隐藏表单
      hideForm: () => {
        set(state => {
          state.showForm = false;
          state.formMode = 'create';
          state.formInitialData = null;
        });
      },

      // 显示详情
      showDetail: (transferId: string) => {
        set(state => {
          state.showDetail = true;
          state.detailTransferId = transferId;
        });
      },

      // 隐藏详情
      hideDetail: () => {
        set(state => {
          state.showDetail = false;
          state.detailTransferId = null;
          state.currentTransfer = null;
        });
      },

      // 显示审批对话框
      showApprovalDialog: (transferId: string) => {
        set(state => {
          state.showApproval = true;
          state.approvalTransferId = transferId;
        });
      },

      // 隐藏审批对话框
      hideApprovalDialog: () => {
        set(state => {
          state.showApproval = false;
          state.approvalTransferId = null;
        });
      },

      // 获取统计数据
      fetchStatistics: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const transfers = generateMockTransfers();
          const statistics = generateMockStatistics(transfers);

          set(state => {
            state.statistics = statistics;
          });
        } catch (error) {
          console.error('获取统计数据失败:', error);
        }
      },

      // 获取位置列表
      fetchLocations: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const locations = generateMockLocations();

          set(state => {
            state.locations = locations;
          });
        } catch (error) {
          console.error('获取位置列表失败:', error);
        }
      },

      // 根据位置获取库存
      getInventoryByLocation: async (locationId: string, productId?: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const inventoryData: InventoryQueryResult[] = Array.from({ length: 20 }, (_, index) => ({
            productId: `product-${index + 1}`,
            productName: `商品${index + 1}`,
            productCode: `P${String(index + 1).padStart(4, '0')}`,
            skuId: `sku-${index + 1}`,
            skuCode: `SKU${String(index + 1).padStart(4, '0')}`,
            skuName: `规格${index + 1}`,
            currentStock: Math.floor(Math.random() * 1000) + 100,
            availableStock: Math.floor(Math.random() * 800) + 50,
            reservedStock: Math.floor(Math.random() * 200),
            unitPrice: Math.floor(Math.random() * 1000) + 100,
            unit: ['个', '箱', '件', '套'][Math.floor(Math.random() * 4)],
            location: locationId,
            batchNumber: `B${String(index + 1).padStart(5, '0')}`,
            expiryDate: new Date(2025, 0, 1 + Math.floor(Math.random() * 180)).toISOString().split('T')[0],
          }));

          if (productId) {
            return inventoryData.filter(item => item.productId === productId);
          }

          return inventoryData;
        } catch (error) {
          console.error('获取库存信息失败:', error);
          return [];
        }
      },

      // 获取操作日志
      fetchTransferLogs: async (transferId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const logs: TransferLog[] = [
            {
              id: 'log-1',
              transferId,
              action: 'created',
              actionBy: { id: 'user-1', name: '张三' },
              actionTime: new Date().toISOString(),
              description: '创建调拨单',
            },
            {
              id: 'log-2',
              transferId,
              action: 'submitted',
              actionBy: { id: 'user-1', name: '张三' },
              actionTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              description: '提交审批',
            },
          ];

          set(state => {
            state.transferLogs = logs;
          });
        } catch (error) {
          console.error('获取操作日志失败:', error);
        }
      },

      // 获取位置变更历史
      fetchLocationHistory: async (params?: { locationId?: string; dateRange?: [string, string] }) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const history: LocationTransferHistory[] = Array.from({ length: 50 }, (_, index) => ({
            id: `history-${index + 1}`,
            productId: `product-${Math.floor(Math.random() * 100) + 1}`,
            fromLocation: `location-${Math.floor(Math.random() * 20) + 1}`,
            toLocation: `location-${Math.floor(Math.random() * 20) + 21}`,
            transferId: `transfer-${Math.floor(Math.random() * 100) + 1}`,
            transferNumber: generateOrderNumber('TR'),
            quantity: Math.floor(Math.random() * 100) + 10,
            transferDate: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)).toISOString().split('T')[0],
            operator: `操作员${Math.floor(Math.random() * 50) + 1}`,
          }));

          if (params?.locationId) {
            const filtered = history.filter(h =>
              h.fromLocation === params.locationId || h.toLocation === params.locationId
            );

            set(state => {
              state.locationHistory = filtered;
            });
          } else {
            set(state => {
              state.locationHistory = history;
            });
          }
        } catch (error) {
          console.error('获取位置变更历史失败:', error);
        }
      },

      // 获取报表数据
      fetchReportData: async (period: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 800));

          const reportData: TransferReportData = {
            period,
            totalTransfers: 156,
            totalAmount: 2850000,
            transfersByType: {
              [TransferType.WAREHOUSE_TO_WAREHOUSE]: 45,
              [TransferType.STORE_TO_STORE]: 38,
              [TransferType.WAREHOUSE_TO_STORE]: 52,
              [TransferType.STORE_TO_WAREHOUSE]: 18,
              [TransferType.EMERGENCY]: 3,
            },
            transfersByStatus: {
              draft: 8,
              pending_approval: 12,
              approved: 25,
              in_transit: 35,
              completed: 68,
              cancelled: 8,
            },
            topLocations: [
              { location: '仓库1', transferCount: 42, totalAmount: 850000 },
              { location: '门店5', transferCount: 38, totalAmount: 620000 },
              { location: '仓库2', transferCount: 35, totalAmount: 580000 },
              { location: '门店3', transferCount: 28, totalAmount: 450000 },
              { location: '门店7', transferCount: 23, totalAmount: 350000 },
            ],
            averageProcessingTime: 18.5,
            completionRate: 87.5,
          };

          set(state => {
            state.reportData = reportData;
          });
        } catch (error) {
          console.error('获取报表数据失败:', error);
        }
      },
    })),
    {
      name: 'transfer-store',
      partialize: (state) => ({
        transfers: state.transfers,
        locations: state.locations,
        queryParams: state.queryParams,
        statistics: state.statistics,
      }),
    }
  )
);

/**
 * 选择器函数
 */
export const useTransferSelectors = {
  // 获取过滤后的调拨列表
  filteredTransfers: () => useTransferStore(state => state.transfers),

  // 获取选中的调拨
  selectedTransfers: () => useTransferStore(state =>
    state.transfers.filter(t => state.selectedTransferIds.includes(t.id))
  ),

  // 获取统计信息
  statistics: () => useTransferStore(state => state.statistics),

  // 获取加载状态
  isLoading: () => useTransferStore(state => state.loading),

  // 获取错误信息
  error: () => useTransferStore(state => state.error),

  // 获取表单状态
  formState: () => useTransferStore(state => ({
    showForm: state.showForm,
    formMode: state.formMode,
    formInitialData: state.formInitialData,
  })),

  // 获取详情状态
  detailState: () => useTransferStore(state => ({
    showDetail: state.showDetail,
    detailTransferId: state.detailTransferId,
    currentTransfer: state.currentTransfer,
  })),

  // 获取位置列表
  locations: () => useTransferStore(state => state.locations),

  // 获取操作日志
  transferLogs: () => useTransferStore(state => state.transferLogs),

  // 获取位置变更历史
  locationHistory: () => useTransferStore(state => state.locationHistory),

  // 获取报表数据
  reportData: () => useTransferStore(state => state.reportData),
};