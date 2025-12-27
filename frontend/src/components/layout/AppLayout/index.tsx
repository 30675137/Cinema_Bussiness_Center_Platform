/**
 * 影院商品管理中台主布局组件
 * 整合侧边栏导航、面包屑、内容区域等
 */

import React, { useEffect } from 'react';
import { Layout, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import { cn } from '@/utils/cn';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import BreadcrumbNavigation from '../Breadcrumb';
import { useUserStore, useUserPreferenceActions, useCurrentUser, useUserRoles } from '@/stores/userStore';
import { useNavigation } from '@/hooks/useNavigation';
import './styles.css';

const { Header, Content } = Layout;
const { Text } = Typography;

/**
 * AppLayout组件Props接口
 */
export interface AppLayoutProps {
  /** 应用标题 */
  title?: string;
  /** 页面标题（用于动态设置document.title） */
  pageTitle?: string;
  /** 自定义头部内容 */
  headerExtra?: React.ReactNode;
  /** 自定义底部内容 */
  footer?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 退出登录回调 */
  onLogout?: () => void;
  /** 用户菜单项 */
  userMenuItems?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
}

/**
 * 主布局组件
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  title = '影院商品管理中台',
  pageTitle,
  headerExtra,
  footer,
  className,
  style,
  onLogout,
  userMenuItems
}) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const userRoles = useUserRoles();
  const { logout } = useUserStore();
  const { toggleSidebarCollapsed } = useUserPreferenceActions();
  const { sidebarCollapsed, refreshMenus } = useNavigation();

  // 初始化菜单数据
  useEffect(() => {
    refreshMenus();
  }, [refreshMenus]);

  // 设置页面标题
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} - ${title}`;
    } else {
      document.title = title;
    }
  }, [pageTitle, title]);

  // 处理用户菜单
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        // 跳转到个人资料页面
        break;
      case 'settings':
        // 跳转到设置页面
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // 处理退出登录
  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 默认用户菜单项
  const defaultUserMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: <SettingOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true
    }
  ];

  const menuItems = userMenuItems || defaultUserMenuItems;

  // 渲染用户头像和下拉菜单
  const renderUserDropdown = () => {
    if (!currentUser) return null;

    return (
      <Dropdown
        menu={{
          items: menuItems,
          onClick: handleUserMenuClick
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <div className="user-avatar-wrapper">
          <Avatar
            src={currentUser.avatar}
            icon={<UserOutlined />}
            classNames={{
              root: 'user-avatar'
            }}
          />
          <div className="user-info">
            <Text className="user-name">{currentUser.displayName || currentUser.username}</Text>
            <Text type="secondary" className="user-role">
              {userRoles[0]?.name || '用户'}
            </Text>
          </div>
        </div>
      </Dropdown>
    );
  };

  return (
    <Layout
      classNames={{
        root: cn('app-layout', className)
      }}
      styles={{
        root: style
      }}
    >
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区域 */}
      <Layout
        classNames={{
          root: 'main-layout'
        }}
      >
        {/* 头部 */}
        <Header
          classNames={{
            root: 'app-header'
          }}
        >
          <div className="header-left">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebarCollapsed}
              classNames={{
                root: 'sidebar-toggle'
              }}
            />
          </div>

          <div className="header-center">
            <Text strong className="app-title">{title}</Text>
          </div>

          <div className="header-right">
            <Space size="middle">
              {/* 通知铃铛 */}
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notification-button"
              />

              {/* 用户信息 */}
              {renderUserDropdown()}
            </Space>
          </div>

          {/* 自定义头部内容 */}
          {headerExtra && (
            <div className="header-extra">
              {headerExtra}
            </div>
          )}
        </Header>

        {/* 面包屑导航 */}
        <div className="app-breadcrumb">
          <BreadcrumbNavigation />
        </div>

        {/* 内容区域 */}
        <Content
          classNames={{
            root: 'app-content'
          }}
        >
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>

        {/* 底部 */}
        {footer && (
          <div className="app-footer">
            {footer}
          </div>
        )}
      </Layout>
    </Layout>
  );
};

export default AppLayout;