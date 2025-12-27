/**
 * Schedule Service
 *
 * Provides schedule-related API services using Mock data
 * Follows the pattern from brandService.ts and categoryService.ts
 */

import type {
  ScheduleEvent,
  Hall,
  ScheduleQueryParams,
  HallQueryParams,
  CreateScheduleEventRequest,
  UpdateScheduleEventRequest,
  ConflictCheckRequest,
  ConflictCheckResponse,
} from '../types/schedule.types';
import type { ApiResponse, PaginatedResponse } from '@/services/brandService';

/**
 * Store 类型定义（门店）
 */
export interface Store {
  id: string;
  code: string;
  name: string;
  region?: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

/**
 * 门店查询参数
 */
export interface StoreQueryParams {
  status?: 'ACTIVE' | 'DISABLED';
}

/**
 * Schedule Service Class
 */
class ScheduleService {
  private baseUrl = '/api/schedules';
  private hallsUrl = '/api/halls';
  private storesUrl = '/api/stores';

  /**
   * 获取排期事件列表
   * @param params 查询参数
   * @returns 排期事件列表
   */
  async getScheduleList(params: ScheduleQueryParams): Promise<ApiResponse<ScheduleEvent[]>> {
    try {
      const queryParams = new URLSearchParams({
        date: params.date,
      });

      if (params.hallId) {
        queryParams.append('hallId', params.hallId);
      }
      if (params.type) {
        queryParams.append('type', params.type);
      }
      if (params.status) {
        queryParams.append('status', params.status);
      }

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取排期列表失败');
      }

      return data;
    } catch (error) {
      console.error('Get schedule list error:', error);
      throw error;
    }
  }

  /**
   * 获取排期事件详情
   * @param id 排期事件ID
   * @returns 排期事件详情
   */
  async getScheduleDetail(id: string): Promise<ApiResponse<ScheduleEvent>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取排期详情失败');
      }

      return data;
    } catch (error) {
      console.error('Get schedule detail error:', error);
      throw error;
    }
  }

  /**
   * 创建排期事件
   * @param request 创建请求
   * @returns 创建的排期事件
   */
  async createSchedule(request: CreateScheduleEventRequest): Promise<ApiResponse<ScheduleEvent>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '创建排期失败');
      }

      return data;
    } catch (error) {
      console.error('Create schedule error:', error);
      throw error;
    }
  }

  /**
   * 更新排期事件
   * @param request 更新请求
   * @returns 更新后的排期事件
   */
  async updateSchedule(request: UpdateScheduleEventRequest): Promise<ApiResponse<ScheduleEvent>> {
    try {
      const { id, ...updateData } = request;
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '更新排期失败');
      }

      return data;
    } catch (error) {
      console.error('Update schedule error:', error);
      throw error;
    }
  }

  /**
   * 删除排期事件
   * @param id 排期事件ID
   * @returns 删除结果
   */
  async deleteSchedule(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '删除排期失败');
      }

      return {
        success: true,
        data: undefined,
        message: '删除成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Delete schedule error:', error);
      throw error;
    }
  }

  /**
   * 检查时间冲突
   * @param request 冲突检查请求
   * @returns 冲突检查结果
   */
  async checkConflict(request: ConflictCheckRequest): Promise<ApiResponse<ConflictCheckResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/conflict-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '冲突检查失败');
      }

      return data;
    } catch (error) {
      console.error('Check conflict error:', error);
      throw error;
    }
  }

  /**
   * 获取影厅列表（旧接口，保留兼容性）
   * @param params 查询参数
   * @returns 影厅列表
   */
  async getHallList(params: HallQueryParams = {}): Promise<ApiResponse<Hall[]>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) {
        queryParams.append('status', params.status);
      }
      if (params.type) {
        queryParams.append('type', params.type);
      }

      const url = queryParams.toString()
        ? `${this.hallsUrl}?${queryParams.toString()}`
        : this.hallsUrl;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取影厅列表失败');
      }

      return data;
    } catch (error) {
      console.error('Get hall list error:', error);
      throw error;
    }
  }

  /**
   * 获取影厅详情
   * @param id 影厅ID
   * @returns 影厅详情
   */
  async getHallDetail(id: string): Promise<ApiResponse<Hall>> {
    try {
      const response = await fetch(`${this.hallsUrl}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取影厅详情失败');
      }

      return data;
    } catch (error) {
      console.error('Get hall detail error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 新增：门店与影厅关系 API（对接后端 /api/stores 和 /api/stores/{storeId}/halls）
  // ============================================================================

  /**
   * 获取门店列表
   * @param params 查询参数（可选状态过滤）
   * @returns 门店列表
   */
  async getStoreList(params: StoreQueryParams = {}): Promise<ApiResponse<Store[]>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) {
        queryParams.append('status', params.status);
      }

      const url = queryParams.toString()
        ? `${this.storesUrl}?${queryParams.toString()}`
        : this.storesUrl;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取门店列表失败');
      }

      // 后端返回 { data: [...], total: n }，转换为标准 ApiResponse 格式
      return {
        success: true,
        data: result.data || [],
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Get store list error:', error);
      throw error;
    }
  }

  /**
   * 获取门店详情
   * @param storeId 门店ID
   * @returns 门店详情
   */
  async getStoreDetail(storeId: string): Promise<ApiResponse<Store>> {
    try {
      const response = await fetch(`${this.storesUrl}/${storeId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取门店详情失败');
      }

      return {
        success: true,
        data: result.data,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Get store detail error:', error);
      throw error;
    }
  }

  /**
   * 按门店查询影厅列表（新 API，对接后端 /api/stores/{storeId}/halls）
   * @param storeId 门店ID
   * @param params 查询参数（可选状态、类型过滤）
   * @returns 该门店下的影厅列表
   */
  async getHallsByStore(storeId: string, params: HallQueryParams = {}): Promise<ApiResponse<Hall[]>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) {
        queryParams.append('status', params.status.toUpperCase());
      }
      if (params.type) {
        queryParams.append('type', params.type);
      }

      const url = queryParams.toString()
        ? `${this.storesUrl}/${storeId}/halls?${queryParams.toString()}`
        : `${this.storesUrl}/${storeId}/halls`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取影厅列表失败');
      }

      // 后端返回 { data: [...], total: n }，转换为标准 ApiResponse 格式
      return {
        success: true,
        data: result.data || [],
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Get halls by store error:', error);
      throw error;
    }
  }

  /**
   * 获取所有影厅列表（新 API，对接后端 /api/halls）
   * @param params 查询参数（可选状态、类型过滤）
   * @returns 所有影厅列表
   */
  async getAllHalls(params: HallQueryParams = {}): Promise<ApiResponse<Hall[]>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) {
        queryParams.append('status', params.status.toUpperCase());
      }
      if (params.type) {
        queryParams.append('type', params.type);
      }

      const url = queryParams.toString()
        ? `${this.hallsUrl}?${queryParams.toString()}`
        : this.hallsUrl;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取影厅列表失败');
      }

      // 后端返回 { data: [...], total: n }，转换为标准 ApiResponse 格式
      return {
        success: true,
        data: result.data || [],
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Get all halls error:', error);
      throw error;
    }
  }
}

// Export service instance
export const scheduleService = new ScheduleService();

