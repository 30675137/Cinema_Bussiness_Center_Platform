/**
 * Mock API服务
 * 用于开发阶段的模拟数据和API响应
 */

import {
  MenuItem,
  UserRole,
  Permission,
  FunctionalArea,
  PermissionCategory,
  UserPreference,
  NavigationAction,
  MenuLevel,
  PaginatedResponse,
  ApiResponse,
  MenuStats,
} from '@/types/navigation';
import { MenuQueryParams, CreateMenuParams, UpdateMenuParams } from './menuService';

/**
 * 模拟权限数据
 */
const mockPermissions: Permission[] = [
  {
    id: 'perm_admin_access',
    name: '管理员访问权限',
    code: 'admin.access',
    resource: 'admin',
    action: 'access',
    description: '系统管理员访问权限',
    category: PermissionCategory.ADMIN,
  },
  {
    id: 'perm_product_read',
    name: '商品查看权限',
    code: 'product.read',
    resource: 'product',
    action: 'read',
    description: '查看商品信息权限',
    category: PermissionCategory.READ,
  },
  {
    id: 'perm_product_write',
    name: '商品编辑权限',
    code: 'product.write',
    resource: 'product',
    action: 'write',
    description: '编辑商品信息权限',
    category: PermissionCategory.WRITE,
  },
  {
    id: 'perm_inventory_read',
    name: '库存查看权限',
    code: 'inventory.read',
    resource: 'inventory',
    action: 'read',
    description: '查看库存信息权限',
    category: PermissionCategory.READ,
  },
  {
    id: 'perm_inventory_write',
    name: '库存编辑权限',
    code: 'inventory.write',
    resource: 'inventory',
    action: 'write',
    description: '编辑库存信息权限',
    category: PermissionCategory.WRITE,
  },
  {
    id: 'perm_pricing_read',
    name: '价格查看权限',
    code: 'pricing.read',
    resource: 'pricing',
    action: 'read',
    description: '查看价格信息权限',
    category: PermissionCategory.READ,
  },
  {
    id: 'perm_pricing_write',
    name: '价格编辑权限',
    code: 'pricing.write',
    resource: 'pricing',
    action: 'write',
    description: '编辑价格信息权限',
    category: PermissionCategory.WRITE,
  },
];

/**
 * 模拟角色数据
 */
const mockRoles: UserRole[] = [
  {
    id: 'role_super_admin',
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    permissions: mockPermissions,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'role_department_admin',
    name: '部门管理员',
    code: 'department_admin',
    description: '部门管理权限',
    permissions: mockPermissions.filter((p) => p.category !== PermissionCategory.ADMIN),
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'role_operator',
    name: '业务操作员',
    code: 'operator',
    description: '负责日常业务操作',
    permissions: mockPermissions.filter((p) => p.category === PermissionCategory.READ),
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

/**
 * 模拟菜单数据
 */
const mockMenus: MenuItem[] = [
  // 基础设置与主数据
  {
    id: 'menu_basic_settings',
    parentId: undefined,
    name: '基础设置与主数据',
    code: 'basic_settings',
    icon: 'setting',
    path: '/basic-settings',
    level: MenuLevel.MAIN,
    sortOrder: 10,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.BASIC_SETTINGS,
    children: [
      {
        id: 'menu_org_management',
        parentId: 'menu_basic_settings',
        name: '组织/门店/仓库管理',
        code: 'org_management',
        path: '/basic-settings/org',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: ['admin.access'],
        isActive: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
      },
      {
        id: 'menu_unit_management',
        parentId: 'menu_basic_settings',
        name: '单位 & 换算规则管理',
        code: 'unit_management',
        path: '/basic-settings/unit',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: ['admin.access'],
        isActive: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
      },
      {
        id: 'menu_dictionary_config',
        parentId: 'menu_basic_settings',
        name: '字典与规则配置',
        code: 'dictionary_config',
        path: '/basic-settings/dictionary',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: ['admin.access'],
        isActive: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
      },
      {
        id: 'menu_role_permission',
        parentId: 'menu_basic_settings',
        name: '角色与权限管理',
        code: 'role_permission',
        path: '/basic-settings/permission',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: ['admin.access'],
        isActive: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
      },
      {
        id: 'menu_approval_flow',
        parentId: 'menu_basic_settings',
        name: '审批流配置',
        code: 'approval_flow',
        path: '/basic-settings/approval',
        level: MenuLevel.SUB,
        sortOrder: 5,
        requiredPermissions: ['admin.access'],
        isActive: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
      },
    ],
  },

  // 商品管理 (MDM / PIM)
  {
    id: 'menu_product_management',
    parentId: undefined,
    name: '商品管理 (MDM / PIM)',
    code: 'product_management',
    icon: 'product',
    path: '/product',
    level: MenuLevel.MAIN,
    sortOrder: 20,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
    children: [
      {
        id: 'menu_spu_management',
        parentId: 'menu_product_management',
        name: 'SPU 管理',
        code: 'spu_management',
        path: '/product/spu',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_sku_management',
        parentId: 'menu_product_management',
        name: 'SKU 管理',
        code: 'sku_management',
        path: '/product/sku',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: ['product.read'],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_attribute_spec',
        parentId: 'menu_product_management',
        name: '属性/规格/条码/单位设置',
        code: 'attribute_spec',
        path: '/product/attribute',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_product_status',
        parentId: 'menu_product_management',
        name: '商品状态/上下架管理',
        code: 'product_status',
        path: '/product/status',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_content_edit',
        parentId: 'menu_product_management',
        name: '内容编辑',
        code: 'content_edit',
        path: '/product/content',
        level: MenuLevel.SUB,
        sortOrder: 5,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_material_library',
        parentId: 'menu_product_management',
        name: '素材库管理',
        code: 'material_library',
        path: '/product/material',
        level: MenuLevel.SUB,
        sortOrder: 6,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_channel_mapping',
        parentId: 'menu_product_management',
        name: '渠道映射字段管理',
        code: 'channel_mapping',
        path: '/product/channel',
        level: MenuLevel.SUB,
        sortOrder: 7,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
      {
        id: 'menu_content_publish',
        parentId: 'menu_product_management',
        name: '内容发布/审核/历史版本管理',
        code: 'content_publish',
        path: '/product/publish',
        level: MenuLevel.SUB,
        sortOrder: 8,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
      },
    ],
  },

  // BOM / 配方 & 成本管理
  {
    id: 'menu_bom_management',
    parentId: undefined,
    name: 'BOM / 配方 & 成本管理',
    code: 'bom_management',
    icon: 'bom',
    path: '/bom',
    level: MenuLevel.MAIN,
    sortOrder: 30,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.BOM_MANAGEMENT,
    children: [
      {
        id: 'menu_material_master_data',
        parentId: 'menu_bom_management',
        name: '原料库 / 物料主数据',
        code: 'material_master_data',
        path: '/bom/material',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.BOM_MANAGEMENT,
      },
      {
        id: 'menu_bom_config',
        parentId: 'menu_bom_management',
        name: 'BOM/配方配置',
        code: 'bom_config',
        path: '/bom/config',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.BOM_MANAGEMENT,
      },
      {
        id: 'menu_unit_conversion',
        parentId: 'menu_bom_management',
        name: '单位换算 / 损耗率配置',
        code: 'unit_conversion',
        path: '/bom/unit-conversion',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.BOM_MANAGEMENT,
      },
      {
        id: 'menu_cost_estimation',
        parentId: 'menu_bom_management',
        name: '成本 / 毛利预估与校验',
        code: 'cost_estimation',
        path: '/bom/cost',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: ['pricing.read'],
        isActive: true,
        functionalArea: FunctionalArea.BOM_MANAGEMENT,
      },
      {
        id: 'menu_bom_version',
        parentId: 'menu_bom_management',
        name: 'BOM/配方版本管理 / 生效时间控制',
        code: 'bom_version',
        path: '/bom/version',
        level: MenuLevel.SUB,
        sortOrder: 5,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.BOM_MANAGEMENT,
      },
    ],
  },

  // 场景包/套餐管理
  {
    id: 'menu_scenario_package',
    parentId: undefined,
    name: '场景包/套餐管理 (Scenario Package)',
    code: 'scenario_package',
    icon: 'package',
    path: '/scenario-package',
    level: MenuLevel.MAIN,
    sortOrder: 40,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.SCENARIO_PACKAGE,
    children: [
      {
        id: 'menu_scenario_template',
        parentId: 'menu_scenario_package',
        name: '场景包模板管理',
        code: 'scenario_template',
        path: '/scenario-package/template',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.SCENARIO_PACKAGE,
      },
      {
        id: 'menu_resource_rules',
        parentId: 'menu_scenario_package',
        name: '适用资源/影厅/门店规则',
        code: 'resource_rules',
        path: '/scenario-package/resource',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: ['product.read'],
        isActive: true,
        functionalArea: FunctionalArea.SCENARIO_PACKAGE,
      },
      {
        id: 'menu_content_combination',
        parentId: 'menu_scenario_package',
        name: '内容组合',
        code: 'content_combination',
        path: '/scenario-package/content',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.SCENARIO_PACKAGE,
      },
      {
        id: 'menu_addon_strategy',
        parentId: 'menu_scenario_package',
        name: '加购策略管理',
        code: 'addon_strategy',
        path: '/scenario-package/addon',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.SCENARIO_PACKAGE,
      },
      {
        id: 'menu_scenario_pricing',
        parentId: 'menu_scenario_package',
        name: '定价策略 / 门店价 / 时段价 配置',
        code: 'scenario_pricing',
        path: '/scenario-package/pricing',
        level: MenuLevel.SUB,
        sortOrder: 5,
        requiredPermissions: ['pricing.write'],
        isActive: true,
        functionalArea: FunctionalArea.SCENARIO_PACKAGE,
      },
      {
        id: 'menu_package_version',
        parentId: 'menu_scenario_package',
        name: '场景包版本管理 / 生效控制',
        code: 'package_version',
        path: '/scenario-package/version',
        level: MenuLevel.SUB,
        sortOrder: 6,
        requiredPermissions: ['product.write'],
        isActive: true,
        functionalArea: FunctionalArea.SCENARIO_PACKAGE,
      },
    ],
  },

  // 价格体系管理
  {
    id: 'menu_pricing_system',
    parentId: undefined,
    name: '价格体系管理',
    code: 'pricing_system',
    icon: 'pricing',
    path: '/pricing',
    level: MenuLevel.MAIN,
    sortOrder: 50,
    requiredPermissions: ['pricing.read'],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.PRICING_SYSTEM,
    children: [
      {
        id: 'menu_price_list',
        parentId: 'menu_pricing_system',
        name: '价目表管理',
        code: 'price_list',
        path: '/pricing/price-list',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: ['pricing.read'],
        isActive: true,
        functionalArea: FunctionalArea.PRICING_SYSTEM,
      },
      {
        id: 'menu_price_review',
        parentId: 'menu_pricing_system',
        name: '价格审核与生效 / 回滚',
        code: 'price_review',
        path: '/pricing/review',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: ['pricing.write'],
        isActive: true,
        functionalArea: FunctionalArea.PRICING_SYSTEM,
      },
      {
        id: 'menu_price_rules',
        parentId: 'menu_pricing_system',
        name: '价格规则配置',
        code: 'price_rules',
        path: '/pricing/rules',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: ['pricing.write'],
        isActive: true,
        functionalArea: FunctionalArea.PRICING_SYSTEM,
      },
    ],
  },

  // 采购与入库管理
  {
    id: 'menu_procurement',
    parentId: undefined,
    name: '采购与入库管理',
    code: 'procurement',
    icon: 'shopping',
    path: '/procurement',
    level: MenuLevel.MAIN,
    sortOrder: 60,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.PROCUREMENT,
    children: [
      {
        id: 'menu_supplier_management',
        parentId: 'menu_procurement',
        name: '供应商管理',
        code: 'supplier_management',
        path: '/procurement/supplier',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.PROCUREMENT,
      },
      {
        id: 'menu_purchase_order',
        parentId: 'menu_procurement',
        name: 'Claude 采购订单管理',
        code: 'purchase_order',
        path: '/procurement/purchase-order',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.PROCUREMENT,
      },
      {
        id: 'menu_receiving',
        parentId: 'menu_procurement',
        name: '到货验收与收货',
        code: 'receiving',
        path: '/procurement/receiving',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.PROCUREMENT,
      },
      {
        id: 'menu_transfer_management',
        parentId: 'menu_procurement',
        name: '调拨管理',
        code: 'transfer_management',
        path: '/procurement/transfer',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.PROCUREMENT,
      },
    ],
  },

  // 库存与仓店库存管理
  {
    id: 'menu_inventory',
    parentId: undefined,
    name: '库存与仓店库存管理',
    code: 'inventory',
    icon: 'inbox',
    path: '/inventory',
    level: MenuLevel.MAIN,
    sortOrder: 70,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.INVENTORY,
    children: [
      {
        id: 'menu_stock_ledger',
        parentId: 'menu_inventory',
        name: '库存台账查看',
        code: 'stock_ledger',
        path: '/inventory/ledger',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.INVENTORY,
      },
      {
        id: 'menu_stock_operation',
        parentId: 'menu_inventory',
        name: '出入库操作',
        code: 'stock_operation',
        path: '/inventory/operation',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.INVENTORY,
      },
      {
        id: 'menu_stock_check',
        parentId: 'menu_inventory',
        name: '盘点管理',
        code: 'stock_check',
        path: '/inventory/check',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.INVENTORY,
      },
      {
        id: 'menu_stock_allocation',
        parentId: 'menu_inventory',
        name: '库存预占管理',
        code: 'stock_allocation',
        path: '/inventory/allocation',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.INVENTORY,
      },
    ],
  },

  // 档期/排期/资源预约管理
  {
    id: 'menu_scheduling',
    parentId: undefined,
    name: '档期/排期/资源预约管理',
    code: 'scheduling',
    icon: 'calendar',
    path: '/scheduling',
    level: MenuLevel.MAIN,
    sortOrder: 80,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.SCHEDULING,
    children: [
      {
        id: 'menu_hall_management',
        parentId: 'menu_scheduling',
        name: '影厅资源管理',
        code: 'hall_management',
        path: '/scheduling/hall',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SCHEDULING,
      },
      {
        id: 'menu_schedule_gantt',
        parentId: 'menu_scheduling',
        name: '甘特图排期',
        code: 'schedule_gantt',
        path: '/scheduling/gantt',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SCHEDULING,
      },
      {
        id: 'menu_schedule_calendar',
        parentId: 'menu_scheduling',
        name: '日历排期',
        code: 'schedule_calendar',
        path: '/scheduling/calendar',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SCHEDULING,
      },
      {
        id: 'menu_conflict_check',
        parentId: 'menu_scheduling',
        name: '冲突校验',
        code: 'conflict_check',
        path: '/scheduling/conflict',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SCHEDULING,
      },
    ],
  },

  // 订单与履约管理
  {
    id: 'menu_order_management',
    parentId: undefined,
    name: '订单与履约管理',
    code: 'order_management',
    icon: 'file',
    path: '/order-management',
    level: MenuLevel.MAIN,
    sortOrder: 90,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.ORDER_MANAGEMENT,
    children: [
      {
        id: 'menu_order_list',
        parentId: 'menu_order_management',
        name: '订单列表',
        code: 'order_list',
        path: '/order-management/list',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.ORDER_MANAGEMENT,
      },
      {
        id: 'menu_order_confirm',
        parentId: 'menu_order_management',
        name: '二次确认队列',
        code: 'order_confirm',
        path: '/order-management/confirm',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.ORDER_MANAGEMENT,
      },
      {
        id: 'menu_order_verification',
        parentId: 'menu_order_management',
        name: '核销管理',
        code: 'order_verification',
        path: '/order-management/verification',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.ORDER_MANAGEMENT,
      },
      {
        id: 'menu_order_refund',
        parentId: 'menu_order_management',
        name: '退款管理',
        code: 'order_refund',
        path: '/order-management/refund',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.ORDER_MANAGEMENT,
      },
      {
        id: 'menu_reservation_orders',
        parentId: 'menu_order_management',
        name: '预约单管理',
        code: 'reservation_orders',
        path: '/reservation-orders',
        level: MenuLevel.SUB,
        sortOrder: 5,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.ORDER_MANAGEMENT,
      },
    ],
  },

  // 运营 & 报表 / 指标看板
  {
    id: 'menu_operations_reports',
    parentId: undefined,
    name: '运营 & 报表 / 指标看板',
    code: 'operations_reports',
    icon: 'bar-chart',
    path: '/operations-reports',
    level: MenuLevel.MAIN,
    sortOrder: 100,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.OPERATIONS,
    children: [
      {
        id: 'menu_efficiency_report',
        parentId: 'menu_operations_reports',
        name: '上新/发布时效报表',
        code: 'efficiency_report',
        path: '/operations-reports/efficiency',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.OPERATIONS,
      },
      {
        id: 'menu_data_quality_report',
        parentId: 'menu_operations_reports',
        name: '商品数据质量报表',
        code: 'data_quality_report',
        path: '/operations-reports/data-quality',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.OPERATIONS,
      },
      {
        id: 'menu_stock_accuracy_report',
        parentId: 'menu_operations_reports',
        name: '库存准确性 / 盘点差异报表',
        code: 'stock_accuracy_report',
        path: '/operations-reports/stock-accuracy',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.OPERATIONS,
      },
      {
        id: 'menu_sales_analysis',
        parentId: 'menu_operations_reports',
        name: '销售/场景包表现分析',
        code: 'sales_analysis',
        path: '/operations-reports/sales-analysis',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.OPERATIONS,
      },
      {
        id: 'menu_resource_utilization',
        parentId: 'menu_operations_reports',
        name: '资源利用率 / 影厅利用率 / 排期使用率报表',
        code: 'resource_utilization',
        path: '/operations-reports/resource-utilization',
        level: MenuLevel.SUB,
        sortOrder: 5,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.OPERATIONS,
      },
      {
        id: 'menu_summary_reports',
        parentId: 'menu_operations_reports',
        name: '库存 & 订单 & 收入 & 成本汇总报表',
        code: 'summary_reports',
        path: '/operations-reports/summary',
        level: MenuLevel.SUB,
        sortOrder: 6,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.OPERATIONS,
      },
    ],
  },

  // 系统管理 / 设置 /权限
  {
    id: 'menu_system_management',
    parentId: undefined,
    name: '系统管理 / 设置 /权限',
    code: 'system_management',
    icon: 'safety',
    path: '/system',
    level: MenuLevel.MAIN,
    sortOrder: 110,
    requiredPermissions: [],
    isActive: true,
    isVisible: true,
    functionalArea: FunctionalArea.SYSTEM_MANAGEMENT,
    children: [
      {
        id: 'menu_system_user',
        parentId: 'menu_system_management',
        name: '系统用户管理',
        code: 'system_user',
        path: '/system/user',
        level: MenuLevel.SUB,
        sortOrder: 1,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SYSTEM_MANAGEMENT,
      },
      {
        id: 'menu_audit_log',
        parentId: 'menu_system_management',
        name: '审计日志查询',
        code: 'audit_log',
        path: '/system/audit',
        level: MenuLevel.SUB,
        sortOrder: 2,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SYSTEM_MANAGEMENT,
      },
      {
        id: 'menu_system_config',
        parentId: 'menu_system_management',
        name: '参数与规则配置',
        code: 'system_config',
        path: '/system/config',
        level: MenuLevel.SUB,
        sortOrder: 3,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SYSTEM_MANAGEMENT,
      },
      {
        id: 'menu_data_import_export',
        parentId: 'menu_system_management',
        name: '数据导入导出',
        code: 'data_import_export',
        path: '/system/import-export',
        level: MenuLevel.SUB,
        sortOrder: 4,
        requiredPermissions: [],
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.SYSTEM_MANAGEMENT,
      },
    ],
  },
];

/**
 * Mock API服务类
 */
export class MockApiService {
  private delay: number = 500; // 模拟网络延迟

  /**
   * 模拟网络延迟
   */
  private async delayMs(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * 创建成功响应
   */
  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      message: '操作成功',
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(message: string, code?: number): never {
    throw new Error(message);
  }

  /**
   * 获取可访问的导航菜单
   */
  async getAccessibleMenus(userId?: string, userPermissions?: string[]): Promise<MenuItem[]> {
    await this.delayMs();

    // 如果提供了用户权限，则进行权限过滤
    if (userPermissions && userPermissions.length > 0) {
      return this.filterMenusByPermissions(mockMenus, userPermissions);
    }

    return mockMenus;
  }

  /**
   * 根据权限过滤菜单
   */
  private filterMenusByPermissions(menus: MenuItem[], permissions: string[]): MenuItem[] {
    return menus
      .filter((menu) => {
        // 检查用户是否有访问该菜单的权限
        const hasPermission =
          menu.requiredPermissions.length === 0 ||
          menu.requiredPermissions.some((perm) => permissions.includes(perm));

        if (!hasPermission) {
          return false;
        }

        // 递归过滤子菜单
        if (menu.children && menu.children.length > 0) {
          menu.children = this.filterMenusByPermissions(menu.children, permissions);
        }

        return true;
      })
      .map((menu) => ({
        ...menu,
        children: menu.children || [],
      }));
  }

  /**
   * 搜索导航菜单（用户权限过滤版本）
   */
  async searchMenusWithPermissions(query: string, userPermissions?: string[]): Promise<MenuItem[]> {
    await this.delayMs();

    if (!query.trim()) {
      return [];
    }

    let searchableMenus = mockMenus;
    if (userPermissions) {
      searchableMenus = this.filterMenusByPermissions(mockMenus, userPermissions);
    }

    // 搜索菜单名称和代码
    const searchResults: MenuItem[] = [];
    const lowerQuery = query.toLowerCase();

    const searchInMenu = (menu: MenuItem) => {
      if (
        menu.name.toLowerCase().includes(lowerQuery) ||
        menu.code.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({ ...menu, children: [] }); // 返回扁平化的结果
      }

      if (menu.children) {
        menu.children.forEach(searchInMenu);
      }
    };

    searchableMenus.forEach(searchInMenu);
    return searchResults;
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(userId?: string): Promise<{ permissions: string[]; roles: UserRole[] }> {
    await this.delayMs();

    // 根据用户ID返回不同权限（这里简化处理）
    if (userId?.includes('admin')) {
      return {
        permissions: mockPermissions.map((p) => p.code),
        roles: [mockRoles[0]], // 超级管理员
      };
    } else if (userId?.includes('operator')) {
      return {
        permissions: mockPermissions
          .filter((p) => p.category === PermissionCategory.READ)
          .map((p) => p.code),
        roles: [mockRoles[2]], // 业务操作员
      };
    }

    return {
      permissions: [],
      roles: [],
    };
  }

  /**
   * 检查用户权限
   */
  async checkUserPermissions(
    permissions: string[],
    userId?: string
  ): Promise<{
    hasAllPermissions: boolean;
    permissionResults: Record<string, boolean>;
  }> {
    await this.delayMs();

    const userPerms = await this.getUserPermissions(userId);
    const permissionResults: Record<string, boolean> = {};

    permissions.forEach((perm) => {
      permissionResults[perm] = userPerms.permissions.includes(perm);
    });

    const hasAllPermissions = permissions.every((perm) => userPerms.permissions.includes(perm));

    return {
      hasAllPermissions,
      permissionResults,
    };
  }

  /**
   * 获取用户偏好设置
   */
  async getUserPreferences(userId: string): Promise<UserPreference> {
    await this.delayMs();

    return {
      id: `pref_${userId}`,
      userId,
      sidebarCollapsed: false,
      favoriteMenus: [],
      recentMenus: [],
      searchHistory: [],
      theme: 'light',
      language: 'zh-CN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 更新用户偏好设置
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreference>
  ): Promise<UserPreference> {
    await this.delayMs();

    const current = await this.getUserPreferences(userId);
    return {
      ...current,
      ...preferences,
      updatedAt: new Date(),
    };
  }

  /**
   * 添加收藏菜单
   */
  async addFavoriteMenu(userId: string, menuId: string): Promise<{ favoriteMenus: string[] }> {
    await this.delayMs();

    const current = await this.getUserPreferences(userId);
    const favoriteMenus = current.favoriteMenus.includes(menuId)
      ? current.favoriteMenus
      : [...current.favoriteMenus, menuId];

    return { favoriteMenus };
  }

  /**
   * 移除收藏菜单
   */
  async removeFavoriteMenu(userId: string, menuId: string): Promise<{ favoriteMenus: string[] }> {
    await this.delayMs();

    const current = await this.getUserPreferences(userId);
    const favoriteMenus = current.favoriteMenus.filter((id) => id !== menuId);

    return { favoriteMenus };
  }

  /**
   * 记录导航行为日志
   */
  async logNavigationAction(logData: {
    userId: string;
    menuId: string;
    menuPath: string;
    action: NavigationAction;
    duration?: number;
  }): Promise<{ logId: string }> {
    await this.delayMs();

    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 在实际应用中，这里会将日志发送到服务器
    console.log('Navigation Log:', {
      logId,
      ...logData,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      ipAddress: '127.0.0.1', // 实际应用中需要获取真实IP
    });

    return { logId };
  }

  // ==================== 菜单相关方法 ====================

  /**
   * 获取完整的菜单结构
   */
  async getCompleteMenus(): Promise<MenuItem[]> {
    await this.delayMs();
    return JSON.parse(JSON.stringify(mockMenus)); // 深拷贝避免修改原数据
  }

  /**
   * 根据查询参数获取菜单列表
   */
  async getMenus(params?: MenuQueryParams): Promise<MenuItem[]> {
    await this.delayMs();

    let menus = JSON.parse(JSON.stringify(mockMenus)); // 深拷贝

    if (!params) {
      return menus;
    }

    // 过滤条件
    if (params.level !== undefined) {
      menus = menus.filter((menu) => menu.level === params.level);
    }

    if (params.functionalArea !== undefined) {
      menus = menus.filter((menu) => menu.functionalArea === params.functionalArea);
    }

    if (params.isActive !== undefined) {
      menus = menus.filter((menu) => menu.isActive === params.isActive);
    }

    if (params.isVisible !== undefined) {
      menus = menus.filter((menu) => menu.isVisible === params.isVisible);
    }

    if (params.parentId !== undefined) {
      menus = menus.filter((menu) => menu.parentId === params.parentId);
    }

    // 排序
    if (params.sortBy) {
      menus.sort((a, b) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];

        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        }
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      });
    }

    return menus;
  }

  /**
   * 根据ID获取单个菜单
   */
  async getMenuById(id: string): Promise<MenuItem | null> {
    await this.delayMs();

    const findMenu = (menus: MenuItem[]): MenuItem | null => {
      for (const menu of menus) {
        if (menu.id === id) {
          return menu;
        }
        if (menu.children && menu.children.length > 0) {
          const found = findMenu(menu.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findMenu(mockMenus);
  }

  /**
   * 创建新菜单
   */
  async createMenu(params: CreateMenuParams): Promise<MenuItem> {
    await this.delayMs();

    const newMenu: MenuItem = {
      id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: params.name,
      code: params.code,
      icon: params.icon,
      path: params.path,
      level: params.level,
      parentId: params.parentId,
      sortOrder: params.sortOrder,
      requiredPermissions: [],
      isActive: true,
      isVisible: true,
      functionalArea: params.functionalArea,
      description: params.description,
      children: [],
    };

    // 在实际应用中，这里会保存到数据库
    mockMenus.push(newMenu);

    return newMenu;
  }

  /**
   * 更新菜单
   */
  async updateMenu(id: string, params: UpdateMenuParams): Promise<MenuItem> {
    await this.delayMs();

    const updateMenuRecursive = (menus: MenuItem[]): MenuItem | null => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus[i] = { ...menus[i], ...params };
          return menus[i];
        }
        if (menus[i].children && menus[i].children!.length > 0) {
          const found = updateMenuRecursive(menus[i].children!);
          if (found) return found;
        }
      }
      return null;
    };

    const updated = updateMenuRecursive(mockMenus);
    if (!updated) {
      throw new Error(`菜单 ${id} 不存在`);
    }

    return updated;
  }

  /**
   * 删除菜单
   */
  async deleteMenu(id: string): Promise<void> {
    await this.delayMs();

    const deleteMenuRecursive = (menus: MenuItem[]): boolean => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus.splice(i, 1);
          return true;
        }
        if (menus[i].children && menus[i].children!.length > 0) {
          if (deleteMenuRecursive(menus[i].children!)) {
            return true;
          }
        }
      }
      return false;
    };

    const deleted = deleteMenuRecursive(mockMenus);
    if (!deleted) {
      throw new Error(`菜单 ${id} 不存在`);
    }
  }

  /**
   * 批量更新菜单排序
   */
  async updateMenuSortOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    await this.delayMs();

    updates.forEach(({ id, sortOrder }) => {
      const updateRecursive = (menus: MenuItem[]): boolean => {
        for (const menu of menus) {
          if (menu.id === id) {
            menu.sortOrder = sortOrder;
            return true;
          }
          if (menu.children && menu.children.length > 0) {
            if (updateRecursive(menu.children)) {
              return true;
            }
          }
        }
        return false;
      };

      updateRecursive(mockMenus);
    });
  }

  /**
   * 获取菜单统计信息
   */
  async getMenuStats(): Promise<MenuStats> {
    await this.delayMs();

    const flatMenus = this.flattenMenus(mockMenus);

    const stats: MenuStats = {
      totalMenus: flatMenus.length,
      activeMenus: flatMenus.filter((menu) => menu.isActive).length,
      mainMenus: flatMenus.filter((menu) => menu.level === MenuLevel.MAIN).length,
      subMenus: flatMenus.filter((menu) => menu.level === MenuLevel.SUB).length,
      menusByArea: {} as Record<FunctionalArea, number>,
    };

    // 按功能区域统计
    Object.values(FunctionalArea).forEach((area) => {
      stats.menusByArea[area] = flatMenus.filter((menu) => menu.functionalArea === area).length;
    });

    return stats;
  }

  /**
   * 搜索菜单
   */
  async searchMenus(query: string, limit: number = 20): Promise<MenuItem[]> {
    await this.delayMs();

    if (!query.trim()) {
      return [];
    }

    const flatMenus = this.flattenMenus(mockMenus);
    const lowerQuery = query.toLowerCase();

    const results = flatMenus
      .filter(
        (menu) =>
          menu.name.toLowerCase().includes(lowerQuery) ||
          menu.code.toLowerCase().includes(lowerQuery) ||
          (menu.description && menu.description.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit);

    return results.map((menu) => ({ ...menu, children: [] })); // 返回扁平化结果
  }

  /**
   * 验证菜单代码唯一性
   */
  async validateMenuCode(code: string, excludeId?: string): Promise<boolean> {
    await this.delayMs();

    const flatMenus = this.flattenMenus(mockMenus);
    return !flatMenus.some((menu) => menu.code === code && menu.id !== excludeId);
  }

  /**
   * 导入菜单数据
   */
  async importMenus(menus: CreateMenuParams[]): Promise<{ success: number; failed: number }> {
    await this.delayMs();

    let success = 0;
    let failed = 0;

    for (const menuParams of menus) {
      try {
        await this.createMenu(menuParams);
        success++;
      } catch (error) {
        failed++;
        console.error(`导入菜单失败: ${menuParams.name}`, error);
      }
    }

    return { success, failed };
  }

  /**
   * 扁平化菜单树
   */
  private flattenMenus(menus: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];

    const flatten = (items: MenuItem[]) => {
      items.forEach((item) => {
        result.push({ ...item, children: [] }); // 扁平化时清空子菜单
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };

    flatten(menus);
    return result;
  }
}

/**
 * 导出Mock API服务实例
 */
export const mockApiService = new MockApiService();

/**
 * 导出mockApi别名（向后兼容）
 */
export const mockApi = mockApiService;

/**
 * 导出默认实例
 */
export default mockApiService;
