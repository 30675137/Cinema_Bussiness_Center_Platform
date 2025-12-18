/**
 * 活动类型管理 - API 服务
 */

import type { ActivityType, ActivityTypeListResponse, ActivityTypeQueryParams, CreateActivityTypePayload, UpdateActivityTypePayload } from '../types/activity-type.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 获取活动类型列表（运营后台）
 */
export async function getActivityTypes(params?: ActivityTypeQueryParams): Promise<ActivityType[]> {
  const url = new URL(`${API_BASE_URL}/api/activity-types`);

  if (params?.status) {
    url.searchParams.append('status', params.status);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 包含认证信息
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activity types: ${response.statusText}`);
  }

  const result: ActivityTypeListResponse = await response.json();

  // Handle both formats: { data, total } or { success, data, total, message, code }
  if (result.success === false) {
    throw new Error(result.message || 'Failed to fetch activity types');
  }

  // Return data array (compatible with both formats)
  return result.data || [];
}

/**
 * 获取启用状态的活动类型列表（小程序端）
 */
export async function getEnabledActivityTypes(): Promise<ActivityType[]> {
  const url = `${API_BASE_URL}/api/activity-types/enabled`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch enabled activity types: ${response.statusText}`);
  }

  const result: ActivityTypeListResponse = await response.json();

  if (result.success === false) {
    throw new Error(result.message || 'Failed to fetch enabled activity types');
  }

  return result.data || [];
}

/**
 * 根据ID获取单个活动类型
 */
export async function getActivityType(id: string): Promise<ActivityType> {
  const url = `${API_BASE_URL}/api/activity-types/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`活动类型不存在: ${id}`);
    }
    throw new Error(`Failed to fetch activity type: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * 创建活动类型
 */
export async function createActivityType(payload: CreateActivityTypePayload): Promise<ActivityType> {
  const url = `${API_BASE_URL}/api/activity-types`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Validation failed');
    }
    if (response.status === 409) {
      const error = await response.json().catch(() => ({}));
      // 后端返回格式: { error: "CONFLICT", message: "活动类型名称已存在: xxx" }
      const errorMessage = error.message || error.error || '活动类型名称已存在';
      throw new Error(errorMessage);
    }
    throw new Error(`Failed to create activity type: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * 更新活动类型
 */
export async function updateActivityType(id: string, payload: UpdateActivityTypePayload): Promise<ActivityType> {
  const url = `${API_BASE_URL}/api/activity-types/${id}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Validation failed');
    }
    if (response.status === 404) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `活动类型不存在: ${id}`);
    }
    if (response.status === 409) {
      const error = await response.json();
      throw new Error(error.message || '活动类型名称已存在');
    }
    throw new Error(`Failed to update activity type: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * 删除活动类型（软删除）
 */
export async function deleteActivityType(id: string): Promise<ActivityType> {
  const url = `${API_BASE_URL}/api/activity-types/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `活动类型不存在: ${id}`);
    }
    throw new Error(`Failed to delete activity type: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * 切换活动类型状态（启用/停用）
 */
export async function toggleActivityTypeStatus(id: string, status: 'ENABLED' | 'DISABLED'): Promise<ActivityType> {
  const url = `${API_BASE_URL}/api/activity-types/${id}/status`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Validation failed');
    }
    if (response.status === 404) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `活动类型不存在: ${id}`);
    }
    throw new Error(`Failed to toggle activity type status: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

