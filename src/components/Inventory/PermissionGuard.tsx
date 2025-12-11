/**
 * 权限守卫组件
 * 基于用户权限控制组件访问
 */

import React from 'react';
import { Result, Button } from 'antd';
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionGuardProps } from '@/hooks/usePermissions';

// 权限守卫组件
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  role,
  roles,
  fallback = null,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole } = usePermissions();

  // 检查权限
  const hasAccess = React.useMemo(() => {
    // 检查角色权限
    if (role && !hasRole(role)) {
      return false;
    }

    // 检查多角色权限
    if (roles && roles.length > 0 && !roles.some(r => hasRole(r))) {
      return false;
    }

    // 检查单个权限
    if (permission && !hasPermission(permission)) {
      return false;
    }

    // 检查多权限（必须全部拥有）
    if (permissions && permissions.length > 0 && !hasAllPermissions(permissions)) {
      return false;
    }

    return true;
  }, [hasPermission, hasAllPermissions, hasRole, permission, permissions, role, roles]);

  // 如果有访问权限，渲染子组件
  if (hasAccess) {
    return <>{children}</>;
  }

  // 如果没有提供fallback，显示默认的无权限提示
  if (!fallback) {
    return (
      <Result
        status="403"
        title="访问被拒绝"
        subTitle="您没有权限访问此页面或功能"
        icon={<LockOutlined />}
        extra={
          <Button type="primary" href="/dashboard">
            返回首页
          </Button>
        }
      />
    );
  }

  return <>{fallback}</>;
};

// 高阶组件：包装组件以添加权限检查
export const withPermissionGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission?: string,
  requiredPermissions?: string[],
  requiredRole?: string,
  requiredRoles?: string[],
) => {
  return (props: P) => (
    <PermissionGuard
      permission={requiredPermission}
      permissions={requiredPermissions}
      role={requiredRole}
      roles={requiredRoles}
    >
      <WrappedComponent {...props} />
    </PermissionGuard>
  );
};

// 权限检查Hook
export const usePermissionGuard = (
  permission?: string,
  permissions?: string[],
  role?: string,
  roles?: string[],
) => {
  const { hasPermission, hasAllPermissions, hasRole } = usePermissions();

  const hasAccess = React.useMemo(() => {
    if (role && !hasRole(role)) return false;
    if (roles && roles.length > 0 && !roles.some(r => hasRole(r))) return false;
    if (permission && !hasPermission(permission)) return false;
    if (permissions && permissions.length > 0 && !hasAllPermissions(permissions)) return false;
    return true;
  }, [hasPermission, hasAllPermissions, hasRole, permission, permissions, role, roles]);

  return {
    hasAccess,
    canAccess: hasAccess,
    cannotAccess: !hasAccess,
  };
};

// 权限组件
export const ReadPermission: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permission="read" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const WritePermission: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permission="write" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const AdjustPermission: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permission="adjust" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const DeletePermission: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permission="delete" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const AdminPermission: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permission="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ExportPermission: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permission="export" fallback={fallback}>
    {children}
  </PermissionGuard>
);

// 组合权限组件
export const OperatorPermissions: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permissions={['read', 'write', 'adjust']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ManagerPermissions: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard permissions={['read', 'write', 'delete', 'adjust', 'export']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// 角色权限组件
export const ViewerRole: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard role="viewer" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const OperatorRole: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard roles={['operator', 'admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const AdminRole: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard role="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

// 警告权限组件（用于显示权限不足的提示）
export const PermissionWarning: React.FC<{ permission?: string; message?: string }> = ({
  permission,
  message,
}) => {
  const { hasPermission } = usePermissions();

  if (permission && hasPermission(permission)) {
    return null;
  }

  return (
    <Result
      status="warning"
      title="权限不足"
      subTitle={message || `您需要 ${permission} 权限才能执行此操作`}
      icon={<ExclamationCircleOutlined />}
    />
  );
};

// 条件权限渲染组件
export const ConditionalRender: React.FC<{
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, permissions, role, roles, children, fallback }) => {
  const { hasAccess } = usePermissionGuard(permission, permissions, role, roles);
  return <>{hasAccess ? children : fallback}</>;
};

export default PermissionGuard;