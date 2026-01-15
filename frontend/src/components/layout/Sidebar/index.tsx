/**
 * 侧边栏导航组件
 * 展示影院商品管理中台的完整导航菜单结构，支持响应式布局和移动端适配
 */

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Tooltip, Input, Badge, Drawer } from 'antd';
import { cn } from '@/utils/cn';
import {
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  HomeOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useResponsive } from '@/hooks/useResponsive';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import NavigationSearch from '@/components/common/NavigationSearch';
import FavoriteMenu from '@/components/common/FavoriteMenu';
import './styles.css';
import { useUserStore } from '@/stores/userStore';

const { Sider } = Layout;

/**
 * 侧边栏组件Props接口
 */
export interface SidebarProps {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示折叠按钮 */
  showCollapseButton?: boolean;
  /** 折叠按钮位置 */
  collapseButtonPosition?: 'top' | 'bottom';
  /** 底部内容 */
  footer?: React.ReactNode;
  /** 是否固定宽度 */
  fixedWidth?: boolean;
  /** 是否显示搜索功能 */
  showSearch?: boolean;
  /** 是否显示收藏功能 */
  showFavorites?: boolean;
  /** 强制移动端模式 */
  forceMobile?: boolean;
}

/**
 * 侧边栏导航组件
 */
const Sidebar: React.FC<SidebarProps> = ({
  className,
  style,
  showCollapseButton = true,
  collapseButtonPosition = 'bottom',
  footer,
  fixedWidth = false,
  showSearch = true,
  showFavorites = true,
  forceMobile = false,
}) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { isMobile, isTablet, width } = useResponsive();
  const { sidebarExpanded, toggleSidebar: toggleUserSidebar } = useUserPreferences();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showFavoritePanel, setShowFavoritePanel] = useState(false);

  const {
    menus,
    loading,
    error,
    activeMenu,
    expandedMenuIds,
    searchQuery,
    navigateToMenu,
    toggleMenuExpansion,
    setSearchQuery,
    searchResults,
    isFavorite,
    toggleFavorite,
  } = useNavigation();

  // 使用用户偏好的侧边栏状态
  const sidebarCollapsed = !sidebarExpanded;

  // 响应式侧边栏配置
  const isMobileMode = forceMobile || isMobile;
  const isCompactMode = isTablet || width < 1200;
  const shouldUseDrawer = isMobileMode;

  // 自动折叠移动端侧边栏
  useEffect(() => {
    if (isMobileMode && sidebarExpanded) {
      toggleUserSidebar();
    }
  }, [isMobileMode, sidebarExpanded, toggleUserSidebar]);

  // 处理移动端抽屉关闭
  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  // 处理移动端菜单点击
  const handleMobileMenuClick = (key: string) => {
    navigateToMenu(key);
    if (shouldUseDrawer) {
      setMobileDrawerOpen(false);
    }
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigateToMenu(key);
  };

  // 处理菜单展开/折叠
  const handleMenuToggle = ({ key }: { key: string }) => {
    toggleMenuExpansion(key);
  };

  // 转换菜单数据为Ant Design Menu格式
  const transformMenuData = (menus: any[]) => {
    return menus.map((menu) => ({
      key: menu.id,
      label: (
        <span className="menu-item-label">
          {menu.name}
          {showFavorites && isFavorite(menu.id) && <StarFilled className="favorite-indicator" />}
        </span>
      ),
      icon: getMenuIcon(menu.icon),
      children:
        menu.children && menu.children.length > 0 ? transformMenuData(menu.children) : undefined,
      ...(menu.path && {
        onClick: () => (shouldUseDrawer ? handleMobileMenuClick(menu.id) : navigateToMenu(menu.id)),
      }),
    }));
  };

  // 获取菜单图标
  const getMenuIcon = (iconName?: string) => {
    // 这里可以根据图标名称返回对应的图标组件
    // 暂时返回默认图标
    return iconName ? React.createElement('span', { className: `icon-${iconName}` }) : null;
  };

  // 获取响应式宽度配置
  const getResponsiveWidth = () => {
    if (isMobileMode) return 0;
    if (isCompactMode) return 200;
    return 256;
  };

  // 获取响应式折叠宽度
  const getResponsiveCollapsedWidth = () => {
    if (isMobileMode) return 0;
    return isCompactMode ? 60 : 80;
  };

  // 渲染加载状态
  if (loading) {
    return (
      <Sider
        width={256}
        collapsed={false}
        className={`sidebar sidebar-loading ${className || ''}`}
        style={style}
      >
        <div className="sidebar-loading-content">
          <div className="loading-spinner" />
          <p>加载菜单中...</p>
        </div>
      </Sider>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Sider
        width={256}
        collapsed={false}
        className={`sidebar sidebar-error ${className || ''}`}
        style={style}
      >
        <div className="sidebar-error-content">
          <p>菜单加载失败</p>
          <Button type="primary" size="small" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </Sider>
    );
  }

  // 显示的菜单数据
  const displayMenus = searchQuery ? searchResults : menus;

  // 渲染侧边栏内容
  const renderSidebarContent = () => (
    <div className="sidebar-content h-full flex flex-col">
      {/* 头部区域 */}
      {(!sidebarCollapsed || isMobileMode) && (
        <div className="sidebar-header">
          <div className="sidebar-title">
            <MenuOutlined className="sidebar-icon" />
            {!sidebarCollapsed && <span className="sidebar-title-text">影院商品管理中台</span>}
          </div>

          {/* 搜索框 */}
          {showSearch && !sidebarCollapsed && (
            <div className="sidebar-search">
              <NavigationSearch
                placeholder="搜索菜单..."
                className="sidebar-navigation-search"
                onSelect={(item) => {
                  if (shouldUseDrawer) {
                    setMobileDrawerOpen(false);
                  }
                }}
              />
            </div>
          )}

          {/* 移动端关闭按钮 */}
          {isMobileMode && (
            <div className="mobile-close-button">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleMobileDrawerClose}
                className="close-drawer-btn"
              />
            </div>
          )}
        </div>
      )}

      {/* 收藏菜单 */}
      {showFavorites && !sidebarCollapsed && (
        <div className="sidebar-favorites">
          <FavoriteMenu
            showTitle={false}
            showActions={false}
            layout="list"
            maxItems={3}
            onItemClick={(item) => {
              if (shouldUseDrawer) {
                setMobileDrawerOpen(false);
              }
            }}
          />
        </div>
      )}

      {/* 菜单区域 */}
      <div className="sidebar-menu flex-1 overflow-y-auto overflow-x-hidden">
        <Menu
          mode="inline"
          selectedKeys={activeMenu ? [activeMenu.id] : []}
          defaultOpenKeys={expandedMenuIds}
          items={transformMenuData(displayMenus)}
          onClick={shouldUseDrawer ? ({ key }) => handleMobileMenuClick(key) : handleMenuClick}
          onTitleClick={handleMenuToggle}
          style={{ border: 'none' }}
          inlineCollapsed={sidebarCollapsed}
        />
      </div>

      {/* 底部区域 */}
      <div className="sidebar-footer">
        {/* 折叠按钮 */}
        {showCollapseButton && !isMobileMode && (
          <div className="sidebar-collapse-section">
            {collapseButtonPosition === 'top' && footer && (
              <div className="sidebar-custom-footer">{footer}</div>
            )}

            <Tooltip title={sidebarCollapsed ? '展开菜单' : '收起菜单'} placement="right">
              <Button
                type="text"
                icon={sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
                onClick={toggleUserSidebar}
                className="collapse-button"
              />
            </Tooltip>

            {collapseButtonPosition === 'bottom' && footer && (
              <div className="sidebar-custom-footer">{footer}</div>
            )}
          </div>
        )}

        {/* 版本信息 */}
        {!sidebarCollapsed && !isMobileMode && (
          <div className="sidebar-version">
            <span>v1.0.0</span>
          </div>
        )}
      </div>
    </div>
  );

  // 移动端使用抽屉，桌面端使用侧边栏
  if (shouldUseDrawer) {
    return (
      <>
        {/* 移动端菜单触发按钮 */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileDrawerOpen(true)}
          className="mobile-menu-trigger"
        />

        {/* 移动端抽屉 */}
        <Drawer
          title="导航菜单"
          placement="left"
          onClose={handleMobileDrawerClose}
          open={mobileDrawerOpen}
          width="80%"
          closable={false}
          classNames={{
            root: cn('sidebar-drawer', className),
          }}
          styles={{
            body: { padding: 0 },
          }}
        >
          {renderSidebarContent()}
        </Drawer>
      </>
    );
  }

  // 桌面端侧边栏
  return (
    <Sider
      width={getResponsiveWidth()}
      collapsed={sidebarCollapsed}
      collapsedWidth={getResponsiveCollapsedWidth()}
      classNames={{
        root: cn(
          'sidebar',
          {
            compact: isCompactMode,
            mobile: isMobileMode,
          },
          className
        ),
      }}
      styles={{
        root: {
          overflow: 'hidden',
          position: fixedWidth ? 'fixed' : 'relative',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#1f2937',
          ...style,
        },
      }}
      trigger={null}
    >
      {renderSidebarContent()}
    </Sider>
  );
};

export default Sidebar;
