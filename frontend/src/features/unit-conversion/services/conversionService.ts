/**
 * 单位换算 API 服务层
 * P002-unit-conversion
 */

import type {
  UnitConversion,
  CreateConversionRequest,
  ConversionStats,
  ConversionPath,
  CycleValidationResult,
  ValidateCycleRequest,
  CalculatePathRequest,
  ApiResponse,
  ListResponse,
  DbUnitCategory,
} from '../types';

const API_BASE = '/api/unit-conversions';

/**
 * 处理 API 响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  // 如果响应有 data 字段，返回 data；否则返回整个结果
  return result.data !== undefined ? result.data : result;
}

/**
 * 获取所有换算规则
 */
export async function getConversions(params?: {
  category?: DbUnitCategory;
  search?: string;
}): Promise<UnitConversion[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) {
    searchParams.set('category', params.category);
  }
  if (params?.search) {
    searchParams.set('search', params.search);
  }
  const queryString = searchParams.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url);
  return handleResponse<UnitConversion[]>(response);
}

/**
 * 获取单个换算规则
 */
export async function getConversionById(id: string): Promise<UnitConversion> {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse<UnitConversion>(response);
}

/**
 * 创建换算规则
 */
export async function createConversion(data: CreateConversionRequest): Promise<UnitConversion> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UnitConversion>(response);
}

/**
 * 更新换算规则
 */
export async function updateConversion(id: string, data: CreateConversionRequest): Promise<UnitConversion> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UnitConversion>(response);
}

/**
 * 删除换算规则
 */
export async function deleteConversion(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '删除失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
}

/**
 * 获取统计信息
 */
export async function getConversionStats(): Promise<ConversionStats> {
  const response = await fetch(`${API_BASE}/stats`);
  return handleResponse<ConversionStats>(response);
}

/**
 * 验证循环依赖
 */
export async function validateCycle(data: ValidateCycleRequest): Promise<CycleValidationResult> {
  const response = await fetch(`${API_BASE}/validate-cycle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<CycleValidationResult>(response);
}

/**
 * 计算换算路径
 */
export async function calculatePath(data: CalculatePathRequest): Promise<ConversionPath> {
  const response = await fetch(`${API_BASE}/calculate-path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ConversionPath>(response);
}

/**
 * 导出服务对象
 */
export const conversionService = {
  getAll: getConversions,
  getById: getConversionById,
  create: createConversion,
  update: updateConversion,
  delete: deleteConversion,
  getStats: getConversionStats,
  validateCycle,
  calculatePath,
};

export default conversionService;
