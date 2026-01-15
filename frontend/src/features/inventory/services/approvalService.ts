/**
 * P004-inventory-adjustment: 审批 API 服务
 *
 * 提供待审批列表查询、审批通过/拒绝等接口。
 */

import axios from 'axios';
import type {
  InventoryAdjustment,
  ApprovalRequest,
  AdjustmentListResponse,
  ApprovalResponse,
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

// ========== 审批 API ==========

/**
 * 获取待审批列表
 *
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 待审批调整列表
 */
export async function listPendingApprovals(
  page: number = 1,
  pageSize: number = 20
): Promise<AdjustmentListResponse> {
  const response = await apiClient.get<AdjustmentListResponse>(
    `/approvals/pending?page=${page}&pageSize=${pageSize}`
  );
  return response.data;
}

/**
 * 执行审批操作
 *
 * @param adjustmentId 调整记录ID
 * @param data 审批数据
 * @returns 审批响应
 */
export async function processApproval(
  adjustmentId: string,
  data: ApprovalRequest
): Promise<ApprovalResponse> {
  const response = await apiClient.post<ApprovalResponse>(`/approvals/${adjustmentId}`, data);
  return response.data;
}

/**
 * 批准调整
 *
 * @param adjustmentId 调整记录ID
 * @param comments 审批意见
 * @returns 审批响应
 */
export async function approveAdjustment(
  adjustmentId: string,
  comments?: string
): Promise<ApprovalResponse> {
  return processApproval(adjustmentId, { action: 'approve', comments });
}

/**
 * 拒绝调整
 *
 * @param adjustmentId 调整记录ID
 * @param comments 拒绝原因
 * @returns 审批响应
 */
export async function rejectAdjustment(
  adjustmentId: string,
  comments?: string
): Promise<ApprovalResponse> {
  return processApproval(adjustmentId, { action: 'reject', comments });
}

/**
 * 获取待审批数量（用于菜单徽章）
 *
 * @returns 待审批数量
 */
export async function getPendingCount(): Promise<number> {
  try {
    const response = await listPendingApprovals(1, 1);
    return response.total || 0;
  } catch {
    return 0;
  }
}

// ========== 服务导出 ==========

export const approvalService = {
  listPendingApprovals,
  processApproval,
  approveAdjustment,
  rejectAdjustment,
  getPendingCount,
};

export default approvalService;
