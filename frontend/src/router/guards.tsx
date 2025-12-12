/**
 * 路由守卫
 * 提供基于权限的路由访问控制
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { permissionService } from '@/services/permissionService';
import type { PermissionCheckResult } from '@/types';

/**
 * 路由守卫组件Props
 */
export interface PermissionGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需权限列表 */
  requiredPermissions?: string[];
  /** 所需角色列表 */
  requiredRoles?: string[];
  /** 是否严格模式（需要所有权限） */
  strict?: boolean;
  /** 无权限时重定向路径 */
  redirectTo?: string;
  /** 自定义无权限组件 */
  fallback?: React.ComponentType<{ checkResult: PermissionCheckResult }>;
}

/**
 * 权限守卫组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  strict = true,
  redirectTo = '/unauthorized',
  fallback: FallbackComponent,
}) => {
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // 检查是否已认证
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查用户是否激活
  if (!user.isActive) {
    return <Navigate to="/account-disabled" replace />;
  }

  // 检查角色权限
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = strict
      ? requiredRoles.every(role => permissionService.hasRole(user, role))
      : requiredRoles.some(role => permissionService.hasRole(user, role));

    if (!hasRequiredRoles) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // 检查功能权限
  if (requiredPermissions.length > 0) {
    const permissionResult = permissionService.checkPermissions(user, requiredPermissions);

    if (!permissionResult.hasAccess) {
      // 如果提供了自定义无权限组件，则使用它
      if (FallbackComponent) {
        return <FallbackComponent checkResult={permissionResult} />;
      }

      // 否则重定向到默认页面
      return <Navigate to={redirectTo} state={{
        from: location,
        reason: 'insufficient_permissions',
        missingPermissions: permissionResult.missingPermissions
      }} replace />;
    }
  }

  // 通过所有检查，渲染子组件
  return <>{children}</>;
};

/**
 * 高阶组件：为组件添加权限守卫
 */
export const withPermissionGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PermissionGuardProps, 'children'> = {}
) => {
  return React.memo((props: P) => (
    <PermissionGuard {...options}>
      <Component {...props} />
    </PermissionGuard>
  ));
};

/**
 * Hook: 检查当前路由是否可访问
 */
export const useRoutePermission = (requiredPermissions: string[] = []) => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const checkResult = React.useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        canAccess: false,
        reason: 'not_authenticated',
        checkResult: {
          hasAccess: false,
          requiredPermissions,
          userPermissions: [],
          missingPermissions: requiredPermissions
        }
      };
    }

    if (!user.isActive) {
      return {
        canAccess: false,
        reason: 'account_disabled',
        checkResult: {
          hasAccess: false,
          requiredPermissions,
          userPermissions: user.permissions,
          missingPermissions: requiredPermissions
        }
      };
    }

    const result = permissionService.checkPermissions(user, requiredPermissions);

    return {
      canAccess: result.hasAccess,
      reason: result.hasAccess ? 'allowed' : 'insufficient_permissions',
      checkResult: result
    };
  }, [user, isAuthenticated, requiredPermissions]);

  return checkResult;
};

/**
 * Hook: 获取基于权限的路由配置
 */
export const usePermissionRoutes = (routes: any[]) => {
  const user = useUserStore((state) => state.user);

  return React.useMemo(() => {
    if (!user) {
      return [];
    }

    return routes.filter(route => {
      // 如果路由没有权限要求，直接通过
      if (!route.requiredPermissions || route.requiredPermissions.length === 0) {
        return true;
      }

      // 检查权限
      return permissionService.hasPermissions(user, route.requiredPermissions);
    });
  }, [user, routes]);
};

/**
 * 默认无权限页面组件
 */
export const DefaultUnauthorizedPage: React.FC<{ checkResult: PermissionCheckResult }> = ({
  checkResult
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
        <p className="text-gray-600 mb-4">
          您没有访问此页面的权限。
        </p>

        {checkResult.missingPermissions.length > 0 && (
          <div className="mb-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">缺少以下权限：</p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              {checkResult.missingPermissions.map((permission, index) => (
                <li key={index}>{permission}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            返回上一页
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            回到首页
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 路由配置守卫函数
 */
export const createGuardedRoutes = (routes: any[], options: {
  defaultFallback?: React.ComponentType<{ checkResult: PermissionCheckResult }>;
  defaultRedirect?: string;
} = {}) => {
  return routes.map(route => {
    if (route.requiredPermissions && route.requiredPermissions.length > 0) {
      return {
        ...route,
        element: (
          <PermissionGuard
            requiredPermissions={route.requiredPermissions}
            requiredRoles={route.requiredRoles}
            strict={route.strict}
            redirectTo={route.redirectTo || options.defaultRedirect}
            fallback={route.fallback || options.defaultFallback}
          >
            {route.element}
          </PermissionGuard>
        )
      };
    }
    return route;
  });
};

export default {
  PermissionGuard,
  withPermissionGuard,
  useRoutePermission,
  usePermissionRoutes,
  DefaultUnauthorizedPage,
  createGuardedRoutes
};