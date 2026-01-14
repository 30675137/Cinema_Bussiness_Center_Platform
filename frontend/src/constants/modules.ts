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
    status: 'normal', // ✅ API已完成: StoreQueryController, UnitController, UnitConversionController
    swimlane: 'foundation',
    functionLinks: [
      { name: '组织/门店/仓库管理', path: '/basic-settings/organization', enabled: true }, // ✅ StoreQueryController
      { name: '单位 & 换算规则管理', path: '/basic-settings/units', enabled: true }, // ✅ UnitController, UnitConversionController
      { name: '字典与规则配置', path: '/basic-settings/dictionary', enabled: false }, // ❌ 未开发
      { name: '角色与权限管理', path: '/basic-settings/roles', enabled: false }, // ❌ 未开发
    ],
  },
  {
    id: 'system',
    name: '系统管理/设置/权限',
    description: '用户管理、权限配置、系统设置',
    icon: SettingOutlined,
    defaultPath: '/system/users',
    order: 2,
    status: 'developing', // ❌ API未完成: 无UserController, 无RoleController
    swimlane: 'foundation',
    functionLinks: [
      { name: '用户管理', path: '/system/users', enabled: false }, // ❌ 未开发
      { name: '角色权限', path: '/system/roles', enabled: false }, // ❌ 未开发
      { name: '系统设置', path: '/system/settings', enabled: false }, // ❌ 未开发
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
    status: 'normal', // ✅ API已完成: SpuController, SkuController, BrandController, CategoryController
    swimlane: 'master-data',
    functionLinks: [
      { name: 'P001-SPU 管理', path: '/products/spu', enabled: true }, // ✅ SpuController
      { name: 'P001-SKU 管理', path: '/products/sku', enabled: true }, // ✅ SkuController
      { name: '类目管理', path: '/mdm-pim/category', enabled: true }, // ✅ CategoryController
      { name: 'B001-品牌管理', path: '/mdm-pim/brands', enabled: true }, // ✅ BrandController
    ],
  },
  {
    id: 'bom',
    name: 'BOM/配方&成本管理',
    description: '物料清单、配方、成本核算、原料库',
    icon: ReconciliationOutlined,
    defaultPath: '/bom/materials',
    order: 4,
    status: 'normal', // ✅ API已完成: BomController, MaterialController
    swimlane: 'master-data',
    functionLinks: [
      { name: '原料库/物料主数据', path: '/bom/materials', enabled: true }, // ✅ MaterialController
      { name: 'BOM/配方配置', path: '/bom/formula', enabled: true }, // ✅ BomController
      { name: '单位换算/损耗率配置', path: '/bom/conversion', enabled: true }, // ✅ UnitConversionController
      { name: '成本/毛利预估与校验', path: '/bom/cost', enabled: false }, // ❌ 未开发
    ],
  },
  {
    id: 'scheduling',
    name: '档期/排期/资源预约',
    description: '影厅档期、资源预约、排期管理',
    icon: CalendarOutlined,
    defaultPath: '/stores',
    order: 5,
    status: 'normal', // ✅ API部分完成: StoreController, ReservationController, ActivityTypeController
    swimlane: 'master-data',
    functionLinks: [
      { name: '14-门店管理', path: '/stores', enabled: true }, // ✅ StoreController
      { name: '活动类型管理', path: '/activity-types', enabled: true }, // ✅ ActivityTypeController
      { name: '14-影厅资源管理', path: '/schedule/hall-resources', enabled: true }, // ✅ HallController
      { name: '排期管理', path: '/schedule/gantt', enabled: false }, // ❌ 未开发
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
    status: 'normal', // ✅ API已完成: OrderController, BeverageOrderController
    swimlane: 'transaction',
    functionLinks: [
      { name: 'U004-订单列表/状态查看', path: '/orders/list', enabled: true }, // ✅ OrderController
      { name: 'U001-预约单管理', path: '/reservation-orders', enabled: true }, // ✅ ReservationController
      { name: '二次确认队列', path: '/orders/confirmation', enabled: false }, // ❌ 未开发
      { name: '退款/改期/取消/回滚', path: '/orders/refund', enabled: false }, // ❌ 未开发
    ],
  },
  {
    id: 'inventory',
    name: '库存&仓店库存管理',
    description: '库存查询、调整、盘点',
    icon: DatabaseOutlined,
    defaultPath: '/inventory/query',
    order: 7,
    status: 'normal', // ✅ API已完成: InventoryController, InventoryAdjustmentController, StoreQueryController
    swimlane: 'transaction',
    functionLinks: [
      { name: 'I003-库存查询', path: '/inventory/query', enabled: true }, // ✅ InventoryController
      { name: 'I004-库存台账查看', path: '/inventory/ledger', enabled: true }, // ✅ InventoryTransactionController
      { name: 'I005-库存调整审批', path: '/inventory/approvals', enabled: true }, // ✅ ApprovalController
      { name: '库存预占/释放管理', path: '/inventory/reservation', enabled: true }, // ✅ InventoryReservationController
    ],
  },
  {
    id: 'procurement',
    name: '采购与入库管理',
    description: '采购订单、收货入库、供应商管理',
    icon: ShoppingCartOutlined,
    defaultPath: '/purchase-management/orders',
    order: 8,
    status: 'normal', // ✅ API已完成: PurchaseOrderController, GoodsReceiptController, SupplierController
    swimlane: 'transaction',
    functionLinks: [
      { name: '供应商管理', path: '/purchase-management/suppliers', enabled: true }, // ✅ SupplierController
      { name: '采购订单 (PO)', path: '/purchase-management/orders', enabled: true }, // ✅ PurchaseOrderController
      { name: '采购订单列表', path: '/purchase-management/orders/list', enabled: true }, // ✅ PurchaseOrderController
      { name: '到货验收 & 收货入库', path: '/purchase-management/receipts', enabled: true }, // ✅ GoodsReceiptController
    ],
  },

  // 泳道 4: 渠道营销
  {
    id: 'channels',
    name: '渠道商品配置',
    description: '渠道商品、配置管理',
    icon: CoffeeOutlined,
    defaultPath: '/channel-products/mini-program',
    order: 9,
    status: 'normal', // ✅ API已完成: ChannelProductController, MenuCategoryController
    swimlane: 'channel-marketing',
    functionLinks: [
      { name: '小程序商品', path: '/channel-products/mini-program', enabled: true }, // ✅ ChannelProductController
      { name: 'O002-菜单分类', path: '/menu-category', enabled: true }, // ✅ MenuCategoryController
      { name: '渠道配置', path: '/channels/config', enabled: false }, // ❌ 未开发
      { name: '渠道授权', path: '/channels/auth', enabled: false }, // ❌ 未开发
    ],
  },
  {
    id: 'packages',
    name: '场景包/套餐管理',
    description: '活动场景包、套餐配置',
    icon: GoldOutlined,
    defaultPath: '/scenario-packages',
    order: 10,
    status: 'normal', // ✅ API已完成: ScenarioPackageController, ComboController, ActivityTypeController
    swimlane: 'channel-marketing',
    functionLinks: [
      { name: '17-场景包模板管理', path: '/scenario-packages', enabled: true }, // ✅ ScenarioPackageController
      { name: '场景包模板管理', path: '/scenario-package/template', enabled: true }, // ✅ ScenarioPackageController
      { name: '内容组合配置', path: '/scenario-package/content', enabled: false }, // ❌ 未开发
      { name: '定价策略配置', path: '/scenario-package/pricing', enabled: false }, // ❌ 未开发
    ],
  },
  {
    id: 'pricing',
    name: '价格体系管理',
    description: '价目表、价格规则、定价策略',
    icon: DollarOutlined,
    defaultPath: '/pricing/price-list',
    order: 11,
    status: 'developing', // ❌ API未完成: 无PricingController
    swimlane: 'channel-marketing',
    functionLinks: [
      { name: '价目表管理', path: '/pricing/price-list', enabled: false }, // ❌ 未开发
      { name: '价格审核与生效', path: '/pricing/audit', enabled: false }, // ❌ 未开发
      { name: '价格规则配置', path: '/pricing/rules', enabled: false }, // ❌ 未开发
    ],
  },

  // 泳道 5: 支撑服务
  {
    id: 'reports',
    name: '运营&报表/指标看板',
    description: '数据分析、运营报表、指标监控',
    icon: BarChartOutlined,
    defaultPath: '/operations/launch-report',
    order: 12,
    status: 'developing', // ❌ API未完成: 无ReportController
    swimlane: 'support',
    functionLinks: [
      { name: '上新/发布时效报表', path: '/operations/launch-report', enabled: false }, // ❌ 未开发
      { name: '商品数据质量报表', path: '/operations/quality-report', enabled: false }, // ❌ 未开发
      { name: '销售/场景包表现分析', path: '/operations/sales-analysis', enabled: false }, // ❌ 未开发
      { name: '库存&订单&收入&成本汇总', path: '/operations/summary', enabled: false }, // ❌ 未开发
    ],
  },
];
