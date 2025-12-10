/**
 * 面包屑工具函数
 */

import type { BreadcrumbItem } from '@/types/layout';
import { findMenuItemByPath, getParentMenuPath } from '@/mock/menu';

/**
 * 根据当前路径生成面包屑
 */
export const generateBreadcrumbs = (currentPath: string): BreadcrumbItem[] => {
  const currentMenuItem = findMenuItemByPath(currentPath);

  if (!currentMenuItem || currentPath === '/') {
    return [];
  }

  const parentPaths = getParentMenuPath(currentPath);
  const breadcrumbs: BreadcrumbItem[] = [];

  // 添加父级路径面包屑
  parentPaths.forEach((path, index) => {
    const parentItem = findMenuItemByPath(path);
    if (parentItem) {
      breadcrumbs.push({
        title: parentItem.title,
        path,
        current: false,
      });
    }
  });

  // 添加当前页面面包屑
  breadcrumbs.push({
    title: currentMenuItem.title,
    path: currentPath,
    current: true,
  });

  return breadcrumbs;
};

/**
 * 处理面包屑路径过长的情况
 */
export const truncateBreadcrumb = (breadcrumbs: BreadcrumbItem[], maxLength: number = 5): BreadcrumbItem[] => {
  if (breadcrumbs.length <= maxLength) {
    return breadcrumbs;
  }

  // 保留前两项和后两项，中间用省略号表示
  const result = [
    breadcrumbs[0],
    {
      title: '...',
      path: '',
      current: false,
    },
    ...breadcrumbs.slice(-2),
  ];

  return result;
};

/**
 * 获取面包屑的显示文本
 */
export const getBreadcrumbDisplayText = (breadcrumb: BreadcrumbItem): string => {
  if (breadcrumb.title === '...' || !breadcrumb.title) {
    return '...';
  }

  if (typeof breadcrumb.title === 'string') {
    return breadcrumb.title;
  }

  // 如果是React节点，尝试提取文本内容
  const element = breadcrumb.title as React.ReactElement;
  if (element && element.props && element.props.children) {
    return String(element.props.children);
  }

  return '未知';
};