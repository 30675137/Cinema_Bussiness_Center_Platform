/**
 * @spec D001-menu-panel
 * 模块卡片数据类型定义
 */
import { ComponentType } from 'react';

/**
 * 模块卡片接口
 * 代表一个业务模块的导航卡片
 */
export interface ModuleCard {
  /** 模块唯一标识 */
  id: string;
  /** 模块名称 */
  name: string;
  /** 模块描述 */
  description: string;
  /** Ant Design Icon 组件 */
  icon: ComponentType<{ style?: React.CSSProperties }>;
  /** 默认跳转路径 */
  defaultPath: string;
  /** 功能链接列表 */
  functionLinks: FunctionLink[];
  /** 排序顺序 (1-12) */
  order: number;
  /** 模块状态 */
  status: 'normal' | 'developing';
  /** 所属泳道 */
  swimlane?: 'foundation' | 'master-data' | 'transaction' | 'channel-marketing' | 'support';
  /** 所需权限 (可选，预留字段) */
  requiredPermissions?: string[];
  /** 角标 (可选，用于显示待办事项) */
  badge?: number | string;
}

/**
 * 功能链接接口
 * 模块卡片中的具体功能入口
 */
export interface FunctionLink {
  /** 功能名称 */
  name: string;
  /** 跳转路径 */
  path: string;
  /** 是否启用 (默认 true) */
  enabled?: boolean;
  /** 角标 (可选) */
  badge?: number | string;
}

/**
 * 用户权限接口
 * 用于过滤模块显示 (预留，当前阶段未实现)
 */
export interface UserPermissions {
  /** 权限代码列表 */
  permissions: string[];
  /** 是否为管理员 */
  isAdmin: boolean;
}
