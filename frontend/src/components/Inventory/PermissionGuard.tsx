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
  // 暂时禁用所有权限检查，直接放行
  // TODO: 后续统一添加权限管理 (spec 待定)
  return <>{children}</>;

  /* 原权限检查逻辑 - 已禁用
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // 开发环境下直接放行，方便测试
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

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

  // 默认直接渲染内容（移除权限提示）
  return <>{children}</>;
  */
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
    <PermissionGuard permissions={permissions} requireAll={requireAll} fallback={null}>
      {children}
    </PermissionGuard>
  );
};

export default PermissionGuard;
