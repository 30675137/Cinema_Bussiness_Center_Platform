/**
 * @spec O003-beverage-order
 * B端饮品配置管理API服务 (User Story 3)
 */

import type {
  BeverageDTO,
  BeverageDetailDTO,
  BeverageSpecDTO,
  BeverageRecipeDTO,
  CreateBeverageRequest,
  UpdateBeverageRequest,
  CreateSpecRequest,
  UpdateSpecRequest,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  BeverageQueryParams,
  PageResponse,
  BeverageStatus,
} from '../types/beverage';

const API_BASE_URL = '/api/admin/beverages';

/**
 * API响应包装类型
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
  message?: string;
}

/**
 * 获取饮品列表（分页/搜索/筛选）
 * FR-028
 */
export async function getBeverageList(
  params: BeverageQueryParams = {}
): Promise<PageResponse<BeverageDTO>> {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.name) queryParams.append('name', params.name);
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
  const json: ApiResponse<PageResponse<BeverageDTO>> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '获取饮品列表失败');
  }

  return json.data;
}

/**
 * 获取饮品详情
 */
export async function getBeverageDetail(id: string): Promise<BeverageDetailDTO> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  const json: ApiResponse<BeverageDetailDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '获取饮品详情失败');
  }

  return json.data;
}

/**
 * 创建饮品
 * FR-029
 */
export async function createBeverage(request: CreateBeverageRequest): Promise<BeverageDTO> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json: ApiResponse<BeverageDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '创建饮品失败');
  }

  return json.data;
}

/**
 * 更新饮品
 * FR-030
 */
export async function updateBeverage(
  id: string,
  request: UpdateBeverageRequest
): Promise<BeverageDTO> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json: ApiResponse<BeverageDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '更新饮品失败');
  }

  return json.data;
}

/**
 * 删除饮品（软删除）
 * FR-031
 */
export async function deleteBeverage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  const json: ApiResponse<void> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '删除饮品失败');
  }
}

/**
 * 切换饮品状态
 * FR-034
 */
export async function updateBeverageStatus(
  id: string,
  status: BeverageStatus
): Promise<BeverageDTO> {
  const response = await fetch(`${API_BASE_URL}/${id}/status?status=${status}`, {
    method: 'PATCH',
  });

  const json: ApiResponse<BeverageDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '切换状态失败');
  }

  return json.data;
}

/**
 * 上传饮品图片
 * FR-029
 */
export async function uploadBeverageImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-image`, {
    method: 'POST',
    body: formData,
  });

  const json: ApiResponse<string> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '上传图片失败');
  }

  return json.data;
}

// ==================== 规格管理 API ====================

/**
 * 获取饮品规格列表
 * FR-032
 */
export async function getBeverageSpecs(beverageId: string): Promise<BeverageSpecDTO[]> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/specs`);
  const json: ApiResponse<BeverageSpecDTO[]> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '获取规格列表失败');
  }

  return json.data;
}

/**
 * 添加饮品规格
 * FR-032
 */
export async function addBeverageSpec(
  beverageId: string,
  request: CreateSpecRequest
): Promise<BeverageSpecDTO> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/specs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json: ApiResponse<BeverageSpecDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '添加规格失败');
  }

  return json.data;
}

/**
 * 更新饮品规格
 * FR-033
 */
export async function updateBeverageSpec(
  beverageId: string,
  specId: string,
  request: UpdateSpecRequest
): Promise<BeverageSpecDTO> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/specs/${specId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json: ApiResponse<BeverageSpecDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '更新规格失败');
  }

  return json.data;
}

/**
 * 删除饮品规格
 * FR-033
 */
export async function deleteBeverageSpec(beverageId: string, specId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/specs/${specId}`, {
    method: 'DELETE',
  });

  const json: ApiResponse<void> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '删除规格失败');
  }
}

// ==================== 配方(BOM)管理 API ====================

/**
 * 获取饮品配方列表
 * FR-035
 */
export async function getBeverageRecipes(beverageId: string): Promise<BeverageRecipeDTO[]> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/recipes`);
  const json: ApiResponse<BeverageRecipeDTO[]> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '获取配方列表失败');
  }

  return json.data;
}

/**
 * 添加饮品配方
 * FR-035 & FR-037
 */
export async function addBeverageRecipe(
  beverageId: string,
  request: CreateRecipeRequest
): Promise<BeverageRecipeDTO> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json: ApiResponse<BeverageRecipeDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '添加配方失败');
  }

  return json.data;
}

/**
 * 更新饮品配方
 * FR-036 & FR-037
 */
export async function updateBeverageRecipe(
  beverageId: string,
  recipeId: string,
  request: UpdateRecipeRequest
): Promise<BeverageRecipeDTO> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/recipes/${recipeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json: ApiResponse<BeverageRecipeDTO> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '更新配方失败');
  }

  return json.data;
}

/**
 * 删除饮品配方
 * FR-036
 */
export async function deleteBeverageRecipe(beverageId: string, recipeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${beverageId}/recipes/${recipeId}`, {
    method: 'DELETE',
  });

  const json: ApiResponse<void> = await response.json();

  if (!json.success) {
    throw new Error(json.message || '删除配方失败');
  }
}
