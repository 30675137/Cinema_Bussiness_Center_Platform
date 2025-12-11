/**
 * React Router 6 配置
 * 应用路由定义和路由守卫
 */

import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { Spin } from 'antd';
import { useUserStore } from '@/stores/userStore';

// 懒加载页面组件
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const ProductList = React.lazy(() => import('@/pages/product/ProductList'));
const InventoryManagePage = React.lazy(() => import('@/pages/inventory/InventoryManagePage'));
const PricingList = React.lazy(() => import('@/pages/pricing/PricingList'));
const ReviewList = React.lazy(() => import('@/pages/review/ReviewList'));

// 采购管理页面组件
const PurchaseOrderManagePage = React.lazy(() => import('@/pages/procurement/PurchaseOrderManagePage'));
const SupplierManagePage = React.lazy(() => import('@/pages/procurement/SupplierManagePage'));
const TransferManagePage = React.lazy(() => import('@/pages/procurement/TransferManagePage'));
const ReceivingManagePage = React.lazy(() => import('@/pages/procurement/receiving'));

// 布局组件
const AppLayout = React.lazy(() => import('@/components/layout/AppLayout'));
const LoginPage = React.lazy(() => import('@/pages/Login'));

/**
 * 路由守卫组件
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loginLoading } = useUserStore();
  const location = useLocation();

  if (loginLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // 保存当前路径，登录后跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * 公共路由（无需登录即可访问）
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();
  const location = useLocation();

  // 如果已登录，重定向到首页
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * 权限路由守卫
 */
const PermissionGuard: React.FC<{
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
}> = ({ children, requiredPermissions = [], requireAll = true }) => {
  const { hasPermission, hasPermissions, hasAnyPermission } = useUserStore();
  const navigate = useNavigate();

  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? hasPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    navigate('/unauthorized', { replace: true });
    return null;
  }

  return <>{children}</>;
};

/**
 * 加载组件
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spin size="large" tip="页面加载中..." />
  </div>
);

/**
 * 页面组件包装器（包含布局）
 */
const PageWrapper: React.FC<{
  children: React.ReactNode;
  title?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}> = ({ children, title, requiredPermissions, requireAll = true }) => {
  return (
    <PermissionGuard
      requiredPermissions={requiredPermissions}
      requireAll={requireAll}
    >
      <Suspense fallback={<LoadingFallback />}>
        <AppLayout title={title}>
          {children}
        </AppLayout>
      </Suspense>
    </PermissionGuard>
  );
};

/**
 * 路由配置
 */
const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        )
      },
      // 基础设置与主数据
      {
        path: 'basic-settings',
        children: [
          {
            path: 'org',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>组织/门店/仓库管理</div>
              </Suspense>
            )
          },
          {
            path: 'unit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>单位 & 换算规则管理</div>
              </Suspense>
            )
          },
          {
            path: 'dictionary',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>字典与规则配置</div>
              </Suspense>
            )
          },
          {
            path: 'permission',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>角色与权限管理</div>
              </Suspense>
            )
          },
          {
            path: 'approval',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>审批流配置</div>
              </Suspense>
            )
          }
        ]
      },
      // 商品管理 (MDM / PIM)
      {
        path: 'product',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProductList />
              </Suspense>
            )
          },
          {
            path: 'spu',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>SPU 管理</div>
              </Suspense>
            )
          },
          {
            path: 'sku',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>SKU 管理</div>
              </Suspense>
            )
          },
          {
            path: 'attribute',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>属性/规格/条码/单位设置</div>
              </Suspense>
            )
          },
          {
            path: 'status',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>商品状态/上下架管理</div>
              </Suspense>
            )
          },
          {
            path: 'content',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>内容编辑</div>
              </Suspense>
            )
          },
          {
            path: 'material',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>素材库管理</div>
              </Suspense>
            )
          },
          {
            path: 'channel',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>渠道映射字段管理</div>
              </Suspense>
            )
          },
          {
            path: 'publish',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>内容发布/审核/历史版本管理</div>
              </Suspense>
            )
          }
        ]
      },
      // BOM / 配方 & 成本管理
      {
        path: 'bom',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>BOM/配方管理概览</div>
              </Suspense>
            )
          },
          {
            path: 'material',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>原料库 / 物料主数据</div>
              </Suspense>
            )
          },
          {
            path: 'config',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>BOM/配方配置</div>
              </Suspense>
            )
          },
          {
            path: 'unit-conversion',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>单位换算 / 损耗率配置</div>
              </Suspense>
            )
          },
          {
            path: 'cost',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>成本 / 毛利预估与校验</div>
              </Suspense>
            )
          },
          {
            path: 'version',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>BOM/配方版本管理 / 生效时间控制</div>
              </Suspense>
            )
          }
        ]
      },
      // 场景包/套餐管理
      {
        path: 'scenario-package',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>场景包/套餐管理概览</div>
              </Suspense>
            )
          },
          {
            path: 'template',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>场景包模板管理</div>
              </Suspense>
            )
          },
          {
            path: 'resource',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>适用资源/影厅/门店规则</div>
              </Suspense>
            )
          },
          {
            path: 'content',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>内容组合</div>
              </Suspense>
            )
          },
          {
            path: 'addon',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>加购策略管理</div>
              </Suspense>
            )
          },
          {
            path: 'pricing',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>定价策略 / 门店价 / 时段价 配置</div>
              </Suspense>
            )
          },
          {
            path: 'version',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>场景包版本管理 / 生效控制</div>
              </Suspense>
            )
          }
        ]
      },
      // 价格体系管理
      {
        path: 'pricing',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PricingList />
              </Suspense>
            )
          },
          {
            path: 'price-list',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>价目表管理</div>
              </Suspense>
            )
          },
          {
            path: 'review',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>价格审核与生效 / 回滚</div>
              </Suspense>
            )
          },
          {
            path: 'rules',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>价格规则配置</div>
              </Suspense>
            )
          }
        ]
      },
      // 采购与入库管理
      {
        path: 'procurement',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>采购与入库管理概览</div>
              </Suspense>
            )
          },
          {
            path: 'supplier',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SupplierManagePage />
                  </Suspense>
                )
              },
              {
                path: 'create',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SupplierManagePage />
                  </Suspense>
                )
              },
              {
                path: ':supplierId',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SupplierManagePage />
                  </Suspense>
                )
              },
              {
                path: ':supplierId/edit',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SupplierManagePage />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: 'purchase-order',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PurchaseOrderManagePage />
                  </Suspense>
                )
              },
              {
                path: 'create',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PurchaseOrderManagePage />
                  </Suspense>
                )
              },
              {
                path: ':orderId',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PurchaseOrderManagePage />
                  </Suspense>
                )
              },
              {
                path: ':orderId/edit',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PurchaseOrderManagePage />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: 'receiving',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ReceivingManagePage />
              </Suspense>
            )
          },
          {
            path: 'transfer',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <TransferManagePage />
                  </Suspense>
                )
              },
              {
                path: 'create',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <TransferManagePage />
                  </Suspense>
                )
              },
              {
                path: ':transferId',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <TransferManagePage />
                  </Suspense>
                )
              },
              {
                path: ':transferId/edit',
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <TransferManagePage />
                  </Suspense>
                )
              }
            ]
          }
        ]
      },
      // 库存与仓店库存管理
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InventoryManagePage />
              </Suspense>
            )
          },
          {
            path: 'create',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InventoryManagePage />
              </Suspense>
            )
          },
          {
            path: 'edit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InventoryManagePage />
              </Suspense>
            )
          },
          {
            path: ':inventoryId',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InventoryManagePage />
              </Suspense>
            )
          },
          {
            path: ':inventoryId/edit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InventoryManagePage />
              </Suspense>
            )
          },
          {
            path: 'ledger',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>库存台账查看</div>
              </Suspense>
            )
          },
          {
            path: 'operation',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>出入库操作</div>
              </Suspense>
            )
          },
          {
            path: 'check',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>盘点管理</div>
              </Suspense>
            )
          },
          {
            path: 'allocation',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>库存预占管理</div>
              </Suspense>
            )
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>库存数据分析</div>
              </Suspense>
            )
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>库存设置</div>
              </Suspense>
            )
          }
        ]
      },
      // 档期/排期/资源预约管理
      {
        path: 'scheduling',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>档期/排期/资源预约管理概览</div>
              </Suspense>
            )
          },
          {
            path: 'hall',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>影厅资源管理</div>
              </Suspense>
            )
          },
          {
            path: 'gantt',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>甘特图排期</div>
              </Suspense>
            )
          },
          {
            path: 'calendar',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>日历排期</div>
              </Suspense>
            )
          },
          {
            path: 'conflict',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>冲突校验</div>
              </Suspense>
            )
          }
        ]
      },
      // 订单与履约管理
      {
        path: 'order-management',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>订单与履约管理概览</div>
              </Suspense>
            )
          },
          {
            path: 'list',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>订单列表</div>
              </Suspense>
            )
          },
          {
            path: 'confirm',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>二次确认队列</div>
              </Suspense>
            )
          },
          {
            path: 'verification',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>核销管理</div>
              </Suspense>
            )
          },
          {
            path: 'refund',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>退款管理</div>
              </Suspense>
            )
          }
        ]
      },
      // 运营 & 报表 / 指标看板
      {
        path: 'operations-reports',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ReviewList />
              </Suspense>
            )
          },
          {
            path: 'efficiency',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>上新/发布时效报表</div>
              </Suspense>
            )
          },
          {
            path: 'data-quality',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>商品数据质量报表</div>
              </Suspense>
            )
          },
          {
            path: 'stock-accuracy',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>库存准确性 / 盘点差异报表</div>
              </Suspense>
            )
          },
          {
            path: 'sales-analysis',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>销售/场景包表现分析</div>
              </Suspense>
            )
          },
          {
            path: 'resource-utilization',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>资源利用率 / 影厅利用率 / 排期使用率报表</div>
              </Suspense>
            )
          },
          {
            path: 'summary',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>库存 & 订单 & 收入 & 成本汇总报表</div>
              </Suspense>
            )
          }
        ]
      },
      // 系统管理 / 设置 /权限
      {
        path: 'system',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>系统管理概览</div>
              </Suspense>
            )
          },
          {
            path: 'user',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>系统用户管理</div>
              </Suspense>
            )
          },
          {
            path: 'audit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>审计日志查询</div>
              </Suspense>
            )
          },
          {
            path: 'config',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>参数与规则配置</div>
              </Suspense>
            )
          },
          {
            path: 'import-export',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <div>数据导入导出</div>
              </Suspense>
            )
          }
        ]
      }
    ]
  },
  {
    path: '/unauthorized',
    element: (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h1>
            <p className="text-gray-600">您没有访问此页面的权限，请联系管理员。</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">页面不存在</h1>
            <p className="text-gray-600">您访问的页面不存在或已被移除。</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }
]);

/**
 * 路由提供者组件
 */
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

/**
 * 导出路由配置
 */
export { router };
export default AppRouter;

/**
 * 路由守卫Hook
 */
export const useRouteGuard = () => {
  const { isAuthenticated, hasPermission } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const checkAccess = (requiredPermissions: string[]) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return false;
    }

    if (requiredPermissions.length > 0) {
      const hasAccess = requiredPermissions.some(permission => hasPermission(permission));
      if (!hasAccess) {
        navigate('/unauthorized');
        return false;
      }
    }

    return true;
  };

  return { checkAccess };
};

/**
 * 导出路由相关工具函数
 */
export const routeUtils = {
  /**
   * 生成导航路径
   */
  createPath: (base: string, params: Record<string, string | number> = {}): string => {
    let path = base;
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, String(value));
    });
    return path;
  },

  /**
   * 获取当前路由参数
   */
  useParams: <T extends Record<string, string> = Record<string, string>>() => {
    // 这里可以扩展为从URL参数中提取数据
    return {} as T;
  },

  /**
   * 路由权限检查
   */
  hasRouteAccess: (requiredPermissions: string[]): boolean => {
    // 这里需要在组件中使用，因为需要访问store
    return true;
  }
};