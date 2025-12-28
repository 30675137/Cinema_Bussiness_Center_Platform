/**
 * P004-inventory-adjustment: 库存调整 API 服务
 * 
 * 提供库存调整创建、查询、撤回等接口。
 */

import axios from 'axios';
import type {
  InventoryAdjustment,
  AdjustmentReason,
  CreateAdjustmentRequest,
  AdjustmentQueryParams,
  AdjustmentResponse,
  AdjustmentListResponse,
  AdjustmentDetailResponse,
  ReasonListResponse,
  UpdateSafetyStockRequest,
} from '../types/adjustment';

// ========== Axios 实例 ==========

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== 调整原因 API ==========

/**
 * 获取调整原因字典
 * 
 * @returns 原因列表响应
 */
export async function listAdjustmentReasons(): Promise<ReasonListResponse> {
  const response = await apiClient.get<ReasonListResponse>('/adjustment-reasons');
  return response.data;
}

// ========== 库存调整 API ==========

/**
 * 创建库存调整
 * 
 * @param data 调整数据
 * @returns 调整记录响应
 */
export async function createAdjustment(
  data: CreateAdjustmentRequest
): Promise<AdjustmentResponse> {
  const response = await apiClient.post<AdjustmentResponse>('/adjustments', data);
  return response.data;
}

/**
 * 查询调整列表
 * 
 * @param params 查询参数
 * @returns 调整列表响应
 */
export async function listAdjustments(
  params?: AdjustmentQueryParams
): Promise<AdjustmentListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.skuId) {
    searchParams.set('skuId', params.skuId);
  }
  if (params?.storeId) {
    searchParams.set('storeId', params.storeId);
  }
  if (params?.status && params.status.length > 0) {
    searchParams.set('status', params.status.join(','));
  }
  if (params?.adjustmentType) {
    searchParams.set('adjustmentType', params.adjustmentType);
  }
  if (params?.startDate) {
    searchParams.set('startDate', params.startDate);
  }
  if (params?.endDate) {
    searchParams.set('endDate', params.endDate);
  }
  if (params?.page) {
    searchParams.set('page', String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set('pageSize', String(params.pageSize));
  }

  const queryString = searchParams.toString();
  const url = `/adjustments${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<AdjustmentListResponse>(url);
  return response.data;
}

/**
 * 获取调整详情
 * 
 * @param id 调整记录ID
 * @returns 调整详情响应
 */
export async function getAdjustment(
  id: string
): Promise<AdjustmentDetailResponse> {
  const response = await apiClient.get<AdjustmentDetailResponse>(`/adjustments/${id}`);
  return response.data;
}

/**
 * 撤回调整申请
 * 
 * @param id 调整记录ID
 * @returns 调整记录响应
 */
export async function withdrawAdjustment(
  id: string
): Promise<AdjustmentResponse> {
  const response = await apiClient.post<AdjustmentResponse>(`/adjustments/${id}/withdraw`);
  return response.data;
}

// ========== 安全库存 API ==========

/**
 * 更新安全库存阈值
 * 
 * @param inventoryId 库存记录ID
 * @param data 更新数据
 * @returns 更新后的库存信息
 */
export async function updateSafetyStock(
  inventoryId: string,
  data: UpdateSafetyStockRequest
): Promise<{
  success: boolean;
  data?: { id: string; safetyStock: number; version: number; updatedAt: string };
  error?: string;
  message?: string;
}> {
  const response = await apiClient.put(`/inventory/${inventoryId}/safety-stock`, data);
  return response.data;
}

// ========== 服务导出 ==========

export const adjustmentService = {
  // 调整原因
  listAdjustmentReasons,

  // 库存调整
  createAdjustment,
  listAdjustments,
  getAdjustment,
  withdrawAdjustment,

  // 安全库存
  updateSafetyStock,
};

export default adjustmentService;
