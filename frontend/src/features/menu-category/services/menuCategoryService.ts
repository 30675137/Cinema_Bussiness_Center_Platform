/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 API 服务
 */

import type {
  MenuCategoryDTO,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  BatchUpdateSortOrderRequest,
  DeleteCategoryResponse,
  MenuCategoryListResponse,
  MenuCategoryResponse,
  GetMenuCategoriesParams,
} from '../types';

const API_BASE = '/api/admin/menu-categories';

/**
 * 获取分类列表
 */
export async function getMenuCategories(
  params: GetMenuCategoriesParams = {}
): Promise<MenuCategoryDTO[]> {
  const searchParams = new URLSearchParams();

  if (params.includeHidden !== undefined) {
    searchParams.set('includeHidden', String(params.includeHidden));
  }
  if (params.includeProductCount !== undefined) {
    searchParams.set('includeProductCount', String(params.includeProductCount));
  }

  const url = searchParams.toString()
    ? `${API_BASE}?${searchParams.toString()}`
    : API_BASE;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取分类列表失败');
  }

  const result: MenuCategoryListResponse = await response.json();
  if (!result.success) {
    throw new Error(result.message || '获取分类列表失败');
  }

  return result.data;
}

/**
 * 获取单个分类
 */
export async function getMenuCategoryById(id: string): Promise<MenuCategoryDTO> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    throw new Error('获取分类详情失败');
  }

  const result: MenuCategoryResponse = await response.json();
  if (!result.success) {
    throw new Error(result.message || '获取分类详情失败');
  }

  return result.data;
}

/**
 * 创建分类
 */
export async function createMenuCategory(
  request: CreateMenuCategoryRequest
): Promise<MenuCategoryDTO> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '创建分类失败');
  }

  const result: MenuCategoryResponse = await response.json();
  if (!result.success) {
    throw new Error(result.message || '创建分类失败');
  }

  return result.data;
}

/**
 * 更新分类
 */
export async function updateMenuCategory(
  id: string,
  request: UpdateMenuCategoryRequest
): Promise<MenuCategoryDTO> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '更新分类失败');
  }

  const result: MenuCategoryResponse = await response.json();
  if (!result.success) {
    throw new Error(result.message || '更新分类失败');
  }

  return result.data;
}

/**
 * 删除分类
 */
export async function deleteMenuCategory(
  id: string,
  confirm: boolean = false
): Promise<DeleteCategoryResponse> {
  const response = await fetch(`${API_BASE}/${id}?confirm=${confirm}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '删除分类失败');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || '删除分类失败');
  }

  return result.data;
}

/**
 * 批量更新排序
 */
export async function batchUpdateSortOrder(
  request: BatchUpdateSortOrderRequest
): Promise<void> {
  const response = await fetch(`${API_BASE}/batch-sort`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '更新排序失败');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || '更新排序失败');
  }
}

/**
 * 切换可见性
 */
export async function toggleCategoryVisibility(
  id: string,
  isVisible: boolean
): Promise<MenuCategoryDTO> {
  const response = await fetch(`${API_BASE}/${id}/visibility?isVisible=${isVisible}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '切换可见性失败');
  }

  const result: MenuCategoryResponse = await response.json();
  if (!result.success) {
    throw new Error(result.message || '切换可见性失败');
  }

  return result.data;
}
