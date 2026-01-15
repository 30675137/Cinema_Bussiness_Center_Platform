/**
 * 菜单分组组件
 * 按功能区域组织菜单项，支持展开/折叠
 */

import React from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { MenuItem as MenuItemType } from '@/types/navigation';
import MenuItem from './MenuItem';

/**
 * 菜单分组组件Props接口
 */
export interface MenuGroupProps {
  /** 分组标题 */
  title: string;
  /** 菜单项列表 */
  menus: MenuItemType[];
  /** 展开的菜单ID列表 */
  expandedMenuIds: string[];
  /** 当前活动菜单ID */
  activeMenuId?: string;
  /** 菜单点击回调 */
  onMenuClick: (menuId: string) => void;
  /** 菜单展开/折叠回调 */
  onMenuToggle: (menuId: string) => void;
  /** 收藏切换回调 */
  onToggleFavorite: (menuId: string) => void;
  /** 检查是否为收藏菜单 */
  isFavorite: (menuId: string) => boolean;
  /** 是否默认展开 */
  defaultExpanded?: boolean;
  /** 是否显示分组图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 菜单分组组件
 */
const MenuGroup: React.FC<MenuGroupProps> = ({
  title,
  menus,
  expandedMenuIds,
  activeMenuId,
  onMenuClick,
  onMenuToggle,
  onToggleFavorite,
  isFavorite,
  defaultExpanded = true,
  showIcon = true,
  className,
}) => {
  // 检查分组是否展开
  const isGroupExpanded =
    defaultExpanded || menus.some((menu) => expandedMenuIds.includes(menu.id));

  // 过滤可见的菜单
  const visibleMenus = menus.filter((menu) => menu.isVisible && menu.isActive);

  // 如果没有可见菜单，不渲染分组
  if (visibleMenus.length === 0) {
    return null;
  }

  // 处理分组标题点击（展开/折叠所有子菜单）
  const handleGroupTitleClick = () => {
    // 展开或折叠所有主菜单
    visibleMenus.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        if (isGroupExpanded) {
          // 如果分组当前是展开的，则收起所有主菜单
          if (expandedMenuIds.includes(menu.id)) {
            onMenuToggle(menu.id);
          }
        } else {
          // 如果分组当前是收起的，则展开所有主菜单
          if (!expandedMenuIds.includes(menu.id)) {
            onMenuToggle(menu.id);
          }
        }
      }
    });
  };

  // 渲染菜单项（包括子菜单）
  const renderMenuItems = (menuList: MenuItemType[], level: number = 0) => {
    return menuList
      .filter((menu) => menu.isVisible && menu.isActive)
      .map((menu) => {
        const isExpanded = expandedMenuIds.includes(menu.id);
        const isActive = activeMenuId === menu.id;
        const childCount =
          menu.children?.filter((child) => child.isVisible && child.isActive).length || 0;

        return (
          <div key={menu.id} className="menu-item-wrapper">
            <MenuItem
              menu={menu}
              isActive={isActive}
              isExpanded={isExpanded}
              isFavorite={isFavorite(menu.id)}
              showBadge={level === 0 && childCount > 0}
              level={level}
              onClick={() => onMenuClick(menu.id)}
              onToggle={() => onMenuToggle(menu.id)}
              onToggleFavorite={() => onToggleFavorite(menu.id)}
            />

            {/* 渲染子菜单 */}
            {menu.children && isExpanded && (
              <div className="menu-children">{renderMenuItems(menu.children, level + 1)}</div>
            )}
          </div>
        );
      });
  };

  // 构建分组样式类名
  const groupClasses = ['menu-group', isGroupExpanded && 'menu-group-expanded', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClasses}>
      {/* 分组标题 */}
      <div className="menu-group-header" onClick={handleGroupTitleClick}>
        <div className="menu-group-title-content">
          {showIcon && (
            <span className="menu-group-icon">
              {isGroupExpanded ? <DownOutlined /> : <RightOutlined />}
            </span>
          )}
          <span className="menu-group-title">{title}</span>
          <span className="menu-group-count">({visibleMenus.length})</span>
        </div>
      </div>

      {/* 菜单项列表 */}
      {isGroupExpanded && <div className="menu-group-content">{renderMenuItems(visibleMenus)}</div>}
    </div>
  );
};

export default MenuGroup;
