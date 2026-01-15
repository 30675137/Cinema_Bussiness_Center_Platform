/**
 * @spec N002-unify-supplier-data
 * @spec N003-supplier-edit
 * 供应商 API 服务 - 统一供应商数据源
 *
 * 提供以下功能：
 * - fetchSuppliers: 获取供应商列表
 * - fetchSuppliersAsFull: 获取完整供应商信息列表
 * - fetchSupplierById: 获取单个供应商详情
 * - createSupplier: 创建新供应商 (N003)
 * - updateSupplier: 更新供应商信息 (N003)
 */

import { SupplierStatus, SupplierType, SupplierLevel } from '@/types/supplier';
import type { Supplier } from '@/types/supplier';

const API_BASE = '/api';

/**
 * 后端返回的供应商 DTO
 */
interface SupplierDTO {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
}

/**
 * 统一 API 响应格式
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

/**
 * 供应商列表视图项（简化版本，用于列表展示）
 */
export interface SupplierListItem {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  status: SupplierStatus;
}

/**
 * 将后端 DTO status 映射到前端枚举
 */
const mapStatusToEnum = (status: string): SupplierStatus => {
  const statusMap: Record<string, SupplierStatus> = {
    ACTIVE: SupplierStatus.ACTIVE,
    SUSPENDED: SupplierStatus.SUSPENDED,
    TERMINATED: SupplierStatus.TERMINATED,
    PENDING_APPROVAL: SupplierStatus.PENDING_APPROVAL,
    UNDER_REVIEW: SupplierStatus.UNDER_REVIEW,
  };
  return statusMap[status] || SupplierStatus.ACTIVE;
};

/**
 * 将后端 DTO 映射为前端 SupplierListItem
 */
const mapDTOToListItem = (dto: SupplierDTO): SupplierListItem => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  contactPerson: dto.contactName || '',
  contactPhone: dto.contactPhone || '',
  status: mapStatusToEnum(dto.status),
});

/**
 * 将后端 DTO 映射为完整的 Supplier 类型
 * 注意：后端 DTO 只包含基础字段，其他字段使用默认值
 */
const mapDTOToSupplier = (dto: SupplierDTO): Supplier => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  type: SupplierType.OTHER,
  level: SupplierLevel.STANDARD,
  status: mapStatusToEnum(dto.status),
  address: '',
  phone: dto.contactPhone || '',
  contacts: dto.contactName
    ? [
        {
          id: '1',
          name: dto.contactName,
          phone: dto.contactPhone || '',
          isPrimary: true,
        },
      ]
    : [],
  bankAccounts: [],
  qualifications: [],
  evaluations: [],
  purchaseStats: {
    totalOrders: 0,
    totalAmount: 0,
    onTimeDeliveryRate: 0,
    qualityPassRate: 0,
  },
  productCategories: [],
  createdById: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * 获取供应商列表
 * @param status 可选，筛选状态
 * @returns 供应商列表
 */
export const fetchSuppliers = async (status?: string): Promise<SupplierListItem[]> => {
  const url = status ? `${API_BASE}/suppliers?status=${status}` : `${API_BASE}/suppliers`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`获取供应商列表失败: ${response.status}`);
  }

  const result: ApiResponse<SupplierDTO[]> = await response.json();

  if (!result.success) {
    throw new Error('API 返回错误');
  }

  return result.data.map(mapDTOToListItem);
};

/**
 * 获取供应商列表（完整 Supplier 类型）
 * @param status 可选，筛选状态
 * @returns 供应商列表
 */
export const fetchSuppliersAsFull = async (status?: string): Promise<Supplier[]> => {
  const url = status ? `${API_BASE}/suppliers?status=${status}` : `${API_BASE}/suppliers`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`获取供应商列表失败: ${response.status}`);
  }

  const result: ApiResponse<SupplierDTO[]> = await response.json();

  if (!result.success) {
    throw new Error('API 返回错误');
  }

  return result.data.map(mapDTOToSupplier);
};

/**
 * 获取单个供应商详情
 * @param id 供应商 ID
 * @returns 供应商详情
 */
export const fetchSupplierById = async (id: string): Promise<Supplier> => {
  const response = await fetch(`${API_BASE}/suppliers/${id}`);

  if (!response.ok) {
    throw new Error(`获取供应商详情失败: ${response.status}`);
  }

  const result: ApiResponse<SupplierDTO> = await response.json();

  if (!result.success) {
    throw new Error('API 返回错误');
  }

  return mapDTOToSupplier(result.data);
};

/**
 * 创建供应商请求体
 */
export interface CreateSupplierRequest {
  code: string;
  name: string;
  contactName?: string;
  contactPhone?: string;
  status: string;
}

/**
 * 更新供应商请求体
 */
export interface UpdateSupplierRequest {
  name: string;
  contactName?: string;
  contactPhone?: string;
  status: string;
}

/**
 * API 错误响应
 */
interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

/**
 * 创建供应商
 * @param data 创建请求
 * @returns 创建的供应商
 * @throws Error 当创建失败时（如编码重复返回 409）
 */
export const createSupplier = async (data: CreateSupplierRequest): Promise<SupplierListItem> => {
  const response = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResult = result as ApiErrorResponse;
    if (response.status === 409) {
      throw new Error('供应商编码已存在');
    }
    throw new Error(errorResult.message || `创建供应商失败: ${response.status}`);
  }

  const successResult = result as ApiResponse<SupplierDTO>;
  if (!successResult.success) {
    throw new Error('API 返回错误');
  }

  return mapDTOToListItem(successResult.data);
};

/**
 * 更新供应商
 * @param id 供应商 ID
 * @param data 更新请求
 * @returns 更新后的供应商
 * @throws Error 当更新失败时
 */
export const updateSupplier = async (id: string, data: UpdateSupplierRequest): Promise<SupplierListItem> => {
  const response = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResult = result as ApiErrorResponse;
    if (response.status === 404) {
      throw new Error('供应商不存在');
    }
    throw new Error(errorResult.message || `更新供应商失败: ${response.status}`);
  }

  const successResult = result as ApiResponse<SupplierDTO>;
  if (!successResult.success) {
    throw new Error('API 返回错误');
  }

  return mapDTOToListItem(successResult.data);
};
