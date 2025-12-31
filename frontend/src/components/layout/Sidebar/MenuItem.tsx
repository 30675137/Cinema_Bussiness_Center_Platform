/**
 * 菜单项组件
 * 支持图标、标签、收藏、面包屑等功能
 */

import React, { useState } from 'react';
import { Tooltip, Badge } from 'antd';
import {
  StarFilled,
  StarOutlined,
  RightOutlined,
  DownOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  DollarOutlined,
  ShoppingOutlined,
  InboxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  // 其他业务图标
  UserOutlined,
  TeamOutlined,
  DeploymentUnitOutlined,
  PercentageOutlined,
  FileSearchOutlined,
  PartitionOutlined,
  HddOutlined,
  CalendarTwoTone,
  ReconciliationOutlined,
  DashboardOutlined,
  PictureOutlined,
  BoxOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { MenuItem as MenuItemType, MenuLevel } from '@/types/navigation';

/**
 * 菜单项组件Props接口
 */
export interface MenuItemProps {
  /** 菜单数据 */
  menu: MenuItemType;
  /** 是否为当前活动菜单 */
  isActive?: boolean;
  /** 是否展开 */
  isExpanded?: boolean;
  /** 是否为收藏菜单 */
  isFavorite?: boolean;
  /** 是否显示子菜单数量徽章 */
  showBadge?: boolean;
  /** 是否显示面包屑路径 */
  showBreadcrumb?: boolean;
  /** 折叠状态 */
  collapsed?: boolean;
  /** 菜单点击回调 */
  onClick?: () => void;
  /** 菜单展开/折叠回调 */
  onToggle?: () => void;
  /** 收藏切换回调 */
  onToggleFavorite?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 缩进级别 */
  level?: number;
}

/**
 * 图标映射表
 */
const iconMap: Record<string, React.ComponentType<any>> = {
  // 基础设置图标
  home: HomeOutlined,
  setting: SettingOutlined,
  user: UserOutlined,
  team: TeamOutlined,
  role: SafetyOutlined,
  approval: FileTextOutlined,

  // 商品管理图标
  shop: ShopOutlined,
  product: ShopOutlined,
  package: DeploymentUnitOutlined,
  image: PictureOutlined,
  content: FileTextOutlined,

  // BOM/配方管理图标
  formula: PartitionOutlined,
  cost: DollarOutlined,
  material: DeploymentUnitOutlined,
  bom: PartitionOutlined,

  // 场景包管理图标
  scenario: CalendarTwoTone,
  combo: BoxOutlined,
  package: BoxOutlined,

  // 价格管理图标
  price: DollarOutlined,
  pricelist: FileSearchOutlined,
  pricing: PercentageOutlined,

  // 采购管理图标
  procurement: ShoppingOutlined,
  supplier: UserOutlined,
  purchase: ShoppingOutlined,
  warehouse: InboxOutlined,
  receiving: InboxOutlined,
  transfer: SwapOutlined,

  // 库存管理图标
  inventory: HddOutlined,
  stock: InboxOutlined,
  allocation: PartitionOutlined,

  // 档期排期图标
  schedule: CalendarOutlined,
  resource: PartitionOutlined,
  gantt: BarChartOutlined,
  hall: CalendarOutlined,
  conflict: FileSearchOutlined,

  // 库存管理图标
  inventory: HddOutlined,
  stock: InboxOutlined,
  transfer: SwapOutlined,
  check: FileSearchOutlined,

  // 档期排期图标
  schedule: CalendarOutlined,
  resource: PartitionOutlined,
  gantt: BarChartOutlined,

  // 订单管理图标
  order: FileTextOutlined,
  fulfillment: ReconciliationOutlined,
  verification: SafetyOutlined,

  // 运营报表图标
  dashboard: DashboardOutlined,
  report: BarChartOutlined,
  analytics: BarChartOutlined,

  // 系统管理图标
  system: SettingOutlined,
  admin: SafetyOutlined,
  audit: FileSearchOutlined,

  // 默认图标
  default: FileTextOutlined,
};

/**
 * 获取菜单图标
 */
const getMenuIcon = (iconName?: string): React.ComponentType<any> => {
  if (!iconName) return FileTextOutlined;

  // 转换为小写进行匹配
  const lowerIconName = iconName.toLowerCase();

  // 直接匹配
  if (iconMap[lowerIconName]) {
    return iconMap[lowerIconName];
  }

  // 模糊匹配
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerIconName.includes(key) || key.includes(lowerIconName)) {
      return icon;
    }
  }

  return iconMap.default;
};

/**
 * 菜单项组件
 */
const MenuItem: React.FC<MenuItemProps> = ({
  menu,
  isActive = false,
  isExpanded = false,
  isFavorite = false,
  showBadge = false,
  showBreadcrumb = false,
  collapsed = false,
  onClick,
  onToggle,
  onToggleFavorite,
  className,
  level = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 获取菜单图标组件
  const IconComponent = getMenuIcon(menu.icon);

  // 处理菜单点击
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick();
    }
  };

  // 处理展开/折叠点击
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onToggle) {
      onToggle();
    }
  };

  // 处理收藏点击
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  // 计算子菜单数量
  const childCount = menu.children?.length || 0;

  // 构建菜单样式类名
  const menuClasses = [
    'menu-item',
    `menu-item-level-${level}`,
    isActive && 'menu-item-active',
    !menu.isActive && 'menu-item-disabled',
    !menu.isVisible && 'menu-item-hidden',
    isHovered && 'menu-item-hover',
    collapsed && 'menu-item-collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 渲染图标
  const renderIcon = () => {
    if (!IconComponent) return null;

    return (
      <span className="menu-item-icon">
        <IconComponent />
      </span>
    );
  };

  // 渲染展开/折叠按钮
  const renderExpandButton = () => {
    if (childCount === 0) return null;

    return (
      <span
        className={`menu-item-expand ${isExpanded ? 'expanded' : ''}`}
        onClick={handleToggleClick}
      >
        {isExpanded ? <DownOutlined /> : <RightOutlined />}
      </span>
    );
  };

  // 渲染徽章
  const renderBadge = () => {
    if (!showBadge || childCount === 0) return null;

    return <Badge count={childCount} size="small" className="menu-item-badge" />;
  };

  // 渲染收藏按钮
  const renderFavoriteButton = () => {
    if (!onToggleFavorite) return null;

    return (
      <span
        className={`menu-item-favorite ${isFavorite ? 'favorited' : ''}`}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
      </span>
    );
  };

  // 渲染面包屑路径
  const renderBreadcrumb = () => {
    if (!showBreadcrumb || menu.level === MenuLevel.MAIN) return null;

    return (
      <div className="menu-item-breadcrumb">
        <span className="breadcrumb-text">
          {menu.functionalArea} &gt; {menu.name}
        </span>
      </div>
    );
  };

  // 渲染菜单标签
  const renderLabel = () => {
    return <span className="menu-item-label">{menu.name}</span>;
  };

  // 渲染描述
  const renderDescription = () => {
    if (!menu.description || collapsed) return null;

    return <div className="menu-item-description">{menu.description}</div>;
  };

  // 折叠状态下只显示图标
  if (collapsed) {
    return (
      <Tooltip title={menu.name} placement="right" mouseEnterDelay={0.5}>
        <div
          className={`${menuClasses} menu-item-collapsed-view`}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderIcon()}
          {renderFavoriteButton()}
        </div>
      </Tooltip>
    );
  }

  // 完整菜单项视图
  return (
    <div
      className={menuClasses}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="menu-item-content">
        {/* 左侧图标和展开按钮 */}
        <div className="menu-item-left">
          {renderIcon()}
          {renderExpandButton()}
        </div>

        {/* 中间标签和描述 */}
        <div className="menu-item-middle">
          {renderLabel()}
          {renderDescription()}
          {renderBreadcrumb()}
        </div>

        {/* 右侧徽章和收藏按钮 */}
        <div className="menu-item-right">
          {renderBadge()}
          {renderFavoriteButton()}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
