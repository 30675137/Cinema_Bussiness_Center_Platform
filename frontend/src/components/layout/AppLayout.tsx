import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Breadcrumb, Space, Badge, Tooltip } from 'antd';
import type { MenuProps as AntdMenuProps } from 'antd/es/menu';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AuditOutlined,
  DatabaseOutlined,
  ControlOutlined,
  ReconciliationOutlined,
  GoldOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  StockOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore, useCurrentUser, useSidebarCollapsed, useBreadcrumbs } from '@/stores/appStore';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarCollapsed = useSidebarCollapsed();
  const currentUser = useCurrentUser();
  const breadcrumbs = useBreadcrumbs();
  const { toggleSidebar } = useAppStore();

  // 菜单项配置 - 影院业务中台完整菜单
  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '工作台',
    },
    {
      key: '/basic-settings',
      icon: <ControlOutlined />,
      label: '基础设置与主数据',
      children: [
        {
          key: '/basic-settings/organization',
          label: '组织/门店/仓库管理',
        },
        {
          key: '/basic-settings/units',
          label: '单位 & 换算规则管理',
        },
        {
          key: '/basic-settings/dictionary',
          label: '字典与规则配置',
        },
        {
          key: '/basic-settings/roles',
          label: '角色与权限管理',
        },
        {
          key: '/basic-settings/approval',
          label: '审批流配置',
        },
      ],
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理 (MDM/PIM)',
      children: [
        {
          key: '/mdm-pim/category',
          label: '类目管理',
        },
        {
          key: '/mdm-pim/brands',
          label: 'P001-品牌管理',
        },
        {
          key: '/mdm-pim/attribute',
          label: '属性字典管理',
        },
        {
          key: '/products/spu',
          label: 'P001-SPU 管理',
        },
        
        {
          key: '/products/sku',
          label: 'P001-SKU 管理',
        },
        {
          key: '/products/attributes',
          label: '属性/规格/条码设置',
        },
        {
          key: '/products/status',
          label: '商品状态/上下架管理',
        },
        {
          key: '/products/content',
          label: '内容编辑',
        },
        {
          key: '/products/media',
          label: '素材库管理',
        },
        {
          key: '/products/channel-mapping',
          label: '渠道映射字段管理',
        },
        {
          key: '/products/publish',
          label: '内容发布/审核/版本管理',
        },
      ],
    },
    {
      key: '/bom',
      icon: <ReconciliationOutlined />,
      label: 'BOM/配方 & 成本管理',
      children: [
        {
          key: '/bom/materials',
          label: '原料库/物料主数据',
        },
        {
          key: '/bom/formula',
          label: 'BOM/配方配置',
        },
        {
          key: '/bom/conversion',
          label: '单位换算/损耗率配置',
        },
        {
          key: '/bom/cost',
          label: '成本/毛利预估与校验',
        },
        {
          key: '/bom/version',
          label: 'BOM/配方版本管理',
        },
      ],
    },
    {
      key: '/scenario-package',
      icon: <GoldOutlined />,
      label: '场景包/套餐管理',
      children: [
        {
          key: '/scenario-packages',
          label: '17-场景包模板管理',
        },
        {
          key: '/scenario-package/template',
          label: '场景包模板管理',
        },
        {
          key: '/scenario-package/resources',
          label: '适用资源/影厅/门店规则',
        },
        {
          key: '/scenario-package/content',
          label: '内容组合配置',
        },
        {
          key: '/scenario-package/add-on',
          label: '加购策略管理',
        },
        {
          key: '/scenario-package/pricing',
          label: '定价策略配置',
        },
        {
          key: '/scenario-package/package-price',
          label: '包装价格 & 一口价设定',
        },
        {
          key: '/scenario-package/version',
          label: '场景包版本管理',
        },
      ],
    },
    {
      key: '/pricing',
      icon: <DollarOutlined />,
      label: '价格体系管理',
      children: [
        {
          key: '/pricing/price-list',
          label: '价目表管理',
        },
        {
          key: '/pricing/audit',
          label: '价格审核与生效',
        },
        {
          key: '/pricing/rules',
          label: '价格规则配置',
        },
      ],
    },
    {
      key: '/procurement',
      icon: <ShoppingCartOutlined />,
      label: '采购与入库管理',
      children: [
        {
          key: '/purchase-management/suppliers',
          label: '供应商管理',
        },
        {
          key: '/purchase-management/orders',
          label: '采购订单 (PO)',
        },
        {
          key: '/purchase-management/orders/list',
          label: '采购订单列表',
        },
        {
          key: '/purchase-management/receipts/create',
          label: '新建收货入库',
        },
        {
          key: '/purchase-management/receipts',
          label: '到货验收 & 收货入库',
        },
        {
          key: '/procurement/exceptions',
          label: '异常/短缺/拒收/报损登记',
        },
        {
          key: '/procurement/history',
          label: '入库单历史/查询',
        },
        {
          key: '/procurement/transfer',
          label: '调拨管理',
        },
      ],
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: '库存 & 仓店库存管理',
      children: [
        {
          key: '/inventory/query',
          label: 'P003-库存查询',
        },
        {
          key: '/inventory/ledger',
          label: 'P004-库存台账查看',
        },
        {
          key: '/inventory/approvals',
          label: 'P004-库存调整审批',
        },
        
        {
          key: '/inventory/operations',
          label: '入库/出库/报损/退库操作',
        },
        {
          key: '/inventory/transfer',
          label: '调拨管理',
        },
        {
          key: '/inventory/stocktaking',
          label: '盘点模块',
        },
        {
          key: '/inventory/reservation',
          label: '库存预占/释放管理',
        },
        {
          key: '/inventory/movements',
          label: '库存变动日志/审计',
        },
      ],
    },
    {
      key: '/schedule',
      icon: <CalendarOutlined />,
      label: '档期/排期/资源预约',
      children: [
        {
          key: '/stores',
          label: '14-门店管理',
        },
        // 016-store-reservation-settings: 已整合到门店管理页面，移除独立菜单项
        // {
        //   key: '/store-reservation-settings',
        //   label: '门店预约设置',
        // },
        {
          key: '/activity-types',
          label: '活动类型管理',
        },
        {
          key: '/schedule/hall-resources',
          label: '14-影厅资源管理',
        },
        {
          key: '/schedule/gantt',
          label: '甘特图/日历视图排期',
        },
        {
          key: '/schedule/create',
          label: '新建排期',
        },
        {
          key: '/schedule/conflict',
          label: '冲突校验/占用规则',
        },
        {
          key: '/schedule/status',
          label: '排期状态管理',
        },
        {
          key: '/schedule/publish',
          label: '渠道发布/同步',
        },
        {
          key: '/schedule/changes',
          label: '排期变更/取消/改期',
        },
      ],
    },
    {
      key: '/beverage',
      icon: <CoffeeOutlined />,
      label: 'O003-饮品订单管理',
      children: [
        {
          key: '/beverage/list',
          label: 'US3-饮品配置管理',
        },
        {
          key: '/beverage/orders',
          label: 'US2-饮品订单/出品',
        },
      ],
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: 'O-订单与履约管理',
      children: [
        {
          key: '/orders/list',
          label: 'U004-订单列表/状态查看',
        },
        {
          key: '/orders/confirmation',
          label: '二次确认队列',
        },
        {
          key: '/orders/verification',
          label: '核销码/到店核销',
        },
        {
          key: '/orders/deduction',
          label: '库存扣减/BOM扣原料',
        },
        {
          key: '/orders/refund',
          label: '退款/改期/取消/回滚',
        },
        {
          key: '/orders/exceptions',
          label: '异常订单/审计日志',
        },
        {
          key: '/reservation-orders',
          label: 'U001-预约单管理',
        },
      ],
    },
    {
      key: '/operations',
      icon: <BarChartOutlined />,
      label: '运营 & 报表/指标看板',
      children: [
        {
          key: '/operations/launch-report',
          label: '上新/发布时效报表',
        },
        {
          key: '/operations/quality-report',
          label: '商品数据质量报表',
        },
        {
          key: '/operations/inventory-accuracy',
          label: '库存准确性/盘点差异报表',
        },
        {
          key: '/operations/sales-analysis',
          label: '销售/场景包表现分析',
        },
        {
          key: '/operations/resource-utilization',
          label: '资源利用率/影厅利用率',
        },
        {
          key: '/operations/summary',
          label: '库存&订单&收入&成本汇总',
        },
      ],
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理/设置/权限',
      children: [
        {
          key: '/system/users',
          label: '系统用户管理与角色权限',
        },
        {
          key: '/system/audit-log',
          label: '审计日志/操作日志查询',
        },
        {
          key: '/system/parameters',
          label: '参数与规则配置',
        },
        {
          key: '/system/import-export',
          label: '数据导入导出',
        },
        {
          key: '/system/notifications',
          label: '消息/告警管理',
        },
      ],
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => handleLogout(),
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    return [pathname];
  };

  // 获取当前展开的菜单项
  const getOpenKeys = () => {
    const pathname = location.pathname;
    const openKeys: string[] = [];

    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          pathname.startsWith(child.key)
        );
        if (hasActiveChild) {
          openKeys.push(item.key);
        }
      }
    });

    return openKeys;
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理退出登录
  const handleLogout = () => {
    // 清除用户信息
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // 渲染面包屑
  const renderBreadcrumb = () => {
    // 安全检查：确保 breadcrumbs 存在且是数组
    if (!breadcrumbs || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
      return null;
    }

    return (
      <Breadcrumb
        style={{ margin: '16px 0' }}
        items={breadcrumbs.map((item, index) => ({
          key: index,
          title: item.title,
          ...(item.path && { href: item.path }),
        }))}
      />
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 64,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <AppstoreOutlined
            style={{
              fontSize: '24px',
              color: '#1890ff',
              marginRight: sidebarCollapsed ? 0 : '12px',
            }}
          />
          {!sidebarCollapsed && (
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              影院业务中台
            </span>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* 主内容区域 */}
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 80 : 256,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* 顶部栏 */}
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {/* 左侧：折叠按钮 */}
          <Space>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Space>

          {/* 右侧：用户信息和通知 */}
          <Space>
            {/* 通知 */}
            <Tooltip title="系统通知">
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    fontSize: '16px',
                  }}
                />
              </Badge>
            </Tooltip>

            {/* 用户信息 */}
            <Dropdown
              menu={{ items: userMenuItems as AntdMenuProps['items'] }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={currentUser?.avatar}
                />
                <span>{currentUser?.name || '用户'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: '16px',
            padding: '16px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 64px - 32px)',
          }}
        >
          {/* 面包屑 */}
          {renderBreadcrumb()}

          {/* 页面内容 */}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;