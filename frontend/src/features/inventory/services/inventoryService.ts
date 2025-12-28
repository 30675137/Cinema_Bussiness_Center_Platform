/**
 * P003-inventory-query: 库存 API 服务
 * 
 * 提供库存列表查询、详情获取、分类列表、门店列表等接口。
 */

import axios from 'axios';
import type {
  InventoryQueryParams,
  InventoryListResponse,
  InventoryDetailResponse,
  CategoryListResponse,
  StoreListResponse,
} from '../types';

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
      // 未授权，跳转登录
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const API_BASE = '';

/**
 * 查询库存列表
 * 
 * @param params 查询参数
 * @returns 库存列表响应
 */
export async function listInventory(
  params: InventoryQueryParams
): Promise<InventoryListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.storeId) {
    searchParams.set('storeId', params.storeId);
  }
  if (params.keyword) {
    searchParams.set('keyword', params.keyword);
  }
  if (params.categoryId) {
    searchParams.set('categoryId', params.categoryId);
  }
  if (params.statuses && params.statuses.length > 0) {
    searchParams.set('statuses', params.statuses.join(','));
  }
  if (params.page) {
    searchParams.set('page', String(params.page));
  }
  if (params.pageSize) {
    searchParams.set('pageSize', String(params.pageSize));
  }

  const queryString = searchParams.toString();
  const url = `${API_BASE}/inventory${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<InventoryListResponse>(url);
  return response.data;
}

/**
 * 获取库存详情
 * 
 * @param id 库存记录ID
 * @returns 库存详情响应
 */
export async function getInventoryDetail(
  id: string
): Promise<InventoryDetailResponse> {
  const response = await apiClient.get<InventoryDetailResponse>(`${API_BASE}/inventory/${id}`);
  return response.data;
}

/**
 * 获取商品分类列表
 * 
 * @param status 分类状态（默认 ACTIVE）
 * @returns 分类列表响应
 */
export async function listCategories(
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE'
): Promise<CategoryListResponse> {
  const response = await apiClient.get<CategoryListResponse>(`${API_BASE}/categories?status=${status}`);
  return response.data;
}

/**
 * 获取当前用户可访问的门店列表
 * 
 * @returns 门店列表响应
 */
export async function listAccessibleStores(): Promise<StoreListResponse> {
  const response = await apiClient.get<StoreListResponse>(`${API_BASE}/stores/accessible`);
  return response.data;
}

export const inventoryService = {
  listInventory,
  getInventoryDetail,
  listCategories,
  listAccessibleStores,
};
