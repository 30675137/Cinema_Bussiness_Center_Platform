/**
 * @spec N001-purchase-inbound
 * 收货入库 API 服务
 */

import type {
  GoodsReceipt,
  CreateGoodsReceiptRequest,
  GoodsReceiptQueryParams,
  PaginatedResponse,
} from '../types';

const API_BASE = '/api/goods-receipts';

/**
 * 收货入库 API 客户端
 */
export const goodsReceiptApi = {
  /**
   * 获取收货入库单列表
   */
  async list(params?: GoodsReceiptQueryParams): Promise<PaginatedResponse<GoodsReceipt>> {
    const searchParams = new URLSearchParams();
    if (params?.storeId) searchParams.set('storeId', params.storeId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const url = `${API_BASE}?${searchParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`获取收货单列表失败: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * 获取收货入库单详情
   */
  async getById(id: string): Promise<{ success: boolean; data: GoodsReceipt }> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error(`获取收货单详情失败: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * 创建收货入库单
   */
  async create(data: CreateGoodsReceiptRequest): Promise<{ success: boolean; data: GoodsReceipt }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `创建收货单失败: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * 确认收货（更新库存）
   */
  async confirm(id: string): Promise<{ success: boolean; data: GoodsReceipt; message: string }> {
    const response = await fetch(`${API_BASE}/${id}/confirm`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `确认收货失败: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * 取消收货单
   */
  async cancel(id: string): Promise<{ success: boolean; data: GoodsReceipt; message: string }> {
    const response = await fetch(`${API_BASE}/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `取消收货单失败: ${response.statusText}`);
    }
    return response.json();
  },
};

export default goodsReceiptApi;
