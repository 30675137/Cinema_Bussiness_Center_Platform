/**
 * @spec D001-menu-panel
 * 12个业务模块的静态配置
 * 按照泳道架构分组
 */
import {
  ControlOutlined,
  ShoppingOutlined,
  ReconciliationOutlined,
  GoldOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ModuleCard } from '@/types/module';

/**
 * 泳道分组定义
 */
export const SWIMLANE_GROUPS = [
  { id: 'foundation', name: '平台基础', order: 1 },
  { id: 'master-data', name: '主数据管理', order: 2 },
  { id: 'transaction', name: '交易执行', order: 3 },
  { id: 'channel-marketing', name: '渠道营销', order: 4 },
  { id: 'support', name: '支撑服务', order: 5 },
] as const;

/**
 * 12个业务模块配置
 * 按照泳道架构分组排列
 */
export const BUSINESS_MODULES: ModuleCard[] = [
  // 泳道 1: 平台基础
  {
    id: 'basic-settings',
    name: '基础设置与主数据',
    description: '组织架构、单位管理、字典配置',
    icon: ControlOutlined,
    defaultPath: '/basic-settings/organization',
    order: 1,
    status: 'normal',
    swimlane: 'foundation',
    functionLinks: [
      { name: '组织/门店/仓库管理', path: '/basic-settings/organization', enabled: true },
      { name: '单位 & 换算规则', path: '/basic-settings/units', enabled: true },
      { name: '字典与规则配置', path: '/basic-settings/dictionary', enabled: true },
    ],
  },
  {
    id: 'system',
    name: '系统管理/设置/权限',
    description: '用户管理、权限配置、系统设置',
    icon: SettingOutlined,
    defaultPath: '/system/users',
    order: 2,
    status: 'normal',
    swimlane: 'foundation',
    functionLinks: [
      { name: '用户管理', path: '/system/users', enabled: true },
      { name: '角色权限', path: '/system/roles', enabled: true },
      { name: '系统设置', path: '/system/settings', enabled: true },
    ],
  },

  // 泳道 2: 主数据管理
  {
    id: 'products',
    name: '商品管理 (MDM/PIM)',
    description: 'SPU/SKU管理、商品主数据',
    icon: ShoppingOutlined,
    defaultPath: '/products/spu',
    order: 3,
    status: 'normal',
    swimlane: 'master-data',
    functionLinks: [
      { name: 'SPU 管理', path: '/products/spu', enabled: true },
      { name: 'SKU 管理', path: '/products/sku', enabled: true },
      { name: '商品分类', path: '/products/category', enabled: true },
      { name: '品牌管理', path: '/products/brand', enabled: true },
    ],
  },
  {
    id: 'bom',
    name: 'BOM/配方&成本管理',
    description: '物料清单、配方、成本核算',
    icon: ReconciliationOutlined,
    defaultPath: '/bom/list',
    order: 4,
    status: 'normal',
    swimlane: 'master-data',
    functionLinks: [
      { name: 'BOM 列表', path: '/bom/list', enabled: true },
      { name: '配方管理', path: '/bom/formula', enabled: true },
      { name: '成本核算', path: '/bom/cost', enabled: true },
    ],
  },
  {
    id: 'scheduling',
    name: '档期/排期/资源预约',
    description: '影厅档期、资源预约、排期管理',
    icon: CalendarOutlined,
    defaultPath: '/scheduling/calendar',
    order: 5,
    status: 'normal',
    swimlane: 'master-data',
    functionLinks: [
      { name: '档期日历', path: '/scheduling/calendar', enabled: true },
      { name: '资源预约', path: '/scheduling/reservation', enabled: true },
      { name: '排期管理', path: '/scheduling/schedule', enabled: true },
    ],
  },

  // 泳道 3: 交易执行
  {
    id: 'orders',
    name: '订单与履约管理',
    description: '商品订单、饮品订单、履约管理',
    icon: FileTextOutlined,
    defaultPath: '/orders/list',
    order: 6,
    status: 'normal',
    swimlane: 'transaction',
    functionLinks: [
      { name: '订单列表', path: '/orders/list', enabled: true },
      { name: '履约管理', path: '/orders/fulfillment', enabled: true },
      { name: '退款管理', path: '/orders/refund', enabled: true },
    ],
  },
  {
    id: 'inventory',
    name: '库存&仓店库存管理',
    description: '库存查询、调整、盘点',
    icon: DatabaseOutlined,
    defaultPath: '/inventory/query',
    order: 7,
    status: 'normal',
    swimlane: 'transaction',
    functionLinks: [
      { name: '库存查询', path: '/inventory/query', enabled: true },
      { name: '库存调整', path: '/inventory/adjustment', enabled: true },
      { name: '库存盘点', path: '/inventory/stocktaking', enabled: true },
      { name: '仓店管理', path: '/inventory/stores', enabled: true },
    ],
  },
  {
    id: 'procurement',
    name: '采购与入库管理',
    description: '采购订单、收货入库、供应商管理',
    icon: ShoppingCartOutlined,
    defaultPath: '/procurement/orders',
    order: 8,
    status: 'normal',
    swimlane: 'transaction',
    functionLinks: [
      { name: '采购订单', path: '/procurement/orders', enabled: true },
      { name: '收货入库', path: '/procurement/receiving', enabled: true },
      { name: '供应商管理', path: '/procurement/suppliers', enabled: true },
    ],
  },

  // 泳道 4: 渠道营销
  {
    id: 'channels',
    name: '渠道商品配置',
    description: '渠道商品、配置管理',
    icon: CoffeeOutlined,
    defaultPath: '/channels/products',
    order: 9,
    status: 'normal',
    swimlane: 'channel-marketing',
    functionLinks: [
      { name: '渠道商品', path: '/channels/products', enabled: true },
      { name: '渠道配置', path: '/channels/config', enabled: true },
      { name: '渠道授权', path: '/channels/auth', enabled: true },
    ],
  },
  {
    id: 'packages',
    name: '场景包/套餐管理',
    description: '活动场景包、套餐配置',
    icon: GoldOutlined,
    defaultPath: '/packages/list',
    order: 10,
    status: 'normal',
    swimlane: 'channel-marketing',
    functionLinks: [
      { name: '场景包列表', path: '/packages/list', enabled: true },
      { name: '套餐配置', path: '/packages/combo', enabled: true },
      { name: '活动管理', path: '/packages/activity', enabled: true },
    ],
  },
  {
    id: 'pricing',
    name: '价格体系管理',
    description: '价目表、价格规则、定价策略',
    icon: DollarOutlined,
    defaultPath: '/pricing/list',
    order: 11,
    status: 'normal',
    swimlane: 'channel-marketing',
    functionLinks: [
      { name: '价目表管理', path: '/pricing/list', enabled: true },
      { name: '价格规则', path: '/pricing/rules', enabled: true },
      { name: '定价策略', path: '/pricing/strategy', enabled: true },
    ],
  },

  // 泳道 5: 支撑服务
  {
    id: 'reports',
    name: '运营&报表/指标看板',
    description: '数据分析、运营报表、指标监控',
    icon: BarChartOutlined,
    defaultPath: '/reports/overview',
    order: 12,
    status: 'normal',
    swimlane: 'support',
    functionLinks: [
      { name: '数据概览', path: '/reports/overview', enabled: true },
      { name: '销售报表', path: '/reports/sales', enabled: true },
      { name: '库存报表', path: '/reports/inventory', enabled: true },
      { name: '指标看板', path: '/reports/dashboard', enabled: true },
    ],
  },
];
