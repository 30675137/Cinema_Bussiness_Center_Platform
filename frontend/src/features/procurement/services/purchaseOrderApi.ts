/**
 * @spec N001-purchase-inbound
 * 采购订单 API 服务
 */
import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  PurchaseOrderQueryParams,
  ApiResponse,
  PaginatedResponse,
  Supplier,
  PurchaseOrderStatusHistory,
  PurchaseOrderSummary,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// 采购订单 API
export const purchaseOrderApi = {
  /**
   * 获取采购订单列表
   */
  async list(params?: PurchaseOrderQueryParams): Promise<PaginatedResponse<PurchaseOrder>> {
    const searchParams = new URLSearchParams();
    if (params?.storeId) searchParams.append('storeId', params.storeId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize));

    const query = searchParams.toString();
    const url = `${API_BASE}/purchase-orders${query ? `?${query}` : ''}`;
    return fetchJson<PaginatedResponse<PurchaseOrder>>(url);
  },

  /**
   * 获取采购订单详情
   */
  async getById(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return fetchJson<ApiResponse<PurchaseOrder>>(`${API_BASE}/purchase-orders/${id}`);
  },

  /**
   * 创建采购订单
   */
  async create(data: CreatePurchaseOrderRequest): Promise<ApiResponse<PurchaseOrder>> {
    return fetchJson<ApiResponse<PurchaseOrder>>(`${API_BASE}/purchase-orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除采购订单
   */
  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 提交审核
   */
  async submit(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return fetchJson<ApiResponse<PurchaseOrder>>(`${API_BASE}/purchase-orders/${id}/submit`, {
      method: 'POST',
    });
  },

  /**
   * 审批通过
   */
  async approve(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return fetchJson<ApiResponse<PurchaseOrder>>(`${API_BASE}/purchase-orders/${id}/approve`, {
      method: 'POST',
    });
  },

  /**
   * 审批拒绝
   */
  async reject(id: string, reason: string): Promise<ApiResponse<PurchaseOrder>> {
    return fetchJson<ApiResponse<PurchaseOrder>>(`${API_BASE}/purchase-orders/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * 获取订单状态变更历史
   */
  async getStatusHistory(id: string): Promise<ApiResponse<PurchaseOrderStatusHistory[]>> {
    return fetchJson<ApiResponse<PurchaseOrderStatusHistory[]>>(
      `${API_BASE}/purchase-orders/${id}/history`
    );
  },

  /**
   * 获取订单统计摘要
   */
  async getOrderSummary(storeId?: string): Promise<ApiResponse<PurchaseOrderSummary>> {
    const url = storeId
      ? `${API_BASE}/purchase-orders/summary?storeId=${storeId}`
      : `${API_BASE}/purchase-orders/summary`;
    return fetchJson<ApiResponse<PurchaseOrderSummary>>(url);
  },

  /**
   * 获取待审批订单列表
   */
  async getPendingApproval(page = 1, pageSize = 20): Promise<PaginatedResponse<PurchaseOrder>> {
    return fetchJson<PaginatedResponse<PurchaseOrder>>(
      `${API_BASE}/purchase-orders/pending-approval?page=${page}&pageSize=${pageSize}`
    );
  },
};

// 供应商 API
export const supplierApi = {
  /**
   * 获取供应商列表
   */
  async list(status?: string): Promise<ApiResponse<Supplier[]>> {
    const url = status
      ? `${API_BASE}/suppliers?status=${status}`
      : `${API_BASE}/suppliers`;
    return fetchJson<ApiResponse<Supplier[]>>(url);
  },
};
