import React from 'react';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { usePermissions, Permission } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  /**
   * 需要的权限（满足任意一个即可）
   */
  permissions: Permission | Permission[];
  /**
   * 是否需要所有权限（默认false，满足任意一个即可）
   */
  requireAll?: boolean;
  /**
   * 无权限时的回退内容
   */
  fallback?: React.ReactNode;
  /**
   * 子组件
   */
  children: React.ReactNode;
}

/**
 * 权限守卫组件
 * 根据用户权限控制组件的显示和隐藏
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions: requiredPermissions,
  requireAll = false,
  fallback,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // 检查权限
  const hasAccess = React.useMemo(() => {
    const permissionsArray = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    if (requireAll) {
      return hasAllPermissions(...permissionsArray);
    } else {
      return hasAnyPermission(...permissionsArray);
    }
  }, [requiredPermissions, requireAll, hasAnyPermission, hasAllPermissions]);

  // 如果有权限，直接渲染子组件
  if (hasAccess) {
    return <>{children}</>;
  }

  // 如果提供了自定义fallback，使用它
  if (fallback) {
    return <>{fallback}</>;
  }

  // 默认的无权限提示
  return (
    <Result
      status="403"
      icon={<LockOutlined />}
      title="权限不足"
      subTitle="您没有访问此功能的权限，请联系管理员"
    />
  );
};

/**
 * 权限隐藏组件（无权限时不渲染任何内容）
 */
export const PermissionHide: React.FC<Omit<PermissionGuardProps, 'fallback'>> = ({
  permissions,
  requireAll = false,
  children,
}) => {
  return (
    <PermissionGuard
      permissions={permissions}
      requireAll={requireAll}
      fallback={null}
    >
      {children}
    </PermissionGuard>
  );
};

export default PermissionGuard;
