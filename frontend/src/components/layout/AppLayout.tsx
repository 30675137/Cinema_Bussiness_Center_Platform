import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Breadcrumb, Space, Badge, Tooltip } from 'antd';
import type { MenuProps as AntdMenuProps } from 'antd/es/menu';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AuditOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore, useCurrentUser, useSidebarCollapsed, useBreadcrumbs } from '@/stores/appStore';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarCollapsed = useSidebarCollapsed();
  const currentUser = useCurrentUser();
  const breadcrumbs = useBreadcrumbs();
  const { toggleSidebar } = useAppStore();

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '工作台',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/products/list',
          label: '商品列表',
        },
        {
          key: '/products/create',
          label: '创建商品',
        },
      ],
    },
    {
      key: '/pricing',
      icon: <DollarOutlined />,
      label: '价格配置',
      children: [
        {
          key: '/pricing/configs',
          label: '价格配置单',
        },
        {
          key: '/pricing/preview',
          label: '价格预览',
        },
      ],
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: '审核流程',
      children: [
        {
          key: '/audit/pending',
          label: '待审核',
        },
        {
          key: '/audit/history',
          label: '审核历史',
        },
      ],
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: '库存追溯',
      children: [
        {
          key: '/inventory/query',
          label: '库存查询',
        },
        {
          key: '/inventory/transactions',
          label: '交易流水',
        },
      ],
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => handleLogout(),
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    return [pathname];
  };

  // 获取当前展开的菜单项
  const getOpenKeys = () => {
    const pathname = location.pathname;
    const openKeys: string[] = [];

    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          pathname.startsWith(child.key)
        );
        if (hasActiveChild) {
          openKeys.push(item.key);
        }
      }
    });

    return openKeys;
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理退出登录
  const handleLogout = () => {
    // 清除用户信息
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // 渲染面包屑
  const renderBreadcrumb = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <Breadcrumb
        style={{ margin: '16px 0' }}
        items={breadcrumbs.map((item, index) => ({
          key: index,
          title: item.title,
          ...(item.path && { href: item.path }),
        }))}
      />
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 64,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <AppstoreOutlined
            style={{
              fontSize: '24px',
              color: '#1890ff',
              marginRight: sidebarCollapsed ? 0 : '12px',
            }}
          />
          {!sidebarCollapsed && (
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              商品管理中台
            </span>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* 主内容区域 */}
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 80 : 256,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* 顶部栏 */}
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {/* 左侧：折叠按钮 */}
          <Space>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Space>

          {/* 右侧：用户信息和通知 */}
          <Space>
            {/* 通知 */}
            <Tooltip title="系统通知">
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    fontSize: '16px',
                  }}
                />
              </Badge>
            </Tooltip>

            {/* 用户信息 */}
            <Dropdown
              menu={{ items: userMenuItems as AntdMenuProps['items'] }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={currentUser?.avatar}
                />
                <span>{currentUser?.name || '用户'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: '16px',
            padding: '16px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 64px - 32px)',
          }}
        >
          {/* 面包屑 */}
          {renderBreadcrumb()}

          {/* 页面内容 */}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;