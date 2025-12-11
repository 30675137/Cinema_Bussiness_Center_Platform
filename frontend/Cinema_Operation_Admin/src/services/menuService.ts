/**
 * 菜单数据服务
 * 提供菜单数据的CRUD操作和业务逻辑处理
 */

import {
  MenuItem,
  FunctionalArea,
  MenuLevel,
  MenuFilterResult
} from '@/types/navigation';
import apiClient from './apiClient';
import { mockApi } from './mockApi';

/**
 * 菜单查询参数接口
 */
export interface MenuQueryParams {
  /** 菜单层级过滤 */
  level?: MenuLevel;
  /** 功能区域过滤 */
  functionalArea?: FunctionalArea;
  /** 是否只返回启用的菜单 */
  isActive?: boolean;
  /** 是否只返回可见的菜单 */
  isVisible?: boolean;
  /** 父菜单ID过滤 */
  parentId?: string;
  /** 排序字段 */
  sortBy?: 'sortOrder' | 'name' | 'code';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 菜单创建参数接口
 */
export interface CreateMenuParams {
  /** 菜单名称 */
  name: string;
  /** 菜单代码 */
  code: string;
  /** 菜单图标 */
  icon?: string;
  /** 菜单路径 */
  path?: string;
  /** 菜单层级 */
  level: MenuLevel;
  /** 父菜单ID */
  parentId?: string;
  /** 排序序号 */
  sortOrder: number;
  /** 功能区域 */
  functionalArea: FunctionalArea;
  /** 菜单描述 */
  description?: string;
}

/**
 * 菜单更新参数接口
 */
export interface UpdateMenuParams extends Partial<CreateMenuParams> {
  /** 是否启用 */
  isActive?: boolean;
  /** 是否可见 */
  isVisible?: boolean;
}

/**
 * 菜单统计信息接口
 */
export interface MenuStats {
  /** 总菜单数量 */
  totalMenus: number;
  /** 启用的菜单数量 */
  activeMenus: number;
  /** 一级菜单数量 */
  mainMenus: number;
  /** 二级菜单数量 */
  subMenus: number;
  /** 按功能区域分组的菜单数量 */
  menusByArea: Record<FunctionalArea, number>;
}

/**
 * 菜单服务类
 */
class MenuService {
  /**
   * 获取完整的菜单结构
   */
  async getCompleteMenus(): Promise<MenuItem[]> {
    try {
      // 在开发环境中使用mock数据，生产环境中使用真实API
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.getCompleteMenus();
      }

      const response = await apiClient.get('/navigation/menus', {
        params: {
          level: undefined,
          functionalArea: undefined,
          isActive: true,
          isVisible: true
        }
      });

      return response.data.menus || [];
    } catch (error) {
      console.error('获取菜单数据失败:', error);
      // 降级到mock数据
      return await mockApi.getCompleteMenus();
    }
  }

  /**
   * 根据查询参数获取菜单列表
   */
  async getMenus(params?: MenuQueryParams): Promise<MenuItem[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.getMenus(params);
      }

      const response = await apiClient.get('/navigation/menus', { params });
      return response.data.menus || [];
    } catch (error) {
      console.error('查询菜单失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取单个菜单
   */
  async getMenuById(id: string): Promise<MenuItem | null> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.getMenuById(id);
      }

      const response = await apiClient.get(`/navigation/menus/${id}`);
      return response.data.menu || null;
    } catch (error) {
      console.error(`获取菜单 ${id} 失败:`, error);
      return null;
    }
  }

  /**
   * 创建新菜单
   */
  async createMenu(params: CreateMenuParams): Promise<MenuItem> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.createMenu(params);
      }

      const response = await apiClient.post('/navigation/menus', params);
      return response.data.menu;
    } catch (error) {
      console.error('创建菜单失败:', error);
      throw error;
    }
  }

  /**
   * 更新菜单
   */
  async updateMenu(id: string, params: UpdateMenuParams): Promise<MenuItem> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.updateMenu(id, params);
      }

      const response = await apiClient.put(`/navigation/menus/${id}`, params);
      return response.data.menu;
    } catch (error) {
      console.error(`更新菜单 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 删除菜单
   */
  async deleteMenu(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.deleteMenu(id);
      }

      await apiClient.delete(`/navigation/menus/${id}`);
    } catch (error) {
      console.error(`删除菜单 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量更新菜单排序
   */
  async updateMenuSortOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.updateMenuSortOrder(updates);
      }

      await apiClient.put('/navigation/menus/sort', { updates });
    } catch (error) {
      console.error('批量更新菜单排序失败:', error);
      throw error;
    }
  }

  /**
   * 获取菜单统计信息
   */
  async getMenuStats(): Promise<MenuStats> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.getMenuStats();
      }

      const response = await apiClient.get('/navigation/menus/stats');
      return response.data;
    } catch (error) {
      console.error('获取菜单统计失败:', error);

      // 降级计算基本统计
      const menus = await this.getCompleteMenus();
      return this.calculateStats(menus);
    }
  }

  /**
   * 根据功能区域获取菜单
   */
  async getMenusByFunctionalArea(area: FunctionalArea): Promise<MenuItem[]> {
    return this.getMenus({ functionalArea: area, isActive: true, isVisible: true });
  }

  /**
   * 获取子菜单
   */
  async getSubMenus(parentId: string): Promise<MenuItem[]> {
    return this.getMenus({
      parentId,
      level: MenuLevel.SUB,
      isActive: true,
      isVisible: true
    });
  }

  /**
   * 搜索菜单
   */
  async searchMenus(query: string, limit: number = 20): Promise<MenuItem[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.searchMenus(query, limit);
      }

      const response = await apiClient.get('/navigation/menus/search', {
        params: { query, limit }
      });

      return response.data.menus || [];
    } catch (error) {
      console.error('搜索菜单失败:', error);
      return [];
    }
  }

  /**
   * 验证菜单代码唯一性
   */
  async validateMenuCode(code: string, excludeId?: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.validateMenuCode(code, excludeId);
      }

      const response = await apiClient.get('/navigation/menus/validate-code', {
        params: { code, excludeId }
      });

      return response.data.isValid;
    } catch (error) {
      console.error('验证菜单代码失败:', error);
      return false;
    }
  }

  /**
   * 导入菜单数据
   */
  async importMenus(menus: CreateMenuParams[]): Promise<{ success: number; failed: number }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await mockApi.importMenus(menus);
      }

      const response = await apiClient.post('/navigation/menus/import', { menus });
      return response.data;
    } catch (error) {
      console.error('导入菜单失败:', error);
      throw error;
    }
  }

  /**
   * 导出菜单数据
   */
  async exportMenus(params?: MenuQueryParams): Promise<MenuItem[]> {
    return this.getMenus(params);
  }

  /**
   * 计算菜单统计信息（内部方法）
   */
  private calculateStats(menus: MenuItem[]): MenuStats {
    const stats: MenuStats = {
      totalMenus: menus.length,
      activeMenus: menus.filter(menu => menu.isActive).length,
      mainMenus: menus.filter(menu => menu.level === MenuLevel.MAIN).length,
      subMenus: menus.filter(menu => menu.level === MenuLevel.SUB).length,
      menusByArea: {} as Record<FunctionalArea, number>
    };

    // 按功能区域分组统计
    menus.forEach(menu => {
      const area = menu.functionalArea;
      stats.menusByArea[area] = (stats.menusByArea[area] || 0) + 1;
    });

    return stats;
  }
}

// 创建单例实例
export const menuService = new MenuService();

// 导出类型
export type {
  MenuQueryParams,
  CreateMenuParams,
  UpdateMenuParams,
  MenuStats
};