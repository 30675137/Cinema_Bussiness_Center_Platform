/**
 * 菜单Mock数据
 */

import type { MenuItem } from '@/types/layout';

/** 菜单配置数据 */
export const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    title: '仪表盘',
    icon: 'DashboardOutlined',
    path: '/dashboard',
    visible: true,
    order: 1,
    group: 'main',
  },
  {
    id: 'product',
    title: '商品管理',
    icon: 'ShopOutlined',
    path: '/product',
    visible: true,
    order: 2,
    group: 'main',
    children: [
      {
        id: 'product-list',
        title: '商品列表',
        icon: 'UnorderedListOutlined',
        path: '/product/list',
        visible: true,
        order: 1,
        permissions: ['product:read'],
      },
      {
        id: 'product-create',
        title: '商品创建',
        icon: 'PlusOutlined',
        path: '/product/create',
        visible: true,
        order: 2,
        permissions: ['product:create'],
      },
    ],
    permissions: ['product:read'],
  },
  {
    id: 'pricing',
    title: '定价中心',
    icon: 'DollarOutlined',
    path: '/pricing',
    visible: true,
    order: 3,
    group: 'main',
    children: [
      {
        id: 'pricing-list',
        title: '价格管理',
        icon: 'TableOutlined',
        path: '/pricing/list',
        visible: true,
        order: 1,
        permissions: ['pricing:read'],
      },
      {
        id: 'pricing-strategy',
        title: '定价策略',
        icon: 'SettingOutlined',
        path: '/pricing/strategy',
        visible: true,
        order: 2,
        permissions: ['pricing:manage'],
      },
    ],
    permissions: ['pricing:read'],
  },
  {
    id: 'review',
    title: '审核管理',
    icon: 'AuditOutlined',
    path: '/review',
    visible: true,
    order: 4,
    group: 'main',
    children: [
      {
        id: 'review-pending',
        title: '待审核',
        icon: 'ClockCircleOutlined',
        path: '/review/pending',
        visible: true,
        order: 1,
        permissions: ['review:read'],
      },
      {
        id: 'review-history',
        title: '审核历史',
        icon: 'HistoryOutlined',
        path: '/review/history',
        visible: true,
        order: 2,
        permissions: ['review:read'],
      },
    ],
    permissions: ['review:read'],
  },
  {
    id: 'inventory',
    title: '库存追溯',
    icon: 'EyeOutlined',
    path: '/inventory',
    visible: true,
    order: 5,
    group: 'main',
    children: [
      {
        id: 'inventory-current',
        title: '当前库存',
        icon: 'DatabaseOutlined',
        path: '/inventory/current',
        visible: true,
        order: 1,
        permissions: ['inventory:read'],
      },
      {
        id: 'inventory-history',
        title: '库存变动',
        icon: 'LineChartOutlined',
        path: '/inventory/history',
        visible: true,
        order: 2,
        permissions: ['inventory:read'],
      },
    ],
    permissions: ['inventory:read'],
  },
];

/** 根据路径查找菜单项 */
export const findMenuItemByPath = (path: string, menuItems: MenuItem[] = menuConfig): MenuItem | null => {
  for (const item of menuItems) {
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemByPath(path, item.children);
      if (found) return found;
    }
  }
  return null;
};

/** 获取父级菜单路径 */
export const getParentMenuPath = (path: string, menuItems: MenuItem[] = menuConfig): string[] => {
  const paths: string[] = [];

  const findParent = (targetPath: string, items: MenuItem[], parentPath: string[] = []): boolean => {
    for (const item of items) {
      const currentPath = [...parentPath, item.path];

      if (item.path === targetPath) {
        paths.push(...parentPath);
        return true;
      }

      if (item.children) {
        if (findParent(targetPath, item.children, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  findParent(path, menuItems);
  return paths;
};