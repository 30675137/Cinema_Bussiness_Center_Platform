/**
 * 布局状态管理自定义Hook
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayoutStore } from '@/stores/layoutStore';
import { generateBreadcrumbs } from '@/utils/breadcrumb';
import { findMenuItemByPath, getParentMenuPath } from '@/mock/menu';
import type { BreadcrumbItem } from '@/types/layout';

/**
 * 布局状态管理Hook
 */
export const useLayoutState = () => {
  const location = useLocation();
  const {
    selectedMenuKeys,
    openMenuKeys,
    breadcrumbs,
    setSelectedMenuKeys,
    setOpenMenuKeys,
    setBreadcrumbs,
  } = useLayoutStore();

  // 根据当前路径更新菜单选择状态和面包屑
  useEffect(() => {
    const currentPath = location.pathname;

    // 更新面包屑
    const breadcrumbs = generateBreadcrumbs(currentPath);
    setBreadcrumbs(breadcrumbs);

    // 如果是首页，不更新菜单状态
    if (currentPath === '/') {
      setSelectedMenuKeys(['dashboard']);
      return;
    }

    // 更新菜单选择状态
    const menuItem = findMenuItemByPath(currentPath);
    if (menuItem) {
      setSelectedMenuKeys([menuItem.id]);

      // 展开父级菜单
      const parentPaths = getParentMenuPath(currentPath);
      if (parentPaths.length > 0) {
        const parentIds = parentPaths.map(path => {
          const parentItem = findMenuItemByPath(path);
          return parentItem?.id;
        }).filter(Boolean);
        setOpenMenuKeys(parentIds as string[]);
      }
    } else if (currentPath === '/') {
      // 首页选中仪表盘
      setSelectedMenuKeys(['dashboard']);
    } else {
      // 如果路径不匹配任何菜单，清空选择
      setSelectedMenuKeys([]);
      setOpenMenuKeys([]);
    }
  }, [location.pathname, setSelectedMenuKeys, setOpenMenuKeys, setBreadcrumbs]);

  return {
    selectedMenuKeys,
    openMenuKeys,
    breadcrumbs,
  };
};