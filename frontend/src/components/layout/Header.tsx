import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        console.log('Handle logout');
        break;
    }
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {onToggle && (
          <Button
            type="text"
            icon={collapsed ? <SettingOutlined /> : <SettingOutlined />}
            onClick={onToggle}
            style={{
              fontSize: '16px',
              width: 40,
              height: 40,
            }}
          />
        )}
        <div style={{ marginLeft: collapsed ? 16 : 0 }}>
          <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
            影院商品管理中台
          </Text>
        </div>
      </div>

      <Space size="large">
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: '16px' }} />
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text>管理员</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
