import React from 'react';
import { Layout, Button, Avatar, Dropdown, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { cn } from '@/utils/cn';
import type { UserInfo } from '../AppLayout/types';

const { Header } = Layout;
const { Text } = Typography;

/**
 * Header 组件Props接口
 */
export interface HeaderProps {
  /** 应用标题 */
  title?: string;
  /** 应用Logo */
  logo?: React.ReactNode;
  /** 用户信息 */
  user?: UserInfo;
  /** 侧边栏是否收起 */
  sidebarCollapsed?: boolean;
  /** 侧边栏收起变化回调 */
  onSidebarToggle?: () => void;
  /** 是否显示菜单按钮 */
  showMenuButton?: boolean;
  /** 是否为移动端 */
  isMobile?: boolean;
  /** 移动端菜单点击回调 */
  onMobileMenuClick?: () => void;
  /** 头部额外内容 */
  extra?: React.ReactNode;
  /** 主题模式 */
  theme?: 'light' | 'dark';
  /** 背景色 */
  backgroundColor?: string;
  /** 高度 */
  height?: number;
  /** 是否固定定位 */
  fixed?: boolean;
  /** 左边距（固定定位时） */
  left?: number;
  /** 退出登录回调 */
  onLogout?: () => void;
  /** 用户菜单项 */
  userMenuItems?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    type?: 'divider';
    danger?: boolean;
  }>;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * Header 头部组件
 */
function HeaderComponent({
  title = '影院商品管理中台',
  logo,
  user,
  sidebarCollapsed = false,
  onSidebarToggle,
  showMenuButton = true,
  isMobile = false,
  onMobileMenuClick,
  extra,
  theme = 'light',
  backgroundColor,
  height = 64,
  fixed = false,
  left = 0,
  onLogout,
  userMenuItems,
  className,
  style,
}: HeaderProps) {
  // 默认用户菜单
  const defaultUserMenuItems = [
    {
      key: 'profile',
      label: '个人设置',
      icon: <UserOutlined />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: <SettingOutlined />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: onLogout || (() => console.log('Logout clicked')),
    },
  ];

  const finalUserMenuItems = userMenuItems || defaultUserMenuItems;

  return (
    <Header
      classNames={{
        root: cn(
          'custom-header flex items-center justify-between px-4 shadow-sm',
          theme === 'dark' && 'custom-header-dark',
          className
        )
      }}
      styles={{
        root: {
          height,
          backgroundColor: backgroundColor || (theme === 'dark' ? '#001529' : '#ffffff'),
          position: fixed ? 'fixed' : 'relative',
          top: fixed ? 0 : undefined,
          left: fixed ? left : undefined,
          width: fixed ? '100%' : undefined,
          zIndex: 1000,
          transition: 'left 0.2s, background-color 0.3s',
          ...style,
        }
      }}
    >
      {/* 左侧区域 */}
      <div className="flex items-center">
        {/* 菜单按钮 */}
        {showMenuButton && (
          <Button
            type="text"
            icon={
              isMobile ? (
                <MenuOutlined />
              ) : sidebarCollapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={isMobile ? onMobileMenuClick : onSidebarToggle}
            classNames={{
              root: 'mr-4'
            }}
          />
        )}

        {/* Logo和标题 */}
        <div className="flex items-center">
          {logo && (
            <div className="mr-3 flex items-center">
              {logo}
            </div>
          )}
          <Text strong className={cn('text-lg', theme === 'dark' && 'text-white')}>
            {title}
          </Text>
        </div>
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center">
        {/* 额外内容 */}
        {extra && (
          <div className="mr-4">
            {extra}
          </div>
        )}

        {/* 用户信息 */}
        {user && (
          <Dropdown
            menu={{
        items: finalUserMenuItems.map(item =>
          item.type === 'divider'
            ? { type: 'divider' as const }
            : { ...item, type: 'item' as const }
        )
      }}
            placement="bottomRight"
            arrow
          >
            <div className={cn(
              'flex items-center cursor-pointer px-3 py-2 rounded transition-colors',
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            )}>
              <Avatar
                size="small"
                src={user.avatar}
                icon={<UserOutlined />}
                classNames={{
                  root: 'mr-2'
                }}
              />
              <div className="hidden sm:block">
                <div className={cn(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {user.username}
                </div>
                {user.role && (
                  <div className={cn(
                    'text-xs',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {user.role}
                  </div>
                )}
              </div>
            </div>
          </Dropdown>
        )}
      </div>
    </Header>
  );
}

export default HeaderComponent;