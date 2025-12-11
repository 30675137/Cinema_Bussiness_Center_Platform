import React from 'react';
import { Select, Tag, Space, Typography, Divider } from 'antd';
import { UserOutlined, SafetyOutlined, CrownOutlined } from '@ant-design/icons';
import {
  usePermissions,
  UserRole,
  ROLE_OPTIONS,
  getPermissionLabel,
} from '@/hooks/usePermissions';

const { Text } = Typography;

/**
 * 用户角色选择器组件
 * 用于演示权限系统，允许用户切换不同角色
 */
export const UserRoleSelector: React.FC = () => {
  const { currentRole, setRole, permissions } = usePermissions();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <CrownOutlined />;
      case UserRole.OPERATOR:
        return <SafetyOutlined />;
      case UserRole.VIEWER:
      default:
        return <UserOutlined />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    const option = ROLE_OPTIONS.find(o => o.value === role);
    return option?.color || 'default';
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text strong>当前角色:</Text>
        <Select
          value={currentRole}
          onChange={setRole}
          style={{ width: 200 }}
          options={ROLE_OPTIONS.map(option => ({
            value: option.value,
            label: (
              <Space>
                {getRoleIcon(option.value)}
                {option.label}
              </Space>
            ),
          }))}
        />
        <Tag color={getRoleColor(currentRole)} icon={getRoleIcon(currentRole)}>
          {ROLE_OPTIONS.find(o => o.value === currentRole)?.label}
        </Tag>
      </div>

      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {ROLE_OPTIONS.find(o => o.value === currentRole)?.description}
        </Text>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          当前权限 ({permissions.length}):
        </Text>
        <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {permissions.map(permission => (
            <Tag key={permission} color="blue">
              {getPermissionLabel(permission)}
            </Tag>
          ))}
        </div>
      </div>
    </Space>
  );
};

export default UserRoleSelector;
