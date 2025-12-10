/**
 * 布局头部组件
 */

import React from 'react';
import { Layout, Button, Dropdown, Space, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { useLayoutStore } from '@/stores/layoutStore';
import Breadcrumb from '../Breadcrumb';
import './index.css';

const { Header } = Layout;

/**
 * 布局头部组件
 */
const LayoutHeader: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, theme } = useLayoutStore();

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
    },
    {
      key: 'settings',
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <Header className={`layout-header ${theme}`}>
      <div className="header-left">
        {/* 侧边栏切换按钮 */}
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          className="sidebar-toggle"
        />

        {/* 面包屑导航将在AppLayout中单独处理 */}
      </div>

      <div className="header-right">
        {/* 用户操作区域 */}
        <Space>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button type="text" className="user-info">
              <Avatar size="small" icon={<UserOutlined />} />
              <span className="user-name">管理员</span>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default LayoutHeader;