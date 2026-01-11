/**
 * @spec N002-unify-supplier-data
 * 供应商 API 服务 - 统一供应商数据源
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
