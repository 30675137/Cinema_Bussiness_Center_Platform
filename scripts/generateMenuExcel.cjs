const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 菜单数据
const menuItems = [
  {
    key: '/dashboard',
    label: '工作台',
    children: [],
  },
  {
    key: '/basic-settings',
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
    label: '商品管理 (MDM/PIM)',
    children: [
      {
        key: '/products/spu',
        label: 'SPU 管理',
      },
      {
        key: '/products/sku',
        label: 'SKU 管理',
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
    label: '场景包/套餐管理',
    children: [
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
    label: '库存 & 仓店库存管理',
    children: [
      {
        key: '/inventory/ledger',
        label: '库存台账查看',
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
    label: '档期/排期/资源预约',
    children: [
      {
        key: '/schedule/hall-resources',
        label: '影厅资源管理',
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
    key: '/orders',
    label: '订单与履约管理',
    children: [
      {
        key: '/orders/list',
        label: '订单列表/状态查看',
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
    ],
  },
  {
    key: '/operations',
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

// 转换为Excel数据
function convertToExcelData() {
  const data = [];
  let indexNumber = 1;

  // 添加表头
  data.push(['序号', '一级菜单', '二级菜单', '路由路径', '功能描述', '开发状态', '备注']);

  menuItems.forEach((menuItem) => {
    if (menuItem.children && menuItem.children.length > 0) {
      // 有子菜单
      menuItem.children.forEach((child, index) => {
        // 判断开发状态
        let developStatus = '待开发';
        
        // 已实现的功能
        const implementedRoutes = [
          '/purchase-management/suppliers',
          '/purchase-management/orders',
          '/purchase-management/orders/list',
          '/purchase-management/receipts/create',
          '/purchase-management/receipts',
          '/inventory/ledger',
        ];
        
        if (implementedRoutes.includes(child.key)) {
          developStatus = '已完成';
        }

        data.push([
          indexNumber++,
          index === 0 ? menuItem.label : '', // 只在第一个子菜单显示一级菜单
          child.label,
          child.key,
          '', // 功能描述
          developStatus,
          '', // 备注
        ]);
      });
    } else {
      // 没有子菜单
      let developStatus = '待开发';
      
      if (menuItem.key === '/dashboard') {
        developStatus = '已完成';
      }

      data.push([
        indexNumber++,
        menuItem.label,
        '-',
        menuItem.key,
        '', // 功能描述
        developStatus,
        '', // 备注
      ]);
    }
  });

  return data;
}

// 生成Excel文件
function generateExcel() {
  try {
    // 转换数据
    const data = convertToExcelData();

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    ws['!cols'] = [
      { wch: 8 },  // 序号
      { wch: 25 }, // 一级菜单
      { wch: 30 }, // 二级菜单
      { wch: 40 }, // 路由路径
      { wch: 30 }, // 功能描述
      { wch: 12 }, // 开发状态
      { wch: 20 }, // 备注
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '功能列表');

    // 确保输出目录存在
    const outputDir = path.join(__dirname, '..');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成文件名（带时间戳）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `影院业务中台功能列表_${timestamp}.xlsx`;
    const filePath = path.join(outputDir, fileName);

    // 写入文件
    XLSX.writeFile(wb, filePath);

    console.log(`✅ Excel文件生成成功！`);
    console.log(`📁 文件路径: ${filePath}`);
    console.log(`📊 共包含 ${data.length - 1} 个功能项`);

    // 统计信息
    const completedCount = data.slice(1).filter(row => row[5] === '已完成').length;
    const pendingCount = data.slice(1).filter(row => row[5] === '待开发').length;
    console.log(`\n📈 开发状态统计:`);
    console.log(`   已完成: ${completedCount}`);
    console.log(`   待开发: ${pendingCount}`);
    console.log(`   完成率: ${((completedCount / (completedCount + pendingCount)) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('❌ 生成Excel文件失败:', error);
    process.exit(1);
  }
}

// 执行生成
generateExcel();
