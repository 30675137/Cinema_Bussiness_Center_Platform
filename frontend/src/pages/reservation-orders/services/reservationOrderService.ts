/**
 * 预约单管理 - API 服务
 */

import type {
  ReservationOrder,
  ReservationListItem,
  ReservationListResponse,
  ReservationListQueryRequest,
  ConfirmReservationRequest,
  CancelReservationRequest,
  UpdateReservationRequest,
  CreateReservationRequest,
} from '../types/reservation-order.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// B端管理 API 路径
const ADMIN_API_PATH = '/api/admin/reservations';
// C端客户 API 路径
const CLIENT_API_PATH = '/api/client/reservations';

/**
 * API 响应接口
 */
interface ApiResponseData<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

/**
 * 处理 API 响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    if (response.status === 400) {
      throw new Error(error.message || '请求参数错误');
    }
    if (response.status === 401) {
      throw new Error(error.message || '未授权，请重新登录');
    }
    if (response.status === 403) {
      throw new Error(error.message || '没有权限执行此操作');
    }
    if (response.status === 404) {
      throw new Error(error.message || '预约单不存在');
    }
    if (response.status === 409) {
      throw new Error(error.message || '状态冲突');
    }
    if (response.status === 422) {
      throw new Error(error.message || '库存不足');
    }

    throw new Error(error.message || `请求失败: ${response.statusText}`);
  }

  const result: ApiResponseData<T> = await response.json();

  if (result.success === false) {
    throw new Error(result.message || '操作失败');
  }

  return result.data as T;
}

/**
 * 获取请求头
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 从 localStorage 获取 JWT Token
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// ============== B端管理 API ==============

/**
 * 后端分页响应格式
 */
interface BackendPageResponse {
  success: boolean;
  data: ReservationListItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  message?: string;
}

/**
 * 获取预约单列表 (B端)
 */
export async function getReservationList(
  params?: ReservationListQueryRequest
): Promise<ReservationListResponse> {
  const url = new URL(`${API_BASE_URL}${ADMIN_API_PATH}`);

  if (params) {
    // 添加查询参数
    if (params.orderNumber) {
      url.searchParams.append('orderNumber', params.orderNumber);
    }
    if (params.contactPhone) {
      url.searchParams.append('contactPhone', params.contactPhone);
    }
    if (params.statuses && params.statuses.length > 0) {
      params.statuses.forEach((status) => {
        url.searchParams.append('statuses', status);
      });
    }
    if (params.scenarioPackageId) {
      url.searchParams.append('scenarioPackageId', params.scenarioPackageId);
    }
    if (params.reservationDateStart) {
      url.searchParams.append('reservationDateStart', params.reservationDateStart);
    }
    if (params.reservationDateEnd) {
      url.searchParams.append('reservationDateEnd', params.reservationDateEnd);
    }
    if (params.createdAtStart) {
      url.searchParams.append('createdAtStart', params.createdAtStart);
    }
    if (params.createdAtEnd) {
      url.searchParams.append('createdAtEnd', params.createdAtEnd);
    }
    if (params.page !== undefined) {
      url.searchParams.append('page', String(params.page));
    }
    if (params.size !== undefined) {
      url.searchParams.append('size', String(params.size));
    }
    if (params.sortBy) {
      url.searchParams.append('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      url.searchParams.append('sortDirection', params.sortDirection);
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `请求失败: ${response.statusText}`);
  }

  const result: BackendPageResponse = await response.json();

  if (result.success === false) {
    throw new Error(result.message || '操作失败');
  }

  // 转换后端响应格式为前端期望的格式
  return {
    content: result.data || [],
    totalElements: result.total || 0,
    totalPages: result.totalPages || 0,
    number: result.page || 0,
    size: result.size || 20,
    first: (result.page || 0) === 0,
    last: (result.page || 0) >= (result.totalPages || 1) - 1,
    empty: !result.data || result.data.length === 0,
  };
}

/**
 * 获取预约单详情 (B端)
 */
export async function getReservationDetail(id: string): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${ADMIN_API_PATH}/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<ReservationOrder>(response);
}

/**
 * 确认预约 (B端)
 */
export async function confirmReservation(
  id: string,
  request: ConfirmReservationRequest
): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${ADMIN_API_PATH}/${id}/confirm`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });

  return handleResponse<ReservationOrder>(response);
}

/**
 * 取消预约 (B端)
 */
export async function cancelReservation(
  id: string,
  request: CancelReservationRequest
): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${ADMIN_API_PATH}/${id}/cancel`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });

  return handleResponse<ReservationOrder>(response);
}

/**
 * 修改预约信息 (B端)
 */
export async function updateReservation(
  id: string,
  request: UpdateReservationRequest
): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${ADMIN_API_PATH}/${id}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });

  return handleResponse<ReservationOrder>(response);
}

// ============== C端客户 API ==============

/**
 * 创建预约 (C端)
 */
export async function createReservation(
  request: CreateReservationRequest
): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${CLIENT_API_PATH}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });

  return handleResponse<ReservationOrder>(response);
}

/**
 * 获取用户的预约单列表 (C端)
 */
export async function getUserReservations(params?: {
  page?: number;
  size?: number;
  status?: string;
}): Promise<ReservationListResponse> {
  const url = new URL(`${API_BASE_URL}${CLIENT_API_PATH}`);

  if (params) {
    if (params.page !== undefined) {
      url.searchParams.append('page', String(params.page));
    }
    if (params.size !== undefined) {
      url.searchParams.append('size', String(params.size));
    }
    if (params.status) {
      url.searchParams.append('status', params.status);
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<ReservationListResponse>(response);
}

/**
 * 获取用户预约单详情 (C端)
 */
export async function getUserReservationDetail(id: string): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${CLIENT_API_PATH}/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<ReservationOrder>(response);
}

/**
 * 支付回调处理 (C端)
 */
export async function handlePaymentCallback(
  orderId: string,
  paymentId: string
): Promise<ReservationOrder> {
  const url = `${API_BASE_URL}${CLIENT_API_PATH}/${orderId}/payment`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ paymentId }),
  });

  return handleResponse<ReservationOrder>(response);
}

// ============== 导出服务对象 ==============

export const reservationOrderService = {
  // B端管理 API
  getList: getReservationList,
  getDetail: getReservationDetail,
  confirm: confirmReservation,
  cancel: cancelReservation,
  update: updateReservation,

  // C端客户 API
  create: createReservation,
  getUserList: getUserReservations,
  getUserDetail: getUserReservationDetail,
  handlePayment: handlePaymentCallback,
};

export default reservationOrderService;
