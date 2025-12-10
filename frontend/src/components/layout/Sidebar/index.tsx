/**
 * 侧边栏组件
 */

import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  DollarOutlined,
  AuditOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  TableOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useLayoutStore } from '@/stores/layoutStore';
import { useLayoutState } from '@/hooks/useLayoutState';
import { useResponsive } from '@/hooks/useResponsive';
import { menuConfig } from '@/mock/menu';
import type { MenuProps } from 'antd';
import './index.css';

const { Sider } = Layout;

/**
 * 图标映射
 */
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  ShopOutlined: <ShopOutlined />,
  DollarOutlined: <DollarOutlined />,
  AuditOutlined: <AuditOutlined />,
  EyeOutlined: <EyeOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  PlusOutlined: <PlusOutlined />,
  TableOutlined: <TableOutlined />,
  SettingOutlined: <SettingOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  LineChartOutlined: <LineChartOutlined />,
};

/**
 * 侧边栏组件
 */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { selectedMenuKeys } = useLayoutState();
  const { isMobile } = useResponsive();

  /**
   * 递归转换菜单配置为Ant Design菜单项
   */
  const convertMenuItems = (items: typeof menuConfig): MenuProps['items'] => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          key: item.id,
          icon: iconMap[item.icon],
          label: item.title,
          children: convertMenuItems(item.children),
        };
      }

      return {
        key: item.id,
        icon: iconMap[item.icon],
        label: item.title,
        onClick: () => handleMenuClick(item.path),
      };
    });
  };

  /**
   * 处理菜单点击
   */
  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  /**
   * 获取菜单项
   */
  const menuItems = convertMenuItems(menuConfig);

  return (
    <Sider
      className={`layout-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      trigger={null}
      width={200}
      collapsedWidth={80}
      breakpoint="lg"
    >
      {/* 菜单头部 */}
      <div className="sidebar-header">
        <div className="logo">
          {sidebarCollapsed ? (
            <span className="logo-text">耀</span>
          ) : (
            <span className="logo-text">耀莱影城</span>
          )}
        </div>
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={selectedMenuKeys}
        items={menuItems}
        className="sidebar-menu"
        inlineCollapsed={sidebarCollapsed}
      />

      {/* 折叠按钮 */}
      <div className="sidebar-footer">
        <button
          className="collapse-btn"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
    </Sider>
  );
};

export default Sidebar;