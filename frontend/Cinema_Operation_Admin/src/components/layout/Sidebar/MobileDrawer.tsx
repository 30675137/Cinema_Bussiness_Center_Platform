/**
 * 移动端导航抽屉组件
 * 提供移动设备上的全屏导航菜单
 */

import React, { useEffect, useRef } from 'react';
import { Drawer, List, Button, Avatar, Typography, Space } from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  StarOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { MenuItem } from '@/types/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigation } from '@/hooks/useNavigation';
import './MobileDrawer.css';

const { Title, Text } = Typography;

/**
 * 移动端导航抽屉组件属性接口
 */
export interface MobileDrawerProps {
  /** 抽屉是否可见 */
  visible: boolean;
  /** 关闭抽屉的回调函数 */
  onClose: () => void;
  /** 菜单数据列表 */
  menus: MenuItem[];
  /** 当前激活的菜单ID */
  activeMenuId?: string | null;
  /** 用户信息 */
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 移动端导航抽屉组件
 */
const MobileDrawer: React.FC<MobileDrawerProps> = ({
  visible,
  onClose,
  menus,
  activeMenuId,
  userInfo,
  className = '',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { getFavorites } = useUserPreferences();
  const { navigateToMenuItem } = useNavigation();

  const favorites = getFavorites();
  const favoriteMenus = menus.filter(menu => favorites.includes(menu.id));

  /**
   * 处理菜单点击
   */
  const handleMenuClick = (menu: MenuItem) => {
    navigateToMenuItem(menu);
    onClose();
  };

  /**
   * 处理收藏菜单点击
   */
  const handleFavoriteClick = (menu: MenuItem) => {
    navigateToMenuItem(menu);
    onClose();
  };

  /**
   * 处理ESC键关闭抽屉
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  /**
   * 处理点击遮罩层关闭
   */
  const handleMaskClick = () => {
    onClose();
  };

  /**
   * 渲染菜单项
   */
  const renderMenuItem = (menu: MenuItem) => {
    const isActive = menu.id === activeMenuId;
    const hasChildren = menu.children && menu.children.length > 0;

    return (
      <List.Item
        key={menu.id}
        className={`mobile-menu-item ${isActive ? 'active' : ''}`}
        onClick={() => handleMenuClick(menu)}
      >
        <div className="menu-item-content">
          <Space>
            {menu.icon && <span className="menu-icon">{menu.icon}</span>}
            <span className="menu-title">{menu.name}</span>
            {hasChildren && <span className="menu-children-count">{menu.children?.length}</span>}
          </Space>
        </div>
      </List.Item>
    );
  };

  /**
   * 渲染收藏菜单
   */
  const renderFavoriteMenus = () => {
    if (favoriteMenus.length === 0) return null;

    return (
      <div className="mobile-favorite-section">
        <div className="section-header">
          <StarOutlined className="section-icon" />
          <span className="section-title">收藏菜单</span>
        </div>
        <List
          className="favorite-menu-list"
          dataSource={favoriteMenus}
          renderItem={(menu) => (
            <List.Item
              key={menu.id}
              className="favorite-menu-item"
              onClick={() => handleFavoriteClick(menu)}
            >
              <Space>
                {menu.icon && <span className="menu-icon">{menu.icon}</span>}
                <span className="menu-title">{menu.name}</span>
              </Space>
            </List.Item>
          )}
        />
      </div>
    );
  };

  /**
   * 渲染用户信息区域
   */
  const renderUserInfo = () => {
    if (!userInfo) return null;

    return (
      <div className="mobile-user-section">
        <div className="user-info">
          <Avatar
            size={48}
            src={userInfo.avatar}
            icon={<UserOutlined />}
            className="user-avatar"
          />
          <div className="user-details">
            <Title level={5} className="user-name">
              {userInfo.name}
            </Title>
            <Text type="secondary" className="user-email">
              {userInfo.email}
            </Text>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 渲染快捷操作区域
   */
  const renderQuickActions = () => {
    return (
      <div className="mobile-quick-actions">
        <Button
          type="text"
          icon={<HomeOutlined />}
          className="quick-action-btn"
          onClick={() => {
            // 导航到首页
            onClose();
          }}
        >
          首页
        </Button>
        <Button
          type="text"
          icon={<HistoryOutlined />}
          className="quick-action-btn"
          onClick={() => {
            // 导航到最近访问
            onClose();
          }}
        >
          最近访问
        </Button>
        <Button
          type="text"
          icon={<SettingOutlined />}
          className="quick-action-btn"
          onClick={() => {
            // 导航到设置
            onClose();
          }}
        >
          设置
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      ref={drawerRef}
      title={null}
      placement="left"
      open={visible}
      onClose={handleMaskClick}
      closable={false}
      width="85%"
      maxWidth={320}
      className={`mobile-navigation-drawer ${className}`}
      maskClosable={true}
      styles={{
        body: { padding: 0 },
        header: { padding: 0 },
        footer: { padding: 0 }
      }}
    >
      <div className="mobile-drawer-content">
        {/* 头部区域 */}
        <div className="mobile-drawer-header">
          <div className="header-content">
            <Space>
              <MenuOutlined className="header-icon" />
              <Title level={4} className="header-title">
                导航菜单
              </Title>
            </Space>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="close-btn"
            />
          </div>
        </div>

        {/* 用户信息区域 */}
        {renderUserInfo()}

        {/* 快捷操作区域 */}
        {renderQuickActions()}

        {/* 收藏菜单区域 */}
        {renderFavoriteMenus()}

        {/* 主菜单区域 */}
        <div className="mobile-menu-section">
          <div className="section-header">
            <MenuOutlined className="section-icon" />
            <span className="section-title">全部菜单</span>
          </div>
          <List
            className="main-menu-list"
            dataSource={menus}
            renderItem={renderMenuItem}
          />
        </div>

        {/* 底部区域 */}
        <div className="mobile-drawer-footer">
          <Text type="secondary" className="footer-text">
            影院商品管理中台 v1.0
          </Text>
        </div>
      </div>
    </Drawer>
  );
};

export default MobileDrawer;