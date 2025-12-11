/**
 * 用户角色选择器组件
 * 用于测试和演示不同角色的权限效果
 */

import React, { useState } from 'react';
import {
  Card,
  Select,
  Avatar,
  Space,
  Typography,
  Badge,
  Tag,
  Divider,
  Tooltip,
  Dropdown,
  Button,
  Menu,
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  SafetyOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { usePermissions } from '@/hooks/usePermissions';
import type { User, UserRole, Permission } from '@types/inventory';

const { Text, Title } = Typography;
const { Option } = Select;

interface UserRoleSelectorProps {
  style?: React.CSSProperties;
  showPermissions?: boolean;
  compact?: boolean;
}

// 角色配置
const ROLE_CONFIG = {
  viewer: {
    name: '查看员',
    color: 'default',
    icon: <EyeOutlined />,
    description: '只能查看数据',
    permissions: ['read'],
  },
  operator: {
    name: '操作员',
    color: 'processing',
    icon: <EditOutlined />,
    description: '可以查看和编辑数据，进行库存调整',
    permissions: ['read', 'write', 'adjust'],
  },
  admin: {
    name: '管理员',
    color: 'error',
    icon: <SafetyOutlined />,
    description: '拥有所有权限',
    permissions: ['read', 'write', 'delete', 'adjust', 'transfer', 'admin', 'export'],
  },
} as const;

// 权限配置
const PERMISSION_CONFIG = {
  read: {
    name: '查看',
    icon: <EyeOutlined />,
    color: 'green',
  },
  write: {
    name: '编辑',
    icon: <EditOutlined />,
    color: 'blue',
  },
  delete: {
    name: '删除',
    icon: <DeleteOutlined />,
    color: 'red',
  },
  adjust: {
    name: '调整',
    icon: <SettingOutlined />,
    color: 'orange',
  },
  transfer: {
    name: '调拨',
    icon: <SwapOutlined />,
    color: 'purple',
  },
  admin: {
    name: '管理',
    icon: <SafetyOutlined />,
    color: 'red',
  },
  export: {
    name: '导出',
    icon: <ExportOutlined />,
    color: 'cyan',
  },
} as const;

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  style,
  showPermissions = true,
  compact = false,
}) => {
  const { currentUser, switchUser, availableUsers, permissionLevel, hasPermission } = usePermissions();
  const [showPermissionList, setShowPermissionList] = useState(false);

  // 渲染角色标签
  const renderRoleTag = (role: UserRole) => {
    const config = ROLE_CONFIG[role];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.name}
      </Tag>
    );
  };

  // 渲染权限标签
  const renderPermissionTags = (permissions: Permission[]) => {
    return (
      <Space size="small" wrap>
        {permissions.map(permission => {
          const config = PERMISSION_CONFIG[permission];
          return (
            <Tooltip key={permission} title={config.name}>
              <Tag
                color={config.color}
                icon={config.icon}
                style={{ cursor: 'pointer' }}
              >
                {config.name}
              </Tag>
            </Tooltip>
          );
        })}
      </Space>
    );
  };

  // 渲染用户选项
  const renderUserOption = (user: User) => (
    <Option key={user.id} value={user.id}>
      <Space>
        <Avatar size="small" icon={<UserOutlined />} src={user.avatar}>
          {user.name.charAt(0)}
        </Avatar>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong>{user.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user.email}
          </Text>
        </Space>
        {renderRoleTag(user.role)}
      </Space>
    </Option>
  );

  // 渲染用户信息
  const renderUserInfo = () => (
    <Space align="start">
      <Avatar
        size={compact ? 'default' : 'large'}
        icon={<UserOutlined />}
        src={currentUser.avatar}
      >
        {currentUser.name.charAt(0)}
      </Avatar>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <Text strong>{currentUser.name}</Text>
          <Badge
            count={permissionLevel}
            style={{
              backgroundColor: ROLE_CONFIG[currentUser.role].color === 'error' ? '#f5222d' :
                               ROLE_CONFIG[currentUser.role].color === 'processing' ? '#1890ff' : '#d9d9d9',
            }}
          />
        </Space>
        {!compact && (
          <>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentUser.email}
            </Text>
            {renderRoleTag(currentUser.role)}
          </>
        )}
      </Space>
    </Space>
  );

  // 渲染权限列表
  const renderPermissionList = () => {
    if (!showPermissions) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
          拥有权限:
        </Text>
        <div style={{ marginTop: 8 }}>
          {renderPermissionTags(currentUser.permissions)}
        </div>
      </div>
    );
  };

  // 渲染角色说明
  const renderRoleDescription = () => {
    const config = ROLE_CONFIG[currentUser.role];
    return (
      <Text type="secondary" style={{ fontSize: '12px' }}>
        {config.description}
      </Text>
    );
  };

  // 渲染角色选择菜单
  const renderRoleMenu = () => (
    <Menu>
      {availableUsers.map(user => (
        <Menu.Item
          key={user.id}
          onClick={() => switchUser(user.id)}
          disabled={user.id === currentUser.id}
          icon={<UserOutlined />}
        >
          <Space>
            <Text>{user.name}</Text>
            {renderRoleTag(user.role)}
            {user.id === currentUser.id && <Tag color="green">当前</Tag>}
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );

  // 紧凑模式渲染
  if (compact) {
    return (
      <div style={style}>
        <Space split={<Divider type="vertical" />}>
          {renderUserInfo()}
          <Dropdown
            overlay={renderRoleMenu()}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<SwapOutlined />}
              style={{ fontSize: '12px' }}
            >
              切换角色
            </Button>
          </Dropdown>
        </Space>
      </div>
    );
  }

  // 标准模式渲染
  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>用户角色</span>
        </Space>
      }
      size="small"
      style={style}
      extra={
        <Dropdown
          overlay={renderRoleMenu()}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="link" size="small" icon={<SwapOutlined />}>
            切换角色
          </Button>
        </Dropdown>
      }
      bodyStyle={{ padding: '12px' }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {renderUserInfo()}
        {renderRoleDescription()}
        {renderPermissionList()}

        {/* 权限统计 */}
        {showPermissions && (
          <div style={{ marginTop: 8 }}>
            <Space split={<Divider type="vertical" />}>
              <Text style={{ fontSize: '12px' }}>
                权限数量: <Text strong>{currentUser.permissions.length}</Text>
              </Text>
              <Text style={{ fontSize: '12px' }}>
                权限级别: <Text strong>{permissionLevel}</Text>
              </Text>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

// 角色切换按钮组件
export const RoleSwitchButton: React.FC<{
  style?: React.CSSProperties;
  showCurrentRole?: boolean;
}> = ({ style, showCurrentRole = false }) => {
  const { currentUser, switchUser, availableUsers } = usePermissions();

  return (
    <Dropdown
      overlay={
        <Menu>
          {availableUsers.map(user => (
            <Menu.Item
              key={user.id}
              onClick={() => switchUser(user.id)}
              disabled={user.id === currentUser.id}
              icon={<UserOutlined />}
            >
              <Space>
                <Text>{user.name}</Text>
                <Tag color={ROLE_CONFIG[user.role].color} size="small">
                  {ROLE_CONFIG[user.role].name}
                </Tag>
                {user.id === currentUser.id && (
                  <Tag color="green" size="small">
                    当前
                  </Tag>
                )}
              </Space>
            </Menu.Item>
          ))}
        </Menu>
      }
      trigger={['click']}
    >
      <Button
        type="default"
        size="small"
        icon={<SwapOutlined />}
        style={style}
      >
        {showCurrentRole ? (
          <Space>
            <span>切换角色</span>
            <Tag color={ROLE_CONFIG[currentUser.role].color} size="small">
              {ROLE_CONFIG[currentUser.role].name}
            </Tag>
          </Space>
        ) : (
          '切换角色'
        )}
      </Button>
    </Dropdown>
  );
};

// 权限状态指示器
export const PermissionIndicator: React.FC<{
  permission: Permission;
  children: React.ReactNode;
  showTooltip?: boolean;
}> = ({ permission, children, showTooltip = true }) => {
  const { hasPermission } = usePermissions();
  const hasAccess = hasPermission(permission);
  const config = PERMISSION_CONFIG[permission];

  const content = (
    <div style={{ display: 'inline-block' }}>
      {children}
    </div>
  );

  if (hasAccess) {
    return content;
  }

  if (showTooltip) {
    return (
      <Tooltip
        title={`需要 ${config.name} 权限`}
        placement="top"
      >
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
          {content}
        </div>
      </Tooltip>
    );
  }

  return (
    <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
      {content}
    </div>
  );
};

export default UserRoleSelector;